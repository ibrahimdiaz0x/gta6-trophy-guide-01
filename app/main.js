// Vice Coast Trophy Guide: boot, state, controls, hash routing and progress wiring.
import { buildExportFile, loadProgress, parseImportFile, saveProgress } from './store.js';
import { applyFilters } from './filters.js';
import { renderMissables, renderProgress, renderRoadmap, renderTrophyList } from './render.js';

const DEMO_EARNED = [2, 15, 16, 17, 20, 21, 28, 33, 35, 42, 44, 46, 53];

function readHash() {
  const raw = location.hash || '';
  const view = raw.includes('roadmap') ? 'roadmap' : raw.includes('missables') ? 'missables' : 'tracker';
  const trophyMatch = raw.match(/trophy-(\d+)/);
  return { view, demo: raw.includes('demo'), spoilers: raw.includes('spoilers'), openId: trophyMatch ? Number(trophyMatch[1]) : null };
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function boot() {
  const trophiesData = await loadJson('data/trophies.json');
  const roadmapData = await loadJson('data/roadmap.json');
  const trophies = trophiesData.trophies;
  const trophiesById = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const hash = readHash();

  const state = {
    trophies,
    earned: loadProgress(),
    kind: 'all',
    grade: 'all',
    search: '',
    spoiler: hash.spoilers,
    earnedOnly: false,
    openId: hash.openId,
    view: hash.view,
  };
  if (hash.demo && state.earned.size === 0) {
    state.earned = new Set(DEMO_EARNED);
    saveProgress(state.earned);
  }

  const els = {
    progressLine: document.getElementById('progress-line'),
    progressFill: document.getElementById('progress-fill'),
    gradeCounts: document.getElementById('grade-counts'),
    trophyList: document.getElementById('trophy-list'),
    emptyNote: document.getElementById('empty-note'),
    roadmap: document.getElementById('roadmap'),
    missableList: document.getElementById('missable-list'),
    search: document.getElementById('search'),
    kind: document.getElementById('kind'),
    grade: document.getElementById('grade'),
    spoiler: document.getElementById('spoiler'),
    earnedOnly: document.getElementById('earned-only'),
    exportBtn: document.getElementById('export'),
    importInput: document.getElementById('import'),
    resetBtn: document.getElementById('reset'),
  };
  els.spoiler.checked = state.spoiler;

  function onToggle(id, checked) {
    if (checked) state.earned.add(id);
    else state.earned.delete(id);
    saveProgress(state.earned);
    render();
  }

  function render() {
    renderProgress(els.progressLine, els.progressFill, els.gradeCounts, trophies, state.earned);
    const visible = applyFilters(trophies, state);
    renderTrophyList(els.trophyList, visible, state, onToggle);
    els.emptyNote.hidden = visible.length > 0;
    renderRoadmap(els.roadmap, roadmapData.roadmap, trophiesById, state.earned);
    renderMissables(els.missableList, trophies, state, onToggle);
    for (const view of ['tracker', 'roadmap', 'missables']) {
      document.getElementById(`view-${view}`).hidden = state.view !== view;
      document.getElementById(`tab-${view}`).classList.toggle('active', state.view === view);
    }
    if (state.openId !== null) {
      const openEl = document.getElementById(`trophy-${state.openId}`);
      if (openEl) openEl.querySelector('details').open = true;
    }
  }

  function setView(view) {
    state.view = view;
    render();
  }

  document.getElementById('tab-tracker').addEventListener('click', () => setView('tracker'));
  document.getElementById('tab-roadmap').addEventListener('click', () => setView('roadmap'));
  document.getElementById('tab-missables').addEventListener('click', () => setView('missables'));
  els.search.addEventListener('input', () => { state.search = els.search.value; render(); });
  els.kind.addEventListener('change', () => { state.kind = els.kind.value; render(); });
  els.grade.addEventListener('change', () => { state.grade = els.grade.value; render(); });
  els.spoiler.addEventListener('change', () => { state.spoiler = els.spoiler.checked; render(); });
  els.earnedOnly.addEventListener('change', () => { state.earnedOnly = els.earnedOnly.checked; render(); });
  els.exportBtn.addEventListener('click', () => downloadBlob(buildExportFile(state.earned), 'vice-coast-trophy-progress.json'));
  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files[0];
    if (!file) return;
    try {
      state.earned = parseImportFile(await file.text());
      saveProgress(state.earned);
      render();
    } catch (err) {
      alert(`That file could not be imported: ${err.message}`);
    }
    els.importInput.value = '';
  });
  els.resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all earned trophies in this browser?')) return;
    state.earned = new Set();
    saveProgress(state.earned);
    render();
  });

  render();
}

boot().catch((err) => {
  document.getElementById('trophy-list').textContent = `This guide could not load its trophy data: ${err.message}`;
});
