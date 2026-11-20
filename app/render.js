// Rendering for the trophy list, the roadmap and the missables view.
import { KIND_LABELS, gradeCounts, isSpoilerHidden } from './filters.js';

function formatTarget(trophy) {
  if (trophy.count === undefined) return null;
  if (trophy.id === 52 || trophy.id === 53) return `$${trophy.count.toLocaleString('en-US')}`;
  if (trophy.id === 30) return `${trophy.count} card sets`;
  return trophy.count.toLocaleString('en-US');
}

function badge(text, kind) {
  const span = document.createElement('span');
  span.className = `badge ${kind}`;
  span.textContent = text;
  return span;
}

export function trophyItem(trophy, state, onToggle) {
  const hidden = isSpoilerHidden(trophy, state);
  const earned = state.earned.has(trophy.id);
  const item = document.createElement('li');
  item.className = `trophy${earned ? ' earned' : ''}`;
  item.id = `trophy-${trophy.id}`;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${hidden ? 'this hidden story trophy' : trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  head.append(box, name, badge(trophy.grade, trophy.grade));
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  head.append(kindTag);
  if (trophy.missable) head.append(badge('Missable', 'missable'));
  if (trophy.hidden) head.append(badge('Hidden', 'hidden'));
  const target = formatTarget(trophy);
  if (target !== null) {
    const targetTag = document.createElement('span');
    targetTag.className = 'tag';
    targetTag.textContent = `Target: ${target}`;
    head.append(targetTag);
  }
  item.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Hidden until earned — finish the story moment to reveal it.' : trophy.description;
  item.append(desc);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'hint';
    note.textContent = 'Guide hidden until earned. Turn the spoiler setting off to read it, or earn this trophy.';
    item.append(note);
    return item;
  }

  const guide = document.createElement('details');
  guide.className = 'guide';
  guide.open = state.openId === trophy.id;
  const summary = document.createElement('summary');
  summary.textContent = 'Guide and sources';
  const guideText = document.createElement('p');
  guideText.textContent = trophy.guide;
  const sources = document.createElement('p');
  sources.className = 'sources';
  const strong = document.createElement('strong');
  strong.textContent = 'Sources: ';
  sources.append(strong, document.createTextNode(trophy.sources.join('; ')));
  guide.append(summary, guideText, sources);
  item.append(guide);
  return item;
}

export function renderTrophyList(listEl, trophies, state, onToggle) {
  listEl.replaceChildren();
  for (const trophy of trophies) listEl.append(trophyItem(trophy, state, onToggle));
}

export function renderProgress(progressLine, progressFill, gradeCountsEl, trophies, earned) {
  progressLine.textContent = `${earned.size} of ${trophies.length} earned`;
  progressFill.style.width = `${Math.round((earned.size / trophies.length) * 100)}%`;
  const counts = gradeCounts(trophies, earned);
  gradeCountsEl.textContent = `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]} · 28 hidden on PlayStation`;
}

export function renderRoadmap(roadmapEl, roadmap, trophiesById, earned) {
  roadmapEl.replaceChildren();
  for (const stage of roadmap) {
    const card = document.createElement('article');
    card.className = 'stage';
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const goal = document.createElement('p');
    goal.textContent = stage.goal;
    const list = document.createElement('ul');
    for (const id of stage.ids) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const row = document.createElement('li');
      row.textContent = `${earned.has(id) ? '✓ ' : '○ '}${trophy.name} — ${trophy.grade}${trophy.missable ? ' (missable)' : ''}`;
      list.append(row);
    }
    const tips = document.createElement('ul');
    for (const tip of stage.tips) {
      const tipRow = document.createElement('li');
      tipRow.textContent = tip;
      tips.append(tipRow);
    }
    const tipsTitle = document.createElement('p');
    tipsTitle.textContent = 'Tips:';
    card.append(title, goal, list, tipsTitle, tips);
    roadmapEl.append(card);
  }
}

export function renderMissables(listEl, trophies, state, onToggle) {
  const missable = trophies.filter((trophy) => trophy.missable);
  renderTrophyList(listEl, missable, state, onToggle);
}
