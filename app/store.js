// Progress store for the Vice Coast trophy tracker.
// Everything lives in localStorage on the reader's own machine; nothing
// leaves the browser except an export file the reader asks for.
export const STORAGE_KEY = 'vice-coast-trophy-guide-v1';

export const DEMO_EARNED = [2, 3, 8, 15, 17, 21, 33, 35, 36, 41, 42, 52, 53];
export const DEMO_COUNTS = { 15: 120, 17: 20, 25: 3, 30: 1, 31: 40, 32: 22, 35: 55 };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return null;
  }
}

export function saveProgress(state) {
  const payload = {
    earned: [...state.earned].sort((a, b) => a - b),
    counts: state.counts,
    spoiler: state.spoiler,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function seedDemoProgress() {
  return {
    earned: [...DEMO_EARNED],
    counts: { ...DEMO_COUNTS },
    spoiler: false,
  };
}

export function downloadExport(payload) {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-coast-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file.');
  const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [];
  const counts = parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
  const spoiler = parsed.spoiler === true;
  return { earned, counts, spoiler };
}

export function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseImportText(String(reader.result)));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsText(file);
  });
}
