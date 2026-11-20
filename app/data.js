// Vice Coast data layer: loads the trophy list and the roadmap, and holds the
// small lookups the views share (grade order, kind labels, status labels).
// Every fact about a trophy lives in data/trophies.json; this module only
// fetches it and answers questions about it. No network beyond the app's
// own files: both fetches are relative paths under app/.

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const KIND_LABELS = {
  all: 'All trophies',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const STATUS_LABELS = {
  confirmed: 'Confirmed',
  reported: 'Reported',
  unconfirmed: 'Not yet confirmed',
};

export const STATUS_NOTES = {
  confirmed: 'The method follows from the official description or a cited guide.',
  reported: 'Counts and method come from community guides; not yet verified in-game here.',
  unconfirmed: 'No verified method yet — check the cited sources for updates.',
};

// The demo seed for screenshots: 13 trophies earned, a mix of story and
// activities, so the progress bar and the earned states show up in renders.
export const DEMO_EARNED_IDS = [2, 3, 5, 8, 15, 16, 19, 21, 33, 42, 46, 53, 55];

export async function loadGuideData() {
  const trophiesResponse = await fetch('data/trophies.json');
  const trophiesDoc = await trophiesResponse.json();
  const roadmapResponse = await fetch('data/roadmap.json');
  const roadmapDoc = await roadmapResponse.json();
  return { trophies: trophiesDoc, roadmap: roadmapDoc };
}

export function trophyById(trophiesDoc, id) {
  return trophiesDoc.trophies.find((trophy) => trophy.id === id) ?? null;
}

export function trophyByName(trophiesDoc, name) {
  return trophiesDoc.trophies.find((trophy) => trophy.name === name) ?? null;
}

export function gradeCounts(trophiesDoc) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophiesDoc.trophies) counts[trophy.grade] += 1;
  return counts;
}

export function gradeLetter(grade) {
  if (grade === 'platinum') return 'P';
  if (grade === 'gold') return 'G';
  if (grade === 'silver') return 'S';
  return 'B';
}

// A story trophy stays hidden while spoilers are on and it is not earned yet.
export function isSpoilerHidden(trophy, state) {
  return Boolean(state.spoilers && trophy.spoiler && !state.earned.has(trophy.name));
}

export function visibleName(trophy, state) {
  return isSpoilerHidden(trophy, state) ? 'Hidden story trophy' : trophy.name;
}

export function visibleDescription(trophy, state) {
  if (isSpoilerHidden(trophy, state)) return 'Earn this trophy to reveal its name and description.';
  return trophy.description;
}

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kinds.includes('online');
  return trophy.kinds.includes(kind);
}

export function searchHaystack(trophy) {
  return [trophy.name, trophy.description, trophy.guide, trophy.target ?? '', trophy.kinds.join(' ')].join(' ').toLowerCase();
}
