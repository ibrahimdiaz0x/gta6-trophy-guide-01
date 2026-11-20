// Roadmap, missables and about pages, built from the official descriptions
// in app/data/roadmap.json and the trophy list itself.
import { KIND_LABELS } from './render.js';

function trophyById(trophies, id) {
  return trophies.find((trophy) => trophy.id === id);
}

function stageTrophyChip(trophy, state, onSelect) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'stage-trophy';
  if (state.earned.has(trophy.id)) chip.classList.add('is-earned');
  chip.textContent = `${state.earned.has(trophy.id) ? '✓ ' : ''}${trophy.name}`;
  chip.addEventListener('click', () => onSelect(trophy.id));
  return chip;
}

export function renderRoadmap(listEl, roadmap, trophies, state, onSelect) {
  listEl.replaceChildren();
  for (const stage of roadmap.stages) {
    const item = document.createElement('li');
    item.className = 'roadmap-stage';

    const heading = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage}`;
    heading.append(num, document.createTextNode(stage.title));
    item.appendChild(heading);

    const earnedInStage = stage.trophies.filter((id) => state.earned.has(id)).length;
    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = `${earnedInStage} of ${stage.trophies.length} trophies in this stage earned`;
    item.appendChild(progress);

    const summary = document.createElement('p');
    summary.textContent = stage.summary;
    item.appendChild(summary);

    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophies) {
      const trophy = trophyById(trophies, id);
      if (trophy) chips.appendChild(stageTrophyChip(trophy, state, onSelect));
    }
    item.appendChild(chips);

    const tip = document.createElement('p');
    tip.className = 'stage-tip';
    const tipLabel = document.createElement('strong');
    tipLabel.textContent = 'Tip: ';
    tip.append(tipLabel, document.createTextNode(stage.tip));
    item.appendChild(tip);

    listEl.appendChild(item);
  }
}

export function renderMissables(boxEl, roadmap, trophies, state, onSelect) {
  boxEl.replaceChildren();
  const miss = roadmap.missables;
  const trophy = trophyById(trophies, miss.trophy);

  const facts = document.createElement('table');
  facts.className = 'fact-table';
  const rows = [
    ['Difficulty', roadmap.facts.difficulty],
    ['Time to platinum', roadmap.facts.time],
    ['Online trophies', roadmap.facts.online],
    ['Playthroughs', roadmap.facts.playthroughs],
    ['Possibly missable', roadmap.facts.missable],
  ];
  for (const [label, value] of rows) {
    const row = document.createElement('tr');
    const head = document.createElement('th');
    head.textContent = label;
    const cell = document.createElement('td');
    cell.textContent = value;
    row.append(head, cell);
    facts.appendChild(row);
  }
  boxEl.appendChild(facts);

  const heading = document.createElement('h3');
  heading.textContent = miss.title;
  boxEl.appendChild(heading);

  const warning = document.createElement('p');
  warning.textContent = miss.warning;
  boxEl.appendChild(warning);

  if (trophy) {
    const chipRow = document.createElement('p');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'stage-trophy';
    chip.textContent = state.earned.has(trophy.id) ? `✓ ${trophy.name}` : trophy.name;
    chip.addEventListener('click', () => onSelect(trophy.id));
    chipRow.appendChild(chip);
    boxEl.appendChild(chipRow);
  }

  const list = document.createElement('ul');
  for (const advice of miss.advice) {
    const item = document.createElement('li');
    item.textContent = advice;
    list.appendChild(item);
  }
  boxEl.appendChild(list);

  const safe = document.createElement('p');
  safe.textContent = miss.safeNote;
  boxEl.appendChild(safe);
}

export function renderAbout(boxEl, roadmap) {
  boxEl.replaceChildren();

  const intro = document.createElement('p');
  intro.textContent =
    'Vice Coast is a fan-made, offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. ' +
    'Your progress is saved in this browser only (localStorage). Export it to a file to back it up or move it to another browser, and import it back the same way. ' +
    'The app fetches nothing over the network: every file it loads sits under app/, and the only links that leave the page are the source links you choose to follow.';
  boxEl.appendChild(intro);

  const honest = document.createElement('h3');
  honest.textContent = 'An honest note on what is confirmed';
  boxEl.appendChild(honest);
  const honestText = document.createElement('p');
  honestText.textContent =
    'The game released on 19 November 2026, a day before this guide was written. Trophy names, descriptions and grades are the official list, ' +
    'and the counts (42 Shooting Range challenges, 250 stunts, 100 WAiNK locations) come from the official list and the trackers that publish it. ' +
    'Where a method is not yet confirmed in the game, the trophy carries an Unconfirmed badge and its guide says so plainly instead of inventing steps. ' +
    'Story trophies hide behind the spoiler setting until you earn them, so the guide stays safe to browse mid-playthrough.';
  boxEl.appendChild(honestText);

  const how = document.createElement('h3');
  how.textContent = 'How to use this guide';
  boxEl.appendChild(how);
  const howList = document.createElement('ul');
  for (const step of [
    'Tracker: tick trophies off as you earn them. Use the counters on trophies with a target (42 golds, 250 stunts, 100 scans) to track partial progress.',
    'Filters: narrow the list by kind — story, missable, collectibles, activities, 100% completion or online — by grade, by earned state, or by search.',
    'Spoilers: turn on “Hide story spoilers” and story trophies stay masked until you earn them.',
    'Roadmap: six stages in order, from the opening mission to 100% completion and the platinum.',
    'Missables: the one trophy that might be missable, and how to protect it from Chapter 1.',
  ]) {
    const item = document.createElement('li');
    item.textContent = step;
    howList.appendChild(item);
  }
  boxEl.appendChild(howList);

  const sourcesTitle = document.createElement('h3');
  sourcesTitle.textContent = 'Sources for this guide';
  boxEl.appendChild(sourcesTitle);
  const sourcesIntro = document.createElement('p');
  sourcesIntro.textContent =
    'Every trophy cites its sources beside its guide. The full list of sources used across the guide:';
  boxEl.appendChild(sourcesIntro);
  const sourcesList = document.createElement('ul');
  for (const source of roadmap.sources) {
    const item = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.label;
      item.appendChild(link);
    } else {
      item.textContent = source.label;
    }
    sourcesList.appendChild(item);
  }
  boxEl.appendChild(sourcesList);

  const kinds = document.createElement('p');
  kinds.textContent =
    'Kinds used by the filters: ' +
    Object.entries(KIND_LABELS)
      .map(([key, label]) => `${label} (${key})`)
      .join(', ') +
    '. A trophy has one kind; the Missable filter cuts across kinds, and the Online filter is empty on purpose — GTA 6 has no online trophies.';
  boxEl.appendChild(kinds);
}
