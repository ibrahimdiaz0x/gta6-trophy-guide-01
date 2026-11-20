// Checklist, detail pane and progress rendering for the trophy tracker.
// The spoiler rule lives here: a story trophy the reader has not earned yet
// shows a masked name and description while spoilers are hidden.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  completion: '100% Completion',
  online: 'Online',
  platinum: 'Platinum',
};

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function isMasked(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

export function formatTarget(trophy) {
  if (trophy.target === null || trophy.target === undefined) return null;
  if (trophy.target >= 1000) return trophy.target.toLocaleString('en-US');
  return String(trophy.target);
}

export function filterTrophies(trophies, state) {
  const query = state.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.kind === 'missable' && !trophy.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.earnedOnly && !state.earned.has(trophy.id)) return false;
    if (state.unconfirmedOnly && !trophy.unconfirmed) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function badge(text, className) {
  const span = document.createElement('span');
  span.className = `badge ${className}`;
  span.textContent = text;
  return span;
}

function buildRow(trophy, state, callbacks) {
  const item = document.createElement('li');
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'trophy-row';
  if (state.earned.has(trophy.id)) row.classList.add('is-earned');
  if (state.selectedId === trophy.id) row.classList.add('is-selected');
  row.addEventListener('click', () => callbacks.onSelect(trophy.id));

  const check = document.createElement('span');
  check.className = 'trophy-check';
  check.textContent = state.earned.has(trophy.id) ? '✓' : '';
  check.title = state.earned.has(trophy.id) ? 'Earned — click to unmark' : 'Mark as earned';
  check.addEventListener('click', (event) => {
    event.stopPropagation();
    callbacks.onToggleEarned(trophy.id);
  });
  row.appendChild(check);

  const main = document.createElement('div');
  main.className = 'trophy-main';
  const masked = isMasked(trophy, state);

  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = masked ? 'Hidden story trophy' : trophy.name;
  main.appendChild(name);

  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'Earn this trophy to reveal its name and description.' : trophy.description;
  main.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.appendChild(badge(masked ? 'Hidden' : gradeLabel(trophy.grade), masked ? 'kind' : `grade-${trophy.grade}`));
  meta.appendChild(badge(KIND_LABELS[trophy.kind] || trophy.kind, 'kind'));
  if (trophy.missable) meta.appendChild(badge('Missable', 'missable'));
  if (trophy.unconfirmed) meta.appendChild(badge('Unconfirmed', 'unconfirmed'));
  main.appendChild(meta);

  if (trophy.target !== null && trophy.target !== undefined) {
    const count = document.createElement('div');
    count.className = 'trophy-count';
    const current = state.counts[trophy.id] || 0;
    count.textContent = `Progress: ${current.toLocaleString('en-US')} / ${formatTarget(trophy)}`;
    main.appendChild(count);
  }

  row.appendChild(main);
  item.appendChild(row);
  return item;
}

export function renderTrophyList(listEl, emptyEl, summaryEl, onlineNoteEl, trophies, state, callbacks) {
  const shown = filterTrophies(trophies, state);
  listEl.replaceChildren(...shown.map((trophy) => buildRow(trophy, state, callbacks)));
  emptyEl.hidden = shown.length > 0;
  onlineNoteEl.hidden = state.kind !== 'online';
  const earnedShown = shown.filter((trophy) => state.earned.has(trophy.id)).length;
  summaryEl.textContent =
    state.kind === 'online'
      ? 'Showing the Online filter: 0 trophies.'
      : `Showing ${shown.length} of ${trophies.length} trophies (${earnedShown} earned).`;
}

export function renderProgress(countEl, fillEl, breakdownEl, trophies, state) {
  const total = trophies.length;
  const earned = trophies.filter((trophy) => state.earned.has(trophy.id)).length;
  countEl.textContent = `${earned} / ${total}`;
  fillEl.style.width = total === 0 ? '0%' : `${Math.round((earned / total) * 100)}%`;
  const byGrade = {};
  for (const trophy of trophies) {
    byGrade[trophy.grade] = byGrade[trophy.grade] || { earned: 0, total: 0 };
    byGrade[trophy.grade].total += 1;
    if (state.earned.has(trophy.id)) byGrade[trophy.grade].earned += 1;
  }
  breakdownEl.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => `${gradeLabel(grade)} ${byGrade[grade].earned}/${byGrade[grade].total}`)
    .join(' · ');
}

export function renderDetail(paneEl, trophy, state, callbacks) {
  paneEl.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy on the left to read its guide and sources.';
    paneEl.appendChild(empty);
    return;
  }

  const masked = isMasked(trophy, state);
  const heading = document.createElement('h3');
  heading.textContent = masked ? 'Hidden story trophy' : trophy.name;
  paneEl.appendChild(heading);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.appendChild(badge(masked ? 'Hidden' : gradeLabel(trophy.grade), masked ? 'kind' : `grade-${trophy.grade}`));
  meta.appendChild(badge(KIND_LABELS[trophy.kind] || trophy.kind, 'kind'));
  if (trophy.missable) meta.appendChild(badge('Missable', 'missable'));
  if (trophy.unconfirmed) meta.appendChild(badge('Unconfirmed method', 'unconfirmed'));
  paneEl.appendChild(meta);

  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = masked
    ? 'Official description hidden until earned.'
    : `Official description: “${trophy.description}”`;
  paneEl.appendChild(official);

  if (masked) {
    const locked = document.createElement('p');
    locked.className = 'detail-guide';
    locked.textContent =
      'Spoilers are hidden. Earn this trophy — or switch the spoiler setting off — to read its guide and sources.';
    paneEl.appendChild(locked);
    return;
  }

  if (trophy.target !== null && trophy.target !== undefined) {
    const row = document.createElement('div');
    row.className = 'counter-row';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Decrease count');
    minus.addEventListener('click', () => callbacks.onCount(trophy.id, -1));
    const value = document.createElement('strong');
    const current = state.counts[trophy.id] || 0;
    value.textContent = `${current.toLocaleString('en-US')} / ${formatTarget(trophy)}`;
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase count');
    plus.addEventListener('click', () => callbacks.onCount(trophy.id, 1));
    row.append(minus, value, plus);
    paneEl.appendChild(row);
  }

  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = trophy.guide;
  paneEl.appendChild(guide);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'notice';
    warn.textContent =
      'Missable warning: this is the one trophy early guides flag as possibly missable. Do it as you go — see the Missables page.';
    paneEl.appendChild(warn);
  }
  if (trophy.unconfirmed) {
    const note = document.createElement('p');
    note.className = 'notice';
    note.textContent =
      'Not yet confirmed in the game: the exact method is still being checked by early guides. This guide says so rather than guessing.';
    paneEl.appendChild(note);
  }

  if (Array.isArray(trophy.sources) && trophy.sources.length > 0) {
    const sourcesBox = document.createElement('div');
    sourcesBox.className = 'detail-sources';
    const title = document.createElement('h4');
    title.textContent = 'Sources';
    sourcesBox.appendChild(title);
    const list = document.createElement('ul');
    for (const source of trophy.sources) {
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
      list.appendChild(item);
    }
    sourcesBox.appendChild(list);
    paneEl.appendChild(sourcesBox);
  }
}
