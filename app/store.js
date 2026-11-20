// Vice Coast progress store: the earned set lives in localStorage, and it
// can be exported to a file and imported back. The store knows nothing
// about the page; it only keeps a set of trophy names and persists it.

export function createProgressStore(storageKey) {
  let earned = new Set();
  let spoilers = true;

  function readStored() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function load() {
    const stored = readStored();
    if (stored && Array.isArray(stored.earned)) earned = new Set(stored.earned);
    if (stored && typeof stored.spoilers === 'boolean') spoilers = stored.spoilers;
    return { earned, spoilers };
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ earned: [...earned], spoilers }));
    } catch {
      // Private browsing or a full store: progress still works for the session.
    }
  }

  function toggle(name) {
    if (earned.has(name)) earned.delete(name);
    else earned.add(name);
    save();
  }

  function setEarned(name, value) {
    if (value) earned.add(name);
    else earned.delete(name);
    save();
  }

  function setSpoilers(value) {
    spoilers = Boolean(value);
    save();
  }

  function reset() {
    earned = new Set();
    save();
  }

  function exportFile() {
    const payload = {
      app: 'Vice Coast Trophy Guide',
      exportedAt: new Date().toISOString(),
      earned: [...earned],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vice-coast-progress.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Reads an exported file and returns { ok, imported, rejected }.
  // Only names that exist in the guide are kept; anything else is rejected
  // and reported, so a file from another guide cannot corrupt the tracker.
  async function importFile(file, knownNames) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('That file has no earned list in it.');
    const known = new Set(knownNames);
    const imported = [];
    const rejected = [];
    for (const name of names) {
      if (typeof name === 'string' && known.has(name)) imported.push(name);
      else rejected.push(String(name));
    }
    earned = new Set(imported);
    save();
    return { ok: true, imported: imported.length, rejected };
  }

  return { load, save, toggle, setEarned, setSpoilers, reset, exportFile, importFile, get earned() { return earned; }, get spoilers() { return spoilers; } };
}
