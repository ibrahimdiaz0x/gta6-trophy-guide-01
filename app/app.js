// Vice Coast Trophy Guide — plain client-side tracker, no build step.
// It fetches data/trophies.json, renders the 55 cards, and keeps the
// earned set in localStorage so progress survives a reload.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'vice-coast-trophies-v1';

const $ = (id) => document.getElementById(id);
const searchEl = $('search');
const gradeEl = $('grade');
const kindEl = $('kind');
const missableEl = $('missableOnly');
const hideEarnedEl = $('hideEarned');
const spoilersEl = $('spoilers');
const listEl = $('list');
const countEl = $('count');
const barEl = $('bar');
const progressEl = $('progress');

let trophies = [];
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
} catch {
  earned = new Set();
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function shownName(t) {
  if (t.hidden && !spoilersEl.checked && !earned.has(t.id)) return 'Hidden trophy';
  return t.name;
}
function shownDescription(t) {
  if (t.hidden && !spoilersEl.checked && !earned.has(t.id)) return 'A story trophy — its name is hidden until you earn it or turn spoilers on.';
  return t.description;
}
function shownGuide(t) {
  if (t.hidden && !spoilersEl.checked && !earned.has(t.id)) return 'Earn it in the story, or turn on “Show story spoilers” to read the guide.';
  return t.guide;
}

function matches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (missableEl.checked && !t.missable) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  return true;
}

function card(t) {
  const el = document.createElement('article');
  el.className = 'card';
  const name = document.createElement('h3');
  name.textContent = shownName(t);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = shownDescription(t);
  const badges = document.createElement('p');
  badges.className = 'badges';
  const grade = document.createElement('span');
  grade.className = 'badge grade-' + t.grade;
  grade.textContent = t.grade.toUpperCase();
  badges.append(grade);
  const kind = document.createElement('span');
  kind.className = 'badge kind';
  kind.textContent = t.kind.toUpperCase();
  badges.append(kind);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = 'MISSABLE';
    badges.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'badge hidden';
    h.textContent = 'HIDDEN';
    badges.append(h);
  }
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = shownGuide(t);
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = 'Sources: ' + t.sources.join(' · ');
  const label = document.createElement('label');
  label.className = 'earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  label.append(box, document.createTextNode(' Earned'));
  el.append(name, desc, badges, guide, src, label);
  return el;
}

function render() {
  const visible = trophies.filter(matches);
  listEl.replaceChildren(...visible.map(card));
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const total = trophies.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  barEl.style.width = pct + '%';
  progressEl.textContent = done + ' of ' + total + ' earned';
  const spoilerNote = spoilersEl.checked ? ' (spoilers shown)' : ' (story spoilers hidden)';
  countEl.textContent = 'Showing ' + visible.length + ' of ' + total + ' trophies' + spoilerNote;
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophies-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('no list');
      earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      save();
      render();
    } catch {
      alert('That file is not a progress export from this guide.');
    }
  };
  reader.readAsText(file);
}

for (const el of [searchEl, gradeEl, kindEl, missableEl, hideEarnedEl, spoilersEl]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}
$('exportBtn').addEventListener('click', exportProgress);
$('importFile').addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
  e.target.value = '';
});

const data = await fetch(DATA_URL).then((r) => r.json());
trophies = data.trophies;

// Deep links: #roadmap, #missables, #spoilers, #list. Filter checkboxes
// are set before the first render; scrolling happens after it, once the
// list exists and the page has its full height.
if (location.hash === '#missables') missableEl.checked = true;
else if (location.hash === '#spoilers') spoilersEl.checked = true;
render();
if (location.hash === '#roadmap') document.getElementById('roadmap').scrollIntoView();
else if (location.hash === '#missables' || location.hash === '#spoilers' || location.hash === '#list') document.querySelector('main').scrollIntoView();
