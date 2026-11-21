// Vice Coast Trophy Guide: a checklist of all 55 official GTA VI trophies.
// Progress is ticked off and saved in this browser (localStorage); export and
// import move the ticks to another device. Hidden story trophies stay secret
// until earned, unless the spoiler setting is on. Views can be deep-linked:
// #roadmap scrolls to the roadmap, #missables filters to the missable trophy,
// #spoilers shows the hidden trophies.
const KEY = 'gta6-trophy-guide-v1';
const list = document.getElementById('list');
const search = document.getElementById('search');
const grade = document.getElementById('grade');
const kind = document.getElementById('kind');
const missableOnly = document.getElementById('missableOnly');
const hideEarned = document.getElementById('hideEarned');
const spoilers = document.getElementById('spoilers');
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
const doc = await (await fetch('data/trophies.json')).json();

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function visible(t) {
  if (grade.value !== 'all' && t.grade !== grade.value) return false;
  if (kind.value !== 'all' && t.kind !== kind.value) return false;
  if (missableOnly.checked && !t.missable) return false;
  if (hideEarned.checked && earned.has(t.name)) return false;
  const q = search.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
  return true;
}

function render() {
  list.replaceChildren();
  let shown = 0;
  for (const t of doc.trophies) {
    if (!visible(t)) continue;
    shown++;
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
    const isSecret = t.hidden && !spoilers.checked && !earned.has(t.name);
    const badges = `<span class="badge ${t.grade}">${t.grade}</span>` +
      `<span class="badge kind">${t.kind}</span>` +
      (t.missable ? '<span class="badge missable">Missable</span>' : '') +
      (t.hidden ? '<span class="badge hidden">Hidden</span>' : '');
    card.innerHTML = `<h3>${isSecret ? 'Hidden trophy' : t.name}</h3>` +
      `<p class="desc">${isSecret ? 'A hidden story trophy. Earn it to reveal the name and description.' : t.description}</p>` +
      badges +
      (isSecret
        ? '<p class="guide secret">Hidden until earned — turn on “Show story spoilers” to reveal it.</p>'
        : `<p class="guide">${t.guide}</p>`) +
      `<p class="sources">Sources: ${(t.sources || []).join(' · ')}</p>`;
    const earn = document.createElement('label');
    earn.className = 'earn';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      render();
    });
    earn.append(box, document.createTextNode('Earned'));
    card.append(earn);
    list.append(card);
  }
  document.getElementById('progress').textContent = `${earned.size} of ${doc.trophies.length} earned`;
  document.getElementById('bar').style.width = `${(earned.size / doc.trophies.length) * 100}%`;
  document.getElementById('count').textContent = `Showing ${shown} of ${doc.trophies.length} trophies` +
    (spoilers.checked ? ' (spoilers shown)' : ' (story spoilers hidden)');
}

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned])], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  earned = new Set(JSON.parse(await file.text()));
  save();
  render();
});
for (const el of [search, grade, kind, missableOnly, hideEarned, spoilers]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}

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
