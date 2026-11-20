// Vice Coast boot: loads the trophy list and roadmap, wires the tracker,
// the spoiler setting, export/import and hash routing. No network requests
// beyond the app's own files (./data/trophies.json, ./data/roadmap.json).
import { loadProgress, saveProgress, seedDemoProgress, downloadExport, readImportFile } from './store.js';
import { renderTrophyList, renderDetail, renderProgress } from './render.js';
import { renderRoadmap, renderMissables, renderAbout } from './roadmap.js';

const params = new URLSearchParams(location.search);
const trophiesUrl = './data/trophies.json';
const roadmapUrl = './data/roadmap.json';

const state = {
  earned: new Set(),
  counts: {},
  spoiler: false,
  kind: 'all',
  grade: 'all',
  query: '',
  earnedOnly: false,
  unconfirmedOnly: false,
  selectedId: null,
};

const els = {
  earnedCount: document.getElementById('earnedCount'),
  progressFill: document.getElementById('progressFill'),
  gradeBreakdown: document.getElementById('gradeBreakdown'),
  searchInput: document.getElementById('searchInput'),
  kindFilters: document.getElementById('kindFilters'),
  gradeFilter: document.getElementById('gradeFilter'),
  earnedOnly: document.getElementById('earnedOnly'),
  unconfirmedOnly: document.getElementById('unconfirmedOnly'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  filterSummary: document.getElementById('filterSummary'),
  onlineNote: document.getElementById('onlineNote'),
  trophyList: document.getElementById('trophyList'),
  emptyList: document.getElementById('emptyList'),
  detailPane: document.getElementById('detailPane'),
  roadmapList: document.getElementById('roadmapList'),
  missablesBox: document.getElementById('missablesBox'),
  aboutBox: document.getElementById('aboutBox'),
  views: {
    '': document.getElementById('trackerView'),
    roadmap: document.getElementById('roadmapView'),
    missables: document.getElementById('missablesView'),
    about: document.getElementById('aboutView'),
  },
};

let trophies = [];
let roadmap = null;

function persist() {
  saveProgress(state);
}

function selectedTrophy() {
  return trophies.find((trophy) => trophy.id === state.selectedId) || null;
}

function rerender() {
  renderProgress(els.earnedCount, els.progressFill, els.gradeBreakdown, trophies, state);
  renderTrophyList(
    els.trophyList,
    els.emptyList,
    els.filterSummary,
    els.onlineNote,
    trophies,
    state,
    { onSelect: selectTrophy, onToggleEarned: toggleEarned },
  );
  renderDetail(els.detailPane, selectedTrophy(), state, { onCount: changeCount });
  if (roadmap) {
    renderRoadmap(els.roadmapList, roadmap, trophies, state, selectTrophy);
    renderMissables(els.missablesBox, roadmap, trophies, state, selectTrophy);
    renderAbout(els.aboutBox, roadmap);
  }
}

function toggleEarned(id) {
  if (state.earned.has(id)) {
    state.earned.delete(id);
  } else {
    state.earned.add(id);
  }
  persist();
  rerender();
}

function changeCount(id, delta) {
  const next = Math.max(0, (state.counts[id] || 0) + delta);
  if (next === 0) {
    delete state.counts[id];
  } else {
    state.counts[id] = next;
  }
  persist();
  rerender();
}

function selectTrophy(id) {
  state.selectedId = id;
  if (location.hash !== `#/trophy/${id}`) {
    history.replaceState(null, '', `#/trophy/${id}`);
  }
  showView('');
  rerender();
}

function showView(route) {
  for (const [key, view] of Object.entries(els.views)) {
    view.hidden = key !== route;
  }
  for (const tab of document.querySelectorAll('#mainNav .nav-tab')) {
    tab.classList.toggle('is-active', tab.dataset.route === route);
  }
}

function routeFromHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('trophy/')) {
    const id = Number(hash.slice('trophy/'.length));
    if (Number.isInteger(id)) {
      state.selectedId = id;
      showView('');
      rerender();
      return;
    }
  }
  if (hash === 'roadmap' || hash === 'missables' || hash === 'about') {
    showView(hash);
    return;
  }
  showView('');
}

function wireToolbar() {
  els.searchInput.addEventListener('input', () => {
    state.query = els.searchInput.value;
    rerender();
  });
  els.kindFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    state.kind = button.dataset.kind;
    for (const chip of els.kindFilters.querySelectorAll('.chip')) {
      chip.classList.toggle('is-active', chip === button);
    }
    rerender();
  });
  els.gradeFilter.addEventListener('change', () => {
    state.grade = els.gradeFilter.value;
    rerender();
  });
  els.earnedOnly.addEventListener('change', () => {
    state.earnedOnly = els.earnedOnly.checked;
    rerender();
  });
  els.unconfirmedOnly.addEventListener('change', () => {
    state.unconfirmedOnly = els.unconfirmedOnly.checked;
    rerender();
  });
  els.spoilerToggle.addEventListener('change', () => {
    state.spoiler = els.spoilerToggle.checked;
    persist();
    rerender();
  });
  els.exportBtn.addEventListener('click', () => {
    downloadExport(saveProgress(state));
  });
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files[0];
    if (!file) return;
    try {
      const imported = await readImportFile(file);
      state.earned = new Set(imported.earned);
      state.counts = imported.counts;
      state.spoiler = imported.spoiler;
      els.spoilerToggle.checked = state.spoiler;
      persist();
      rerender();
    } catch {
      alert('That file is not a Vice Coast progress export.');
    }
    els.importFile.value = '';
  });
  for (const tab of document.querySelectorAll('#mainNav .nav-tab')) {
    tab.addEventListener('click', () => {
      const route = tab.dataset.route;
      history.replaceState(null, '', route === '' ? '#/' : `#/${route}`);
      showView(route);
    });
  }
  window.addEventListener('hashchange', routeFromHash);
}

async function boot() {
  const [trophyData, roadmapData] = await Promise.all([
    fetch(trophiesUrl).then((response) => response.json()),
    fetch(roadmapUrl).then((response) => response.json()),
  ]);
  trophies = trophyData.trophies;
  roadmap = roadmapData;

  const saved = loadProgress();
  if (saved) {
    state.earned = new Set(saved.earned);
    state.counts = saved.counts;
    state.spoiler = saved.spoiler;
  } else if (params.get('demo') === '1') {
    const demo = seedDemoProgress();
    state.earned = new Set(demo.earned);
    state.counts = demo.counts;
    state.spoiler = demo.spoiler;
  }
  if (params.get('spoilers') === 'on') state.spoiler = true;
  if (params.get('spoilers') === 'off') state.spoiler = false;
  els.spoilerToggle.checked = state.spoiler;

  wireToolbar();
  rerender();
  routeFromHash();
}

boot();
