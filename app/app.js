// Vice Coast Trophy Guide — offline checklist tracker.
// Loads data/trophies.json, renders one card per trophy, and stores the
// earned set in localStorage. No network calls, no build step.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'vice-coast-trophies-v2';
const EXPORT_NAME = 'vice-coast-trophy-progress.json';

const ui = {
  search: document.getElementById('search'),
  grade: document.getElementById('grade'),
  kind: document.getElementById('kind'),
  missableOnly: document.getElementById('missableOnly'),
  hideEarned: document.getElementById('hideEarned'),
  spoilers: document.getElementById('spoilers'),
  list: document.getElementById('list'),
  count: document.getElementById('count'),
  bar: document.getElementById('bar'),
  progress: document.getElementById('progress'),
};

const state = { trophies: [], earned: new Set() };

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if (Array.isArray(raw)) state.earned = new Set(raw.filter((n) => Number.isInteger(n)));
  } catch {
    state.earned = new Set();
  }
}
function storeEarned() {
  const ids = [...state.earned].sort((a, b) => a - b);
  localStorage.setItem(STORE_KEY, JSON.stringify(ids));
}
loadEarned();

// Story trophies hide their name, description and guide until earned or
// until the reader turns spoilers on — the point of the spoiler setting.
function displayName(t) {
  if (t.hidden && !ui.spoilers.checked && !state.earned.has(t.id)) return 'Hidden trophy';
  return t.name;
}
function displayDescription(t) {
  if (t.hidden && !ui.spoilers.checked && !state.earned.has(t.id)) return 'A story trophy — its name is hidden until you earn it or turn spoilers on.';
  return t.description;
}
function displayGuide(t) {
  if (t.hidden && !ui.spoilers.checked && !state.earned.has(t.id)) return 'Earn it in the story, or turn on “Show story spoilers” to read the guide.';
  return t.guide;
}

function isVisible(t) {
  const q = ui.search.value.trim().toLowerCase();
  if (q) {
    const haystack = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (ui.grade.value !== 'all' && t.grade !== ui.grade.value) return false;
  if (ui.kind.value !== 'all' && t.kind !== ui.kind.value) return false;
  if (ui.missableOnly.checked && !t.missable) return false;
  if (ui.hideEarned.checked && state.earned.has(t.id)) return false;
  return true;
}

function badge(text, extraClass) {
  const s = document.createElement('span');
  s.className = 'badge' + (extraClass ? ' ' + extraClass : '');
  s.textContent = text;
  return s;
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = 'card';
  const title = document.createElement('h3');
  title.textContent = displayName(t);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = displayDescription(t);
  const badges = document.createElement('p');
  badges.className = 'badges';
  badges.append(badge(t.grade.toUpperCase(), 'grade-' + t.grade));
  badges.append(badge(t.kind.toUpperCase(), 'kind'));
  if (t.missable) badges.append(badge('MISSABLE', 'missable'));
  if (t.hidden) badges.append(badge('HIDDEN', 'hidden'));
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = displayGuide(t);
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = 'Sources: ' + t.sources.join(' · ');
  const label = document.createElement('label');
  label.className = 'earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(t.id);
    else state.earned.delete(t.id);
    storeEarned();
    paint();
  });
  label.append(box, document.createTextNode(' Earned'));
  card.append(title, desc, badges, guide, src, label);
  return card;
}

function paint() {
  const visible = state.trophies.filter(isVisible);
  ui.list.replaceChildren(...visible.map(buildCard));
  const done = state.trophies.filter((t) => state.earned.has(t.id)).length;
  const total = state.trophies.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  ui.bar.style.width = pct + '%';
  ui.progress.textContent = done + ' of ' + total + ' earned';
  const note = ui.spoilers.checked ? ' (spoilers shown)' : ' (story spoilers hidden)';
  ui.count.textContent = 'Showing ' + visible.length + ' of ' + total + ' trophies' + note;
}

function downloadProgress() {
  const payload = { earned: [...state.earned].sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = EXPORT_NAME;
  link.click();
  URL.revokeObjectURL(link.href);
}

function uploadProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no list');
      state.earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      storeEarned();
      paint();
    } catch {
      alert('That file is not a progress export from this guide.');
    }
  };
  reader.readAsText(file);
}

for (const control of [ui.search, ui.grade, ui.kind, ui.missableOnly, ui.hideEarned, ui.spoilers]) {
  control.addEventListener('input', paint);
  control.addEventListener('change', paint);
}
document.getElementById('exportBtn').addEventListener('click', downloadProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) uploadProgress(file);
  event.target.value = '';
});

state.trophies = await fetch(DATA_URL).then((response) => response.json()).then((data) => data.trophies);

// Deep links: #roadmap, #missables, #spoilers, #list. The checkboxes are
// set before the first paint; the scroll runs after it, once the list
// exists and the page has reached its full height.
if (location.hash === '#missables') ui.missableOnly.checked = true;
else if (location.hash === '#spoilers') ui.spoilers.checked = true;
paint();
if (location.hash === '#roadmap') document.getElementById('roadmap').scrollIntoView();
else if (location.hash === '#missables' || location.hash === '#spoilers' || location.hash === '#list') document.querySelector('main').scrollIntoView();
