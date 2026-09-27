/* An optional visual summary. The source record and full detail remain intact. */
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const pointer = matchMedia('(hover: hover) and (pointer: fine)');
const number = new Intl.NumberFormat('lt-LT');
let activeCard;
let frame = 0;
let serial = 0;

const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  return element;
};
const present = value => value !== null && value !== undefined && String(value).trim() !== '';
const values = value => (Array.isArray(value) ? value : String(value || '').split(';')).map(v => String(v).trim()).filter(Boolean);
const web = value => {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
};
function contact(value, kind) {
  const text = String(value).trim();
  const clean = text.replace(/[\s().-]/g, '');
  const href = kind === 'phone' ? (/^\+?\d{5,20}$/.test(clean) ? `tel:${clean}` : null)
    : (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(text) ? `mailto:${encodeURIComponent(text)}` : null);
  const element = node(href ? 'a' : 'span', 'hcard-contact', text);
  if (href) element.href = href;
  return element;
}
function fact(label, value) {
  const box = node('div', 'hcard-fact');
  box.append(node('span', 'hcard-fact-label', label), node('strong', '', present(value) ? value : 'Nenurodyta'));
  return box;
}
function resetTilt() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (!activeCard) return;
  activeCard.style.setProperty('--hcard-x', '0deg');
  activeCard.style.setProperty('--hcard-y', '0deg');
  activeCard.style.setProperty('--hcard-light-x', '50%');
  activeCard.style.setProperty('--hcard-light-y', '35%');
}
const animated = () => pointer.matches && !motion.matches && !document.body.classList.contains('effects-off');
new MutationObserver(() => { if (!animated()) resetTilt(); if(document.body.classList.contains('login-mode')){resetTilt();activeCard=null;} }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
document.addEventListener('close',event=>{if(event.target instanceof HTMLDialogElement&&activeCard&&event.target.contains(activeCard)){resetTilt();activeCard=null;}},true);
motion.addEventListener('change', resetTilt);
pointer.addEventListener('change', resetTilt);

window.addEventListener('vip:detail-ready', event => {
  const { record, employer, container } = event.detail || {};
  const target = container instanceof Element ? container : document.getElementById('detailContent');
  if (!record || !target) return;
  resetTilt();
  target.querySelector('.hcard-stage')?.remove();
  const id = `vip-hcard-${++serial}`;
  const stage = node('section', 'hcard-stage');
  stage.setAttribute('aria-label', 'Įrašo santrauka');
  const card = node('div', 'hcard-card');
  activeCard = card;
  const top = node('div', 'hcard-top');
  const emblem = node('span', 'hcard-emblem', String(record.provider || 'VIP').split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('lt-LT'));
  emblem.setAttribute('aria-hidden', 'true');
  const heading = node('div', 'hcard-heading');
  heading.append(node('span', 'hcard-eyebrow', 'HOLOGRAFINĖ KORTELĖ'), node('span', 'hcard-type', employer ? 'Įmonė · darbo pasiūlymai' : 'Paslaugų teikėjas'));
  top.append(emblem, heading);
  const tabs = node('div', 'hcard-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Santraukos sluoksniai');
  const panels = node('div', 'hcard-panels');
  const names = ['Kontaktai', 'Profilis', employer ? 'Darbai' : 'Įkainis'];
  const buttons = [], panes = [];
  function select(index, focus = false) {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      panes[i].hidden = i !== index;
    });
    if (focus) buttons[index].focus();
  }
  names.forEach((name, index) => {
    const button = node('button', 'hcard-tab', name);
    button.type = 'button';
    button.id = `${id}-tab-${index}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${id}-panel-${index}`);
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % names.length;
      if (event.key === 'ArrowLeft') next = (index + names.length - 1) % names.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = names.length - 1;
      if (next !== undefined) { event.preventDefault(); select(next, true); }
    });
    const panel = node('div', 'hcard-panel');
    panel.id = `${id}-panel-${index}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
    buttons.push(button); panes.push(panel); tabs.append(button); panels.append(panel);
  });

  const phones = values(record.company_phone), emails = values(record.company_email);
  const contacts = node('div', 'hcard-contact-grid');
  for (const [label, list, kind] of [['Telefonas', phones, 'phone'], ['El. paštas', emails, 'email']]) {
    const group = node('div', 'hcard-contact-group');
    group.append(node('span', 'hcard-fact-label', label));
    if (list.length) list.slice(0, 2).forEach(value => group.append(contact(value, kind)));
    else group.append(node('span', 'hcard-missing', 'Nenurodyta'));
    if (list.length > 2) group.append(node('span', 'hcard-note', `Dar ${number.format(list.length - 2)} – pilnoje informacijoje žemiau.`));
    contacts.append(group);
  }
  panes[0].append(contacts);

  const profile = node('div', 'hcard-facts');
  profile.append(fact('Kategorija', record.category || 'Kita'), fact('Vietovė', record.city_area || record.city || record.territory));
  if (present(record.company_code)) profile.append(fact('Įmonės kodas', record.company_code));
  if (present(record.legal_form)) profile.append(fact('Teisinė forma', record.legal_form));
  panes[1].append(profile);
  const profileUrl = web(values(record.profile_url)[0]);
  if (profileUrl) {
    const link = node('a', 'hcard-profile-link', `${new URL(profileUrl).hostname} ↗`);
    link.href = profileUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
    panes[1].append(link);
  }
  const sourceUrl = web(values(record.source_url || record.contact_source_url)[0]);
  if (sourceUrl && sourceUrl !== profileUrl) {
    const link = node('a', 'hcard-profile-link', `Šaltinis: ${new URL(sourceUrl).hostname} ↗`);
    link.href = sourceUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
    panes[1].append(link);
  }

  if (employer) {
    const jobs = Array.isArray(record.jobs) ? record.jobs : [];
    const reported = Number(record.jobs_count);
    const count = present(record.jobs_count) && Number.isFinite(reported) && reported >= 0 ? reported : jobs.length;
    panes[2].append(fact('Darbo skelbimai', number.format(count)));
    if (jobs.length) {
      const list = node('ul', 'hcard-jobs');
      jobs.slice(0, 2).forEach(job => list.append(node('li', '', job.title || 'Darbo pasiūlymas')));
      panes[2].append(list);
    }
    panes[2].append(node('p', 'hcard-note', 'Visi pateikti skelbimai ir jų nuorodos – žemiau.'));
  } else {
    panes[2].append(fact('Įkainis', present(record.price_raw) ? record.price_raw : (typeof record.price_value === 'number' ? `${number.format(record.price_value)} €` : 'Kaina nenurodyta')));
    if (present(record.price_unit)) panes[2].append(node('p', 'hcard-note', record.price_unit));
    panes[2].append(node('p', 'hcard-note', 'Rodomas šaltinyje pateiktas įkainis.'));
  }
  const footer = node('p', 'hcard-footnote', 'Pilna informacija ir duomenų šaltiniai žemiau');
  card.append(top, tabs, panels, footer); stage.append(card);
  const title = target.querySelector('.detail-category') || target.querySelector('.detail-title');
  if (title) title.after(stage); else target.prepend(stage);
  select(0);
  stage.addEventListener('pointermove', event => {
    if (!animated() || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      card.style.setProperty('--hcard-x', `${(0.5 - y) * 8}deg`);
      card.style.setProperty('--hcard-y', `${(x - 0.5) * 8}deg`);
      card.style.setProperty('--hcard-light-x', `${x * 100}%`);
      card.style.setProperty('--hcard-light-y', `${y * 100}%`);
    });
  });
  stage.addEventListener('pointerleave', resetTilt);
});
