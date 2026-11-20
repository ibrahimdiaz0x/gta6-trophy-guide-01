// Vice Coast tracker rendering: the checklist rows and the guide detail
// pane. Rows show the official name, description and grade, the kind tags,
// the target count, the missable flag and the status of the guide. Clicking
// a row opens its guide in the detail pane; the checkbox only ticks it off.

import { gradeLetter, isSpoilerHidden, searchHaystack, trophyMatchesKind, visibleDescription, visibleName, STATUS_LABELS, STATUS_NOTES } from './data.js';

function medalDot(grade) {
  const dot = document.createElement('span');
  dot.className = `medal medal-${grade}`;
  dot.textContent = gradeLetter(grade);
  dot.title = grade;
  return dot;
}

function tagChip(text, kind) {
  const chip = document.createElement('span');
  chip.className = `tag tag-${kind}`;
  chip.textContent = text;
  return chip;
}

function renderTrophyRow(trophy, ctx) {
  const { state, onToggle, onSelect } = ctx;
  const hidden = isSpoilerHidden(trophy, state);
  const earned = state.earned.has(trophy.name);
  const row = document.createElement('article');
  row.className = 'trophy-row' + (earned ? ' is-earned' : '') + (ctx.selected === trophy.name ? ' is-selected' : '');
  row.dataset.name = trophy.name;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earn-box';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${visibleName(trophy, state)} earned`);
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    onToggle(trophy.name, box.checked);
  });
  row.append(box);
  row.append(medalDot(hidden ? 'bronze' : trophy.grade));

  const body = document.createElement('div');
  body.className = 'row-body';
  const name = document.createElement('h3');
  name.className = 'row-name';
  name.textContent = visibleName(trophy, state);
  body.append(name);
  const desc = document.createElement('p');
  desc.className = 'row-desc';
  desc.textContent = visibleDescription(trophy, state);
  body.append(desc);

  const tags = document.createElement('div');
  tags.className = 'row-tags';
  tags.append(tagChip(hidden ? 'Hidden' : trophy.grade, 'grade'));
  for (const kind of trophy.kinds) tags.append(tagChip(kind, kind));
  if (trophy.target) tags.append(tagChip(trophy.target, 'target'));
  if (trophy.missable) tags.append(tagChip('Missable', 'missable'));
  if (trophy.status !== 'confirmed') tags.append(tagChip(STATUS_LABELS[trophy.status], 'status'));
  body.append(tags);
  row.append(body);

  row.addEventListener('click', (event) => {
    if (event.target === box) return;
    onSelect(trophy.name);
  });
  return row;
}

export function filterTrophies(trophiesDoc, state) {
  const query = state.query.trim().toLowerCase();
  return trophiesDoc.trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, state.kind)) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.show === 'earned' && !state.earned.has(trophy.name)) return false;
    if (state.show === 'todo' && state.earned.has(trophy.name)) return false;
    if (query && !searchHaystack(trophy).includes(query)) return false;
    return true;
  });
}

export function renderTrackerList(listEl, trophiesDoc, ctx) {
  const shown = filterTrophies(trophiesDoc, ctx.state);
  listEl.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = 'No trophies match these filters. Try clearing the search or choosing another kind — the Online filter is empty on purpose: the official list has no online trophies.';
    listEl.append(empty);
    return { shown: 0, total: trophiesDoc.trophies.length };
  }
  for (const trophy of shown) listEl.append(renderTrophyRow(trophy, ctx));
  return { shown: shown.length, total: trophiesDoc.trophies.length };
}

function sourceLink(source) {
  const link = document.createElement('a');
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = source.name;
  return link;
}

export function renderDetailPane(paneEl, trophiesDoc, ctx) {
  const { state, onToggle } = ctx;
  paneEl.replaceChildren();
  const trophy = trophiesDoc.trophies.find((item) => item.name === ctx.selected) ?? null;
  if (!trophy) {
    const hint = document.createElement('div');
    hint.className = 'detail-empty';
    const heading = document.createElement('h2');
    heading.textContent = 'Pick a trophy to read its guide';
    hint.append(heading);
    const text = document.createElement('p');
    text.textContent = 'Click any trophy in the list. Each guide is written in our own words, says where its facts come from, and says plainly when a method is not yet confirmed.';
    hint.append(text);
    paneEl.append(hint);
    return;
  }
  const hidden = isSpoilerHidden(trophy, state);
  const earned = state.earned.has(trophy.name);

  const head = document.createElement('div');
  head.className = 'detail-head';
  head.append(medalDot(hidden ? 'bronze' : trophy.grade));
  const title = document.createElement('h2');
  title.textContent = visibleName(trophy, state);
  head.append(title);
  paneEl.append(head);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = hidden ? 'Hidden story trophy — earn it to reveal the guide.' : `${trophy.grade} · ${trophy.kinds.join(', ')}${trophy.missable ? ' · Missable' : ''}${trophy.target ? ` · ${trophy.target}` : ''}`;
  paneEl.append(meta);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = visibleDescription(trophy, state);
  paneEl.append(desc);

  if (!hidden) {
    const status = document.createElement('p');
    status.className = `status-line status-${trophy.status}`;
    status.textContent = `${STATUS_LABELS[trophy.status]} — ${STATUS_NOTES[trophy.status]}`;
    paneEl.append(status);

    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    paneEl.append(guideHeading);
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    paneEl.append(guide);

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    paneEl.append(sourcesHeading);
    const list = document.createElement('ul');
    list.className = 'source-list';
    for (const key of trophy.sources) {
      const source = trophiesDoc.sourceList[key];
      if (!source) continue;
      const item = document.createElement('li');
      item.append(sourceLink(source));
      list.append(item);
    }
    paneEl.append(list);
  }

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'primary-btn';
  toggleButton.textContent = earned ? 'Mark as not earned' : 'Mark as earned';
  toggleButton.addEventListener('click', () => onToggle(trophy.name, !earned));
  paneEl.append(toggleButton);
}
