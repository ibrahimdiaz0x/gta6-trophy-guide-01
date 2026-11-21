const KEY = 'gta6-trophy-guide-v1';
const data = await fetch('data/trophies.json').then((r) => r.json());
const trophies = data.trophies;

const listEl = document.getElementById('list');
const countEl = document.getElementById('count');
const barEl = document.getElementById('bar');
const progressEl = document.getElementById('progress');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const missableOnly = document.getElementById('missableOnly');
const hideEarned = document.getElementById('hideEarned');
const spoilers = document.getElementById('spoilers');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
} catch {
  earned = new Set();
}
function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function kindLabel(kind) {
  return {
    story: 'Story', contact: 'Contacts', side: 'Strangers & side',
    activity: 'Activities', collectible: 'Collectibles', combat: 'Combat',
    exploration: 'Exploration', money: 'Money', secret: 'Secret',
    completion: 'Completion', platinum: 'Platinum'
  }[kind] || kind;
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const grade = gradeEl.value;
  const kind = kindEl.value;
  const showSpoilers = spoilers.checked;
  const visible = trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if (missableOnly.checked && !t.missable) return false;
    if (hideEarned.checked && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  listEl.replaceChildren();
  for (const t of visible) {
    const isEarned = earned.has(t.id);
    const isHidden = t.hidden && !showSpoilers && !isEarned;
    const card = document.createElement('article');
    card.className = 'card' + (isEarned ? ' earned' : '');
    const title = document.createElement('h3');
    title.textContent = isHidden ? 'Hidden trophy' : t.name;
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = isHidden ? 'A hidden story trophy. Turn on “Show story spoilers” to reveal it.' : t.description;
    const badges = document.createElement('div');
    badges.className = 'badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = 'badge ' + t.grade;
    gradeBadge.textContent = t.grade;
    badges.append(gradeBadge);
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge';
    kindBadge.textContent = kindLabel(t.kind);
    badges.append(kindBadge);
    if (t.missable) {
      const b = document.createElement('span');
      b.className = 'badge missable';
      b.textContent = 'Missable';
      badges.append(b);
    }
    if (t.hidden) {
      const b = document.createElement('span');
      b.className = 'badge hidden';
      b.textContent = 'Hidden';
      badges.append(b);
    }
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = isHidden ? 'Complete the story to reveal this trophy.' : t.guide;
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ' + t.sources.join(' · ');
    const label = document.createElement('label');
    label.className = 'earned';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save();
      render();
    });
    label.append(box, document.createTextNode(' Earned'));
    card.append(title, desc, badges, guide, sources, label);
    listEl.append(card);
  }

  countEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies` +
    (showSpoilers ? ' (spoilers shown)' : ' (story spoilers hidden)');
  progressEl.textContent = `${earned.size} of ${trophies.length} earned`;
  barEl.style.width = `${(earned.size / trophies.length) * 100}%`;
}

for (const el of [searchEl, gradeEl, kindEl, missableOnly, hideEarned, spoilers]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  try {
    const obj = JSON.parse(await file.text());
    const ids = Array.isArray(obj) ? obj : obj.earned;
    if (Array.isArray(ids)) {
      earned = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
      save();
      render();
    }
  } catch {
    alert('Could not read that progress file.');
  }
  importFile.value = '';
});

// Deep links: #roadmap, #missables, #spoilers, #list. Filters apply before
// the first render; scrolling happens after it, once the list exists.
if (location.hash === '#missables') {
  missableOnly.checked = true;
} else if (location.hash === '#spoilers') {
  spoilers.checked = true;
}
render();
if (location.hash === '#roadmap') {
  document.getElementById('roadmap').scrollIntoView();
} else if (location.hash === '#list' || location.hash === '#missables' || location.hash === '#spoilers') {
  document.querySelector('main').scrollIntoView();
}
