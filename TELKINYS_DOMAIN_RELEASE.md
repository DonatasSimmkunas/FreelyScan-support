# Telkinys V14 beta — domain promotion

Date: 2026-10-06.
User explicitly requested publishing the existing V14 beta to telkinys.lt.

## Promoted artifact
- Candidate commit: 052bc837c2da5fea265ba398c2b9c5f15c3a1cb9 (telkinys-v14-readiness).
- Candidate Render deploy: dep-db29gbjbc2fs73fpjen0, live on telkinys-v14-beta.onrender.com.
- Artifact: telkinys-deploy/index.html; exact existing Git blob cfc5afb154feb9e13a91f720ac31b23c0d756d3a.
- SHA-256: 2fc1190cfa45110be888192c28fb330b8d7f9d07d8530da4d0665f52fa30b58f; 96,663 bytes.
- Sources copied from candidate telkinys-v14 tree 87d5a8045d380bf8a79f09110951c4ec6037f99c. All eight modules passed syntax validation and a local rebuild was byte-identical to the candidate.
- Production service: srv-dat11qg473hc73e9vj10; branch telkinys-vercel-staging.
- Existing build command remains: rm -rf dist && mkdir -p dist && cp telkinys-deploy/index.html dist/index.html.
- Existing Render service, domains, DNS, pricing and backend are unchanged. No database migration is included.
- API remains https://telkinys.floot.app/_api/telkinys. The backend origin allowlist already includes https://telkinys.lt and https://www.telkinys.lt.

## Scope and access
This promotes the previously shown beta, not a claim of full production readiness. The closed-beta notice, invitation-only registration and noindex metadata remain. Payments, identity checks, AI and automatic email remain disabled. No credentials, invitation codes or private user data are included in this release.

## Rollback
- Backup branch: telkinys-v13-backup-20261006.
- Previous production commit: f97e9321191b132709fa980760aa078ab6f7eaf4.
- Previous live Render deploy: dep-dat2e4nlk1mc73e0ssgg.
- Previous HTML blob: 37d4022062fb36630f6b04d4f460e462a4f62c6e.
- For a code-only rollback, restore that previous HTML blob at telkinys-deploy/index.html in a new commit on telkinys-vercel-staging. Do not force-reset shared history. This rolls back the frontend only, not database records or backend files.

## Release verification
After promotion, confirm the production Render deploy reaches live and inspect telkinys.lt and www.telkinys.lt in a real browser: beta notice, removed hero diagram, public search, login/registration screens and API requests. Do not treat a successful build as proof that all authenticated workflows are tested. Earlier full two-user, backup/restore and security-readiness limitations still apply.
