// Vice Coast Trophy Guide — boot and shell.
// The guide is a static offline app: it fetches only its own data files,
// keeps progress in localStorage, and renders the tracker, the roadmap,
// the missables and the sources from them.

import { loadGuideData, gradeCounts, DEMO_EARNED_IDS, trophyById } from './data.js';
import { createProgressStore } from './store.js';
import { renderTrackerList, renderDetailPane } from './render.js';
import { renderRoadmap, renderMissables, renderSources } from './roadmap.js';

const STORAGE_KEY = 'vice-coast-trophies-v1';
const VIEWS = ['tracker', 'roadmap', 'missables', 'sources'];

function readViewFromHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  return VIEWS.includes(hash) ? hash : 'tracker';
}

function applyDemoSeed(store, trophiesDoc) {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') !== '1') return;
  for (const id of DEMO_EARNED_IDS) {
    const trophy = trophyById(trophiesDoc, id);
    if (trophy) store.setEarned(trophy.name, true);
  }
  if (params.get('spoilers') === 'on') store.setSpoilers(true);
  if (params.get('spoilers') === 'off') store.setSpoilers(false);
}

function renderProgress(state, trophiesDoc, progressEl, countsEl) {
  const total = trophiesDoc.trophies.length;
  const earned = state.earned.size;
  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);
  progressEl.textContent = `${earned} of ${total} earned — ${percent}% to the platinum`;
  const counts = gradeCounts(trophiesDoc);
  const earnedByGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophiesDoc.trophies) {
    if (state.earned.has(trophy.name)) earnedByGrade[trophy.grade] += 1;
  }
  countsEl.textContent = `Platinum ${earnedByGrade.platinum}/${counts.platinum} · Gold ${earnedByGrade.gold}/${counts.gold} · Silver ${earnedByGrade.silver}/${counts.silver} · Bronze ${earnedByGrade.bronze}/${counts.bronze}`;
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = `${percent}%`;
}

async function bootViceCoastGuide() {
  const { trophies: trophiesDoc, roadmap: roadmapDoc } = await loadGuideData();
  const store = createProgressStore(STORAGE_KEY);
  const loaded = store.load();
  applyDemoSeed(store, trophiesDoc);

  const state = {
    earned: store.earned,
    spoilers: store.spoilers,
    kind: 'all',
    grade: 'all',
    query: '',
    show: 'all',
    view: readViewFromHash(),
    selected: null,
  };
  const params = new URLSearchParams(location.search);
  const openId = Number(params.get('open'));
  if (openId) {
    const trophy = trophyById(trophiesDoc, openId);
    if (trophy) state.selected = trophy.name;
  }
  if (params.get('view') && VIEWS.includes(params.get('view'))) state.view = params.get('view');

  const listEl = document.getElementById('trophy-list');
  const detailEl = document.getElementById('detail-pane');
  const viewEl = document.getElementById('view-pane');
  const trackerEl = document.getElementById('tracker-view');
  const progressEl = document.getElementById('progress');
  const countsEl = document.getElementById('grade-counts');
  const resultCountEl = document.getElementById('result-count');

  function refresh() {
    renderProgress(state, trophiesDoc, progressEl, countsEl);
    const navButtons = document.querySelectorAll('.nav-btn');
    for (const button of navButtons) {
      button.classList.toggle('is-active', button.dataset.view === state.view);
    }
    trackerEl.hidden = state.view !== 'tracker';
    viewEl.hidden = state.view === 'tracker';
    if (state.view === 'tracker') {
      const { shown, total } = renderTrackerList(listEl, trophiesDoc, ctx);
      resultCountEl.textContent = `Showing ${shown} of ${total} trophies`;
      renderDetailPane(detailEl, trophiesDoc, ctx);
    } else if (state.view === 'roadmap') {
      renderRoadmap(viewEl, trophiesDoc, roadmapDoc, ctx);
    } else if (state.view === 'missables') {
      renderMissables(viewEl, trophiesDoc, ctx);
    } else {
      renderSources(viewEl, trophiesDoc);
    }
  }

  function selectTrophy(name) {
    state.selected = name;
    state.view = 'tracker';
    location.hash = '#/tracker';
    refresh();
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const ctx = {
    state,
    get selected() { return state.selected; },
    onToggle(name, value) {
      store.setEarned(name, value);
      state.earned = store.earned;
      refresh();
    },
    onSelect: selectTrophy,
  };

  function setView(view) {
    state.view = view;
    location.hash = `#/${view}`;
    refresh();
  }

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });
  window.addEventListener('hashchange', () => {
    state.view = readViewFromHash();
    refresh();
  });

  document.getElementById('kind-filter').addEventListener('change', (event) => {
    state.kind = event.target.value;
    refresh();
  });
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    refresh();
  });
  document.getElementById('show-filter').addEventListener('change', (event) => {
    state.show = event.target.value;
    refresh();
  });
  document.getElementById('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    refresh();
  });

  const spoilerToggle = document.getElementById('spoiler-toggle');
  spoilerToggle.checked = state.spoilers;
  spoilerToggle.addEventListener('change', () => {
    store.setSpoilers(spoilerToggle.checked);
    state.spoilers = store.spoilers;
    refresh();
  });

  document.getElementById('export-btn').addEventListener('click', () => store.exportFile());
  const importInput = document.getElementById('import-file');
  importInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const statusEl = document.getElementById('import-status');
    try {
      const known = trophiesDoc.trophies.map((trophy) => trophy.name);
      const result = await store.importFile(file, known);
      state.earned = store.earned;
      statusEl.textContent = `Imported ${result.imported} trophies${result.rejected.length ? `, ignored ${result.rejected.length} unknown names` : ''}.`;
      refresh();
    } catch (error) {
      statusEl.textContent = `Import failed: ${error.message}`;
    }
    importInput.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      store.reset();
      state.earned = store.earned;
      state.selected = null;
      refresh();
    }
  });

  refresh();
}

bootViceCoastGuide().catch((error) => {
  const listEl = document.getElementById('trophy-list');
  if (listEl) listEl.textContent = `The guide could not load its data: ${error.message}`;
});
