/* Vice Coast Trophy Guide — tracker logic, written for this guide.
   Data comes from app/data/trophies.json. Progress is kept in localStorage
   under the key below; export/import move it as a JSON file. No network
   calls are made after the data file loads. */
(function () {
  "use strict";

  var DATA_URL = "data/trophies.json";
  var STORE_KEY = "vice-coast-trophy-progress-v1";

  var state = {
    data: null,
    earned: {},       // trophy id -> true
    kind: "all",
    grade: "all",
    query: "",
    spoiler: true,
    hideEarned: false,
    sort: "list"
  };

  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  var KIND_LABELS = {
    all: "All kinds",
    story: "Story",
    missable: "Missable",
    collectibles: "Collectibles",
    activities: "Activities",
    online: "Online"
  };

  function $(id) { return document.getElementById(id); }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var out = {};
      Object.keys(parsed).forEach(function (k) {
        if (parsed[k]) out[Number(k)] = true;
      });
      return out;
    } catch (e) { return {}; }
  }

  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.earned)); } catch (e) {}
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function sourceLink(label) {
    var found = null;
    state.data.sources.forEach(function (s) { if (s.label === label) found = s; });
    if (!found || !found.url) return escapeHtml(label);
    return '<a href="' + escapeHtml(found.url) + '" target="_blank" rel="noopener">' +
      escapeHtml(label) + "</a>";
  }

  function renderRoadmap() {
    var html = "";
    state.data.roadmap.forEach(function (stage) {
      html += '<article class="stage"><span class="stage-num">Stage ' + stage.stage + '</span>' +
        "<h3>" + escapeHtml(stage.name) + "</h3>" +
        '<p class="hours">' + escapeHtml(stage.hours) + " hours</p>" +
        "<p>" + escapeHtml(stage.text) + "</p></article>";
    });
    $("stages").innerHTML = html;
  }

  function renderSources() {
    var html = "";
    state.data.sources.forEach(function (s) {
      if (s.url) {
        html += '<li><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(s.label) + "</a></li>";
      } else {
        html += "<li>" + escapeHtml(s.label) + " (official trophy list)</li>";
      }
    });
    $("source-list").innerHTML = html;
  }

  function renderFilters() {
    var kinds = ["all", "story", "missable", "collectibles", "activities", "online"];
    var html = "";
    kinds.forEach(function (k) {
      var n = k === "all" ? state.data.trophies.length
        : state.data.trophies.filter(function (t) { return t.kind === k; }).length;
      html += '<button type="button" class="chip" data-kind="' + k + '" aria-pressed="' +
        (state.kind === k) + '">' + KIND_LABELS[k] + ' <span class="n">' + n + "</span></button>";
    });
    $("kind-filters").innerHTML = html;

    var grades = ["all", "platinum", "gold", "silver", "bronze"];
    var gh = "";
    grades.forEach(function (g) {
      var n = g === "all" ? state.data.trophies.length
        : state.data.trophies.filter(function (t) { return t.grade === g; }).length;
      var label = g === "all" ? "All grades" : g.charAt(0).toUpperCase() + g.slice(1);
      gh += '<button type="button" class="chip" data-grade="' + g + '" aria-pressed="' +
        (state.grade === g) + '">' + label + ' <span class="n">' + n + "</span></button>";
    });
    $("grade-filters").innerHTML = gh;
  }

  function trophyVisible(t) {
    if (state.kind !== "all" && t.kind !== state.kind) return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned[t.id]) return false;
    if (state.query) {
      var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (hay.indexOf(state.query) === -1) return false;
    }
    return true;
  }

  function cardHtml(t) {
    var earned = !!state.earned[t.id];
    var storyHidden = state.spoiler && t.kind === "story" && !earned;
    var badges = '<span class="badge ' + t.grade + '">' + t.grade + "</span>";
    if (t.hidden) badges += '<span class="badge hidden">Hidden</span>';
    if (t.missable && t.kind !== "missable") badges += '<span class="badge missable">Missable</span>';
    badges += '<span class="badge kind">' + t.kind + "</span>";
    if (earned) badges += '<span class="badge earned-badge">Earned ✓</span>';

    var title = storyHidden
      ? "<h3>Hidden story trophy</h3>"
      : "<h3>" + escapeHtml(t.name) + "</h3>";
    var official = storyHidden
      ? '<p class="official spoiler-note">Name and description hidden until earned — spoiler-safe mode is on.</p>'
      : '<p class="official">“' + escapeHtml(t.description) + "”</p>";

    var body = "";
    if (!storyHidden) {
      body += '<div class="guide"><h4>How to get it</h4><p>' + escapeHtml(t.guide) + "</p>";
      if (t.steps && t.steps.length) {
        body += '<ol class="steps">';
        t.steps.forEach(function (s) { body += "<li>" + escapeHtml(s) + "</li>"; });
        body += "</ol>";
      }
      body += "</div>";
      if (t.unconfirmed) {
        body += '<p class="unconfirmed"><strong>Not yet confirmed:</strong> ' +
          escapeHtml(t.unconfirmed) + "</p>";
      }
      if (t.sources && t.sources.length) {
        body += '<div class="sources">Sources: <ul>';
        t.sources.forEach(function (s) { body += "<li>" + sourceLink(s) + "</li>"; });
        body += "</ul></div>";
      }
      if (t.count) {
        var total = t.count_total ? " of " + t.count_total : "";
        body += '<p class="sources">Target: <strong>' + t.count + total + "</strong></p>";
      }
    } else {
      body += '<p class="guide spoiler-note">Tick it once you earn it in-game and the full guide appears.</p>';
    }

    return '<article class="card' + (earned ? " earned" : "") + '" data-id="' + t.id + '">' +
      '<div class="card-head">' +
      '<input type="checkbox" data-earned="' + t.id + '"' + (earned ? " checked" : "") +
      ' aria-label="Mark ' + escapeHtml(storyHidden ? "story trophy" : t.name) + ' as earned">' +
      '<div class="card-title">' + title + official +
      '<div class="badges">' + badges + "</div></div></div>" + body + "</article>";
  }

  function render() {
    renderFilters();
    var list = state.data.trophies.filter(trophyVisible);
    if (state.sort === "grade") {
      list = list.slice().sort(function (a, b) {
        return GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id;
      });
    } else if (state.sort === "name") {
      list = list.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }
    $("cards").innerHTML = list.map(cardHtml).join("");
    $("empty").hidden = list.length > 0;
    var shown = list.length, total = state.data.trophies.length;
    $("result-count").textContent = shown === total
      ? "Showing all " + total + " trophies."
      : "Showing " + shown + " of " + total + " trophies.";
    renderProgress();
  }

  function renderProgress() {
    var earned = Object.keys(state.earned).length;
    var total = state.data.trophies.length;
    var pct = total ? Math.round((earned / total) * 100) : 0;
    $("stat-earned").textContent = earned;
    $("stat-pct").textContent = pct + "%";
    $("progress-fill").style.width = pct + "%";
    $("progress-text").textContent = earned + " of " + total +
      " trophies earned · Platinum: Vice Got a Price!";
  }

  function bindEvents() {
    $("cards").addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-earned");
      if (!id) return;
      if (e.target.checked) state.earned[Number(id)] = true;
      else delete state.earned[Number(id)];
      saveProgress();
      render();
    });
    $("kind-filters").addEventListener("click", function (e) {
      var k = e.target.closest("[data-kind]");
      if (!k) return;
      state.kind = k.getAttribute("data-kind");
      render();
    });
    $("grade-filters").addEventListener("click", function (e) {
      var g = e.target.closest("[data-grade]");
      if (!g) return;
      state.grade = g.getAttribute("data-grade");
      render();
    });
    $("search").addEventListener("input", function (e) {
      state.query = e.target.value.trim().toLowerCase();
      render();
    });
    $("spoiler-toggle").addEventListener("change", function (e) {
      state.spoiler = e.target.checked;
      render();
    });
    $("hide-earned").addEventListener("change", function (e) {
      state.hideEarned = e.target.checked;
      render();
    });
    $("sort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      render();
    });
    $("export-btn").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify({ app: "vice-coast-trophy-guide", earned: Object.keys(state.earned).map(Number) }, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "gta6-trophy-progress.json";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    $("import-btn").addEventListener("click", function () { $("import-file").click(); });
    $("import-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          var ids = Array.isArray(parsed) ? parsed : parsed.earned;
          var valid = {};
          state.data.trophies.forEach(function (t) { valid[t.id] = true; });
          var next = {};
          (ids || []).forEach(function (id) { if (valid[Number(id)]) next[Number(id)] = true; });
          state.earned = next;
          saveProgress();
          render();
        } catch (err) {
          alert("That file could not be read as trophy progress.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });
    $("reset-btn").addEventListener("click", function () {
      if (!confirm("Clear all earned trophies? This cannot be undone (export first if you want a backup).")) return;
      state.earned = {};
      saveProgress();
      render();
    });
  }

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("data failed to load");
      return r.json();
    })
    .then(function (data) {
      state.data = data;
      state.earned = loadProgress();
      renderRoadmap();
      renderSources();
      bindEvents();
      render();
    })
    .catch(function () {
      $("cards").innerHTML = '<p class="empty">The trophy data file (app/data/trophies.json) could not be loaded. ' +
        "If you opened this page from a file, make sure the data folder sits next to it.</p>";
    });
})();
