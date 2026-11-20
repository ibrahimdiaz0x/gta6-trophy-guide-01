// Vice Coast Trophy Guide: tracker for the 55 official GTA VI trophies.
// Progress lives in localStorage, export/import moves it as a JSON file.
// Story trophies stay hidden while the spoiler setting is on and unearned.
const STORE_KEY = 'vice-coast-trophy-guide-v1';
const KIND_LABELS = {
  platinum: 'Platinum', story: 'Story', side: 'Side missions',
  activities: 'Activities', collectibles: 'Collectibles', crime: 'Crime & heists',
  money: 'Money & property', moments: 'Moments', completion: '100% completion',
};
const listEl = document.getElementById('list');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');

let earned = new Set(readStored());
let trophies = [];
let sourceCatalog = [];

function readStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.earned) ? parsed.earned : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    version: 1, earned: [...earned].sort(), exportedAt: new Date().toISOString(),
  }));
}

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isSpoilerHidden(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function trophyMatches(trophy) {
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  if (kindEl.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) {
    return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(trophy.name)) return false;
  return true;
}

function buildCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(trophy.name) ? ' earned' : '');
  const head = document.createElement('div');
  head.className = 'card-head';
  const title = document.createElement('h3');
  title.textContent = isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
  head.append(title);
  const grade = document.createElement('span');
  grade.className = 'grade ' + trophy.grade;
  grade.textContent = gradeWord(trophy.grade);
  head.append(grade);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = 'Possibly missable';
    head.append(flag);
  }
  if (!trophy.confirmed) {
    const flag = document.createElement('span');
    flag.className = 'flag unconfirmed';
    flag.textContent = 'Method unconfirmed';
    head.append(flag);
  }
  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = isSpoilerHidden(trophy)
    ? 'Hidden on PlayStation until earned. Tick it off here only after you earn it in the game.'
    : trophy.description;
  card.append(desc);

  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [KIND_LABELS[trophy.kind] || trophy.kind];
  if (trophy.count !== null && trophy.count !== undefined) bits.push('PSN count: ' + trophy.count);
  if (trophy.missable) bits.push('Do it before Chapter 1 ends');
  meta.textContent = bits.join(' · ');
  card.append(meta);

  const guide = document.createElement('p');
  guide.className = 'guide';
  if (isSpoilerHidden(trophy)) {
    guide.textContent = 'Guide hidden with the spoiler setting. Earn the trophy, tick it, and the guide appears.';
  } else {
    guide.textContent = trophy.guide;
  }
  card.append(guide);

  if (!isSpoilerHidden(trophy)) {
    const source = document.createElement('p');
    source.className = 'source';
    source.textContent = 'Source: ' + trophy.source + ' — ';
    const link = document.createElement('a');
    link.href = trophy.source_url;
    link.textContent = 'open the source';
    link.rel = 'noopener';
    source.append(link);
    card.append(source);
  }

  const earn = document.createElement('label');
  earn.className = 'earn';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveProgress();
    renderList();
    updateProgress();
  });
  earn.append(box);
  earn.append(document.createTextNode(box.checked ? 'Earned — ticked off' : 'Mark as earned'));
  card.append(earn);
  return card;
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  for (const trophy of shown) listEl.append(buildCard(trophy));
  countEl.textContent = shown.length === trophies.length
    ? `${trophies.length} trophies shown. Click a card's checkbox when you earn it; progress is saved in this browser.`
    : `${shown.length} of ${trophies.length} trophies match the current filters.`;
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'hidden-note';
    empty.textContent = 'No trophy matches. Clear the search or widen the filters.';
    listEl.append(empty);
  }
}

function updateProgress() {
  const total = trophies.length || 55;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('barFill').style.width = pct + '%';
  const byGrade = {};
  for (const t of trophies) {
    if (!earned.has(t.name)) continue;
    byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  }
  document.getElementById('gradeText').textContent =
    `Earned so far — Platinum ${byGrade.platinum || 0}/1 · Gold ${byGrade.gold || 0}/2 · Silver ${byGrade.silver || 0}/6 · Bronze ${byGrade.bronze || 0}/46. ` +
    `${trophies.length - done} to go.`;
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const source of sourceCatalog) {
    const li = document.createElement('li');
    li.textContent = source.name + ' — ';
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.url;
    link.rel = 'noopener';
    li.append(link);
    ul.append(li);
  }
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, earned: [...earned].sort() }, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'gta6-trophy-progress.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function importProgress(file) {
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    countEl.textContent = 'That file is not valid JSON. Nothing was imported.';
    return;
  }
  const names = new Set(trophies.map((t) => t.name));
  const incoming = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(incoming)) {
    countEl.textContent = 'That file has no earned list. Nothing was imported.';
    return;
  }
  const kept = incoming.filter((name) => names.has(name));
  earned = new Set(kept);
  saveProgress();
  renderList();
  updateProgress();
  countEl.textContent = `Imported ${kept.length} earned trophies (${incoming.length - kept.length} unknown names skipped).`;
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Clear every tick in this guide? Export first if you want a backup.')) return;
  earned = new Set();
  saveProgress();
  renderList();
  updateProgress();
});
for (const control of [searchEl, kindEl, gradeEl, spoilerEl, hideEarnedEl]) {
  control.addEventListener('input', renderList);
  control.addEventListener('change', renderList);
}

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
sourceCatalog = doc.sources || [];
renderSources();
renderList();
updateProgress();
