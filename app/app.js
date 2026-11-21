// Vice Coast Trophy Guide — client-side tracker, no build step, no network.
// Loads data/trophies.json, draws the 55 trophy cards, and remembers which
// ones you ticked in localStorage. Nothing is sent anywhere.

const DATA_PATH = 'data/trophies.json';
const SAVE_KEY = 'vice-coast-trophy-progress-v1';

const grab = (id) => document.getElementById(id);
const queryBox = grab('search');
const gradePick = grab('grade');
const kindPick = grab('kind');
const missableBox = grab('missableOnly');
const hideDoneBox = grab('hideEarned');
const spoilerBox = grab('spoilers');
const grid = grab('list');
const tallyLine = grab('count');
const fill = grab('bar');
const tally = grab('progress');

let catalog = [];
let done = new Set();
try {
  done = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
} catch {
  done = new Set();
}
function persist() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...done].sort((a, b) => a - b)));
}

function displayName(item) {
  if (item.hidden && !spoilerBox.checked && !done.has(item.id)) return 'Hidden trophy';
  return item.name;
}
function displayBlurb(item) {
  if (item.hidden && !spoilerBox.checked && !done.has(item.id)) return 'A story trophy — its name stays hidden until you earn it or switch spoilers on.';
  return item.description;
}
function displayGuide(item) {
  if (item.hidden && !spoilerBox.checked && !done.has(item.id)) return 'Earn it in the story, or switch on “Show story spoilers” to read the guide.';
  return item.guide;
}

function passesFilters(item) {
  const needle = queryBox.value.trim().toLowerCase();
  if (needle) {
    const haystack = `${item.name} ${item.description} ${item.guide} ${item.kind}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (gradePick.value !== 'all' && item.grade !== gradePick.value) return false;
  if (kindPick.value !== 'all' && item.kind !== kindPick.value) return false;
  if (missableBox.checked && !item.missable) return false;
  if (hideDoneBox.checked && done.has(item.id)) return false;
  return true;
}

function pill(text, extra) {
  const tag = document.createElement('span');
  tag.className = 'pill ' + extra;
  tag.textContent = text;
  return tag;
}

function buildCard(item) {
  const card = document.createElement('article');
  card.className = 'trophy-card';
  const title = document.createElement('h3');
  title.textContent = displayName(item);
  const blurb = document.createElement('p');
  blurb.className = 'blurb';
  blurb.textContent = displayBlurb(item);
  const pills = document.createElement('p');
  pills.className = 'pills';
  pills.append(pill(item.grade.toUpperCase(), 'grade-' + item.grade), pill(item.kind.toUpperCase(), 'kind'));
  if (item.missable) pills.append(pill('MISSABLE', 'missable'));
  if (item.hidden) pills.append(pill('HIDDEN', 'hidden'));
  const howto = document.createElement('p');
  howto.className = 'howto';
  howto.textContent = displayGuide(item);
  const cite = document.createElement('p');
  cite.className = 'cite';
  cite.textContent = 'Sources: ' + item.sources.join(' · ');
  const tick = document.createElement('label');
  tick.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = done.has(item.id);
  box.addEventListener('change', () => {
    if (box.checked) done.add(item.id); else done.delete(item.id);
    persist();
    renderList();
  });
  tick.append(box, document.createTextNode(' Earned'));
  card.append(title, blurb, pills, howto, cite, tick);
  return card;
}

function renderList() {
  const visible = catalog.filter(passesFilters);
  grid.replaceChildren(...visible.map(buildCard));
  const earned = catalog.filter((item) => done.has(item.id)).length;
  const total = catalog.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  fill.style.width = pct + '%';
  tally.textContent = earned + ' of ' + total + ' earned';
  const spoilerNote = spoilerBox.checked ? ' (spoilers shown)' : ' (story spoilers hidden)';
  tallyLine.textContent = 'Showing ' + visible.length + ' of ' + total + ' trophies' + spoilerNote;
}

function downloadProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...done].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'vice-coast-progress.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function uploadProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no list');
      done = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      persist();
      renderList();
    } catch {
      alert('That file is not a progress export from this guide.');
    }
  };
  reader.readAsText(file);
}

for (const control of [queryBox, gradePick, kindPick, missableBox, hideDoneBox, spoilerBox]) {
  control.addEventListener('input', renderList);
  control.addEventListener('change', renderList);
}
grab('exportBtn').addEventListener('click', downloadProgress);
grab('importFile').addEventListener('change', (event) => {
  if (event.target.files && event.target.files[0]) uploadProgress(event.target.files[0]);
  event.target.value = '';
});

const payload = await fetch(DATA_PATH).then((response) => response.json());
catalog = payload.trophies;

// Deep links: #roadmap, #missables, #spoilers, #list. The checkboxes are
// set before the first render; scrolling waits until after it, once the
// grid exists and the page has its full height.
if (location.hash === '#missables') missableBox.checked = true;
else if (location.hash === '#spoilers') spoilerBox.checked = true;
renderList();
if (location.hash === '#roadmap') document.getElementById('roadmap').scrollIntoView();
else if (location.hash === '#missables' || location.hash === '#spoilers' || location.hash === '#list') document.querySelector('main').scrollIntoView();
