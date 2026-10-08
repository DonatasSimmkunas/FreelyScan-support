"""Restore Telkinys backups ONLY into a fresh, disposable local PostgreSQL container.
No production database credentials, private artifacts, or user data are printed.
The source is the authenticated Telkinys backup service, not a caller-supplied URL.
"""
import hashlib
import json
import os
import re
import secrets
import subprocess
import time
import urllib.request

API = 'https://telkinys.floot.app/_api/telkinys-ops'
PROJECT = '5b325205-4684-4080-b798-7236728d2e1a'
CONTAINER = 'telkinys-restore-' + os.environ.get('GITHUB_RUN_ID', 'local')
LIMIT = 33 * 1024 * 1024

def fetch(url, data=None, headers=None, limit=LIMIT, timeout=120):
    request = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read(limit + 1)
        if len(body) > limit:
            raise RuntimeError('Response exceeds the verification size limit')
        return body

def oidc():
    url = os.environ['ACTIONS_ID_TOKEN_REQUEST_URL'] + '&audience=telkinys-operations'
    headers = {'Authorization': 'Bearer ' + os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']}
    token = json.loads(fetch(url, headers=headers, limit=20000))['value']
    print('::add-mask::' + token, flush=True)
    return token

def operation(body):
    return json.loads(fetch(API, data=json.dumps(body).encode(), headers={
        'Authorization': 'Bearer ' + oidc(), 'Content-Type': 'application/json'
    }, timeout=700))

def ident(name):
    if not isinstance(name, str) or not re.fullmatch('[a-z][a-z0-9_]*', name):
        raise RuntimeError('Invalid schema identifier')
    return '"' + name + '"'

def literal(text):
    return "'" + str(text).replace("'", "''") + "'"

def sql(text, label):
    result = subprocess.run(['docker', 'exec', '-i', CONTAINER, 'psql', '-X', '-q', '-A', '-t',
        '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], input=text,
        text=True, capture_output=True, timeout=120)
    if result.returncode:
        raise RuntimeError('Isolated restore SQL failed during ' + label)
    return result.stdout.strip()

def canonical(rows):
    return sorted(json.dumps(row, sort_keys=True, ensure_ascii=True, separators=(',', ':')) for row in rows)

def main():
    bundle = operation({'op': 'run'})
    print('::add-mask::' + bundle['url'], flush=True)
    raw = fetch(bundle['url'])
    sha = hashlib.sha256(raw).hexdigest()
    if sha != bundle['sha256'] or len(raw) != bundle['bytes']:
        raise RuntimeError('Backup byte digest or size does not match')
    snapshot = json.loads(raw)
    if snapshot.get('format') != 'telkinys-backup-v1' or snapshot.get('project') != PROJECT or snapshot.get('schema') != 'telkinys':
        raise RuntimeError('Wrong backup format or source project')
    password = secrets.token_urlsafe(32)
    print('::add-mask::' + password, flush=True)
    # Match production PostgreSQL 18; no published ports or persistent volume.
    start = subprocess.run(['docker', 'run', '-d', '--name', CONTAINER,
        '-e', 'POSTGRES_PASSWORD=' + password, 'postgres:18'], capture_output=True, text=True, timeout=180)
    if start.returncode:
        raise RuntimeError('Could not start the disposable PostgreSQL database')
    try:
        for _ in range(40):
            ready = subprocess.run(['docker', 'exec', CONTAINER, 'pg_isready', '-U', 'postgres'], capture_output=True)
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('Disposable database did not become ready')
        sql("SET standard_conforming_strings=on; CREATE SCHEMA telkinys; REVOKE ALL ON SCHEMA telkinys FROM PUBLIC;", 'schema')
        for enum in snapshot['types']:
            sql('CREATE TYPE telkinys.' + ident(enum['name']) + ' AS ENUM (' + ','.join(literal(v) for v in enum['values']) + ');', 'enum')
        names = [table['name'] for table in snapshot['tables']]
        if len(names) != len(set(names)) or not 20 <= len(names) <= 100:
            raise RuntimeError('Invalid table inventory')
        for table in snapshot['tables']:
            columns = []
            for col in table['columns']:
                if col.get('identity') or col.get('generated'):
                    raise RuntimeError('Unsupported generated column')
                definition = ident(col['name']) + ' ' + col['type']
                if col['default_value'] is not None:
                    definition += ' DEFAULT ' + col['default_value']
                if col['required']:
                    definition += ' NOT NULL'
                columns.append(definition)
            sql('CREATE TABLE telkinys.' + ident(table['name']) + '(' + ','.join(columns) + ');', 'table ' + table['name'])
        for table in snapshot['tables']:
            if table['rows']:
                name = 'telkinys.' + ident(table['name'])
                for offset in range(0, len(table['rows']), 500):
                    data = json.dumps(table['rows'][offset:offset + 500], ensure_ascii=True)
                    sql('INSERT INTO ' + name + ' SELECT * FROM jsonb_populate_recordset(NULL::' + name + ',' + literal(data) + '::jsonb);', 'data ' + table['name'])
        for foreign in (False, True):
            for table in snapshot['tables']:
                for constraint in table['constraints']:
                    # PostgreSQL 18 reports NOT NULL as a constraint. Already recreated from columns.
                    if constraint['type'] == 'n':
                        continue
                    if (constraint['type'] == 'f') == foreign:
                        sql('ALTER TABLE telkinys.' + ident(table['name']) + ' ADD CONSTRAINT ' + ident(constraint['name']) + ' ' + constraint['definition'] + ';', 'constraint ' + table['name'])
        for fn in snapshot['functions']:
            sql(fn['definition'], 'function ' + fn['name'])
        for trigger in snapshot['triggers']:
            sql(trigger['definition'] + ';', 'trigger ' + trigger['name'])
        for index in snapshot['indexes']:
            sql(index['definition'] + ';', 'index ' + index['name'])
        total = 0
        for table in snapshot['tables']:
            restored = json.loads(sql("SELECT COALESCE(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM telkinys." + ident(table['name']) + ' t;', 'roundtrip ' + table['name']))
            if canonical(restored) != canonical(table['rows']):
                raise RuntimeError('Restored row values differ in ' + table['name'])
            expected_required = sorted(col['name'] for col in table['columns'] if col['required'])
            required_sql = "SELECT COALESCE(jsonb_agg(column_name ORDER BY column_name),'[]'::jsonb) FROM information_schema.columns WHERE table_schema='telkinys' AND table_name=" + literal(table['name']) + " AND is_nullable='NO';"
            if json.loads(sql(required_sql, 'not-null verification')) != expected_required:
                raise RuntimeError('Restored NOT NULL constraints differ')
            total += len(restored)
        if total != snapshot['totalRows']:
            raise RuntimeError('Restored row total differs')
        urls = {entry['imageId']: entry for entry in bundle.get('files', [])}
        for file in snapshot['files']:
            entry = urls.get(file['imageId'])
            if not entry:
                raise RuntimeError('Missing private file download')
            print('::add-mask::' + entry['url'], flush=True)
            data = fetch(entry['url'], limit=2000000)
            if len(data) != file['size'] or hashlib.sha256(data).hexdigest() != file['sha256']:
                raise RuntimeError('Restored photo digest differs')
        report = {'format': 'telkinys-restore-v1', 'ok': True, 'sha256': sha,
                  'tables': len(names), 'rows': total, 'files': len(snapshot['files'])}
        result = operation({'op': 'verified', 'backupId': bundle['id'], 'report': report})
        if result.get('ok') is not True:
            raise RuntimeError('Server did not accept the restore verification')
        print(json.dumps({'ok': True, 'backupId': bundle['id'], **report}), flush=True)
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
            summary.write('## Telkinys backup verified\n\nPrivate snapshot restored into a disposable PostgreSQL database. All row values, constraints, indexes and any included photo digests checked.\n\n')
            summary.write(f'Tables: {len(names)}; rows: {total}; photos: {len(snapshot["files"])}. No private data was uploaded as an artifact.\n')
    finally:
        subprocess.run(['docker', 'rm', '-f', CONTAINER], capture_output=True, timeout=30)

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        message = str(error) if isinstance(error, RuntimeError) else type(error).__name__
        print('::error::Telkinys backup verification failed: ' + message, flush=True)
        raise SystemExit(1)
