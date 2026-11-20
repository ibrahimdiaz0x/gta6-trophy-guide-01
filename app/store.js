// Progress store: earned trophy ids kept in localStorage, with export/import.
export const STORAGE_KEY = 'vice-coast-trophy-progress-v1';
export const EXPORT_VERSION = 1;

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const data = JSON.parse(raw);
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) return new Set();
    return new Set(ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
  } catch (err) {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: EXPORT_VERSION, earned: [...earned].sort((a, b) => a - b) }));
}

export function buildExportFile(earned) {
  const payload = { game: 'Grand Theft Auto VI', guide: 'Vice Coast Trophy Guide', version: EXPORT_VERSION, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

export function parseImportFile(text) {
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('No earned list found in that file.');
  const clean = [...new Set(ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55))];
  return new Set(clean);
}
