// Vice Coast roadmap, missables and sources views: the platinum plan built
// from the official descriptions and the cited guides, the one possibly
// missable trophy called out, and an honest note about what is confirmed.

import { trophyById, isSpoilerHidden } from './data.js';

function statCard(value, label) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  const big = document.createElement('div');
  big.className = 'stat-value';
  big.textContent = value;
  const small = document.createElement('div');
  small.className = 'stat-label';
  small.textContent = label;
  card.append(big, small);
  return card;
}

function trophyChip(trophy, state, onSelect) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'trophy-chip' + (state.earned.has(trophy.name) ? ' is-earned' : '');
  // The spoiler setting hides story names everywhere, roadmap chips included.
  chip.textContent = isSpoilerHidden(trophy, state)
    ? 'Hidden story trophy'
    : `${state.earned.has(trophy.name) ? '✓ ' : ''}${trophy.name}`;
  chip.addEventListener('click', () => onSelect(trophy.name));
  return chip;
}

export function renderRoadmap(container, trophiesDoc, roadmapDoc, ctx) {
  container.replaceChildren();
  const { state, onSelect } = ctx;

  const intro = document.createElement('p');
  intro.className = 'view-intro';
  intro.textContent = 'The road to the platinum, in the order PowerPyx lays it out: finish the story first, then the 100% checklist, then the stranger strands and the cleanup. One playthrough is enough.';
  container.append(intro);

  const stats = document.createElement('div');
  stats.className = 'stat-grid';
  stats.append(
    statCard('~200 h', 'to the platinum'),
    statCard('4 / 10', 'difficulty (PowerPyx)'),
    statCard('1', 'playthrough needed'),
    statCard('0', 'online trophies'),
    statCard('1', 'possibly missable'),
  );
  container.append(stats);

  for (const stage of roadmapDoc.stages) {
    const section = document.createElement('section');
    section.className = 'roadmap-stage';
    const heading = document.createElement('h2');
    heading.textContent = `${stage.title} — ${stage.hours}`;
    section.append(heading);
    const body = document.createElement('p');
    body.textContent = stage.body;
    section.append(body);
    const tips = document.createElement('ul');
    tips.className = 'tip-list';
    for (const tip of stage.tips) {
      const item = document.createElement('li');
      item.textContent = tip;
      tips.append(item);
    }
    section.append(tips);
    const chips = document.createElement('div');
    chips.className = 'chip-row';
    for (const id of stage.trophyIds) {
      const trophy = trophyById(trophiesDoc, id);
      if (trophy) chips.append(trophyChip(trophy, state, onSelect));
    }
    section.append(chips);
    container.append(section);
  }

  const notesHeading = document.createElement('h2');
  notesHeading.textContent = 'Good to know before you start';
  container.append(notesHeading);
  const notes = document.createElement('ul');
  notes.className = 'tip-list';
  for (const note of roadmapDoc.notes) {
    const item = document.createElement('li');
    item.textContent = note;
    notes.append(item);
  }
  container.append(notes);
}

export function renderMissables(container, trophiesDoc, ctx) {
  container.replaceChildren();
  const { state, onSelect } = ctx;
  const missable = trophiesDoc.trophies.filter((trophy) => trophy.missable);

  const intro = document.createElement('p');
  intro.className = 'view-intro';
  intro.textContent = 'Only one trophy is reported as possibly missable. Everything else can be cleaned up in free-roam after the story, because there is no point of no return for the rest of the list.';
  container.append(intro);

  for (const trophy of missable) {
    const card = document.createElement('section');
    card.className = 'missable-card';
    const heading = document.createElement('h2');
    heading.textContent = `⚠ ${trophy.name} — possibly missable`;
    card.append(heading);
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = trophy.description;
    card.append(desc);
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    card.append(guide);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'primary-btn';
    open.textContent = state.earned.has(trophy.name) ? '✓ Earned — open in tracker' : 'Open in tracker';
    open.addEventListener('click', () => onSelect(trophy.name));
    card.append(open);
    container.append(card);
  }

  const safeHeading = document.createElement('h2');
  safeHeading.textContent = 'Why the rest are safe';
  container.append(safeHeading);
  const safe = document.createElement('ul');
  safe.className = 'tip-list';
  const points = [
    'Story trophies pop automatically when their chapter or mission ends — finishing the story earns them all.',
    'After the final mission you return to the open world, and the 100% checklist stays available.',
    'Collectibles, activities, robberies and challenges can all be done in free-roam after the story.',
    'Cheats disable trophies and saving, so keep them off for the whole run.',
  ];
  for (const point of points) {
    const item = document.createElement('li');
    item.textContent = point;
    safe.append(item);
  }
  container.append(safe);
}

export function renderSources(container, trophiesDoc) {
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'view-intro';
  intro.textContent = 'How this guide was built, and where every fact comes from. The game released on 19 November 2026, so methods that players have not yet confirmed are labelled as such instead of being presented as fact.';
  container.append(intro);

  const heading = document.createElement('h2');
  heading.textContent = 'Sources';
  container.append(heading);
  const list = document.createElement('ul');
  list.className = 'source-list';
  for (const key of Object.keys(trophiesDoc.sourceList)) {
    const source = trophiesDoc.sourceList[key];
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = source.name;
    item.append(link);
    list.append(item);
  }
  container.append(list);

  const notesHeading = document.createElement('h2');
  notesHeading.textContent = 'Honesty notes';
  container.append(notesHeading);
  const notes = document.createElement('ul');
  notes.className = 'tip-list';
  const points = [
    'Names, descriptions and grades are shown exactly as Exophase and PSNProfiles list them — the two agree on every entry.',
    '28 of the 55 trophies are hidden on PlayStation until earned (27 bronze, 1 gold). The spoiler setting hides the story trophies until you earn them.',
    'Every guide is written in our own words for this entry. Sources are cited beside each guide, never copied.',
    'No Rockstar logo, official artwork or game screenshot is used anywhere in this guide. The look is our own.',
    'The guide is a static app that works offline: it loads only its own files and makes no network request while it runs.',
  ];
  for (const point of points) {
    const item = document.createElement('li');
    item.textContent = point;
    notes.append(item);
  }
  container.append(notes);
}
