// Mini-game: Nối từ - kéo thả từ tiếng Pháp vào đúng nghĩa tiếng Việt
// Nghĩa tiếng Việt lấy động qua Enrichment (API dịch), cache lại theo từ.
window.MatchingGame = (function () {
  let state = { level: "all", pairs: 6, matched: 0, mistakes: 0, startTime: null, cache: {} };

  function pool() {
    return window.VOCAB_DATA.filter((w) => state.level === "all" || w.level === state.level);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getEnrichment(word) {
    if (!state.cache[word.id]) state.cache[word.id] = Enrichment.getForWord(word);
    return state.cache[word.id];
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>🧩 Nối từ (kéo thả)</h2>
        <select id="mg-level" class="level-select">
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>
      </div>
      <p class="game-sub">Kéo mỗi từ tiếng Pháp bên trái, thả vào đúng nghĩa tiếng Việt bên phải.</p>
      <div class="match-stats">
        <span id="mg-progress">0 / ${state.pairs}</span>
        <span id="mg-mistakes">Sai: 0</span>
      </div>
      <div id="mg-board" class="match-board"></div>
      <div id="mg-result"></div>
    `;
    container.querySelector("#mg-level").value = state.level;
    container.querySelector("#mg-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      startRound(container);
    });
    startRound(container);
  }

  async function startRound(container) {
    const data = pool();
    const board = container.querySelector("#mg-board");
    if (data.length < state.pairs) {
      board.innerHTML = `<div class="empty-state">Cần ít nhất ${state.pairs} từ trong cấp độ này để chơi.</div>`;
      return;
    }
    board.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang tải nghĩa các từ...")}</div>`;

    const chosen = shuffle(data).slice(0, state.pairs);
    const enrichments = await Promise.all(chosen.map((w) => getEnrichment(w)));
    const chosenWithMeaning = chosen.map((w, i) => ({ ...w, vi: enrichments[i].vi || "(không dịch được)" }));

    state.matched = 0;
    state.mistakes = 0;
    state.startTime = Date.now();
    container.querySelector("#mg-result").innerHTML = "";
    updateHeader(container);

    const leftItems = shuffle(chosenWithMeaning);
    const rightItems = shuffle(chosenWithMeaning);

    board.innerHTML = `
      <div class="match-col" id="mg-left">
        ${leftItems.map((w) => `<div class="match-item" draggable="true" data-id="${w.id}">${w.fr}</div>`).join("")}
      </div>
      <div class="match-col" id="mg-right">
        ${rightItems.map((w) => `<div class="match-target" data-id="${w.id}">${w.vi}</div>`).join("")}
      </div>
    `;

    let draggedId = null;
    board.querySelectorAll(".match-item").forEach((el) => {
      el.addEventListener("dragstart", (e) => {
        draggedId = el.dataset.id;
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => el.classList.add("dragging"), 0);
      });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
      el.addEventListener("click", () => {
        board.querySelectorAll(".match-item").forEach((i) => i.classList.remove("selected"));
        if (el.classList.contains("matched")) return;
        el.classList.add("selected");
        draggedId = el.dataset.id;
      });
    });

    board.querySelectorAll(".match-target").forEach((el) => {
      el.addEventListener("dragover", (e) => e.preventDefault());
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        handleAttempt(container, draggedId, el);
      });
      el.addEventListener("click", () => {
        if (el.classList.contains("matched") || !draggedId) return;
        handleAttempt(container, draggedId, el);
      });
    });
  }

  function handleAttempt(container, draggedId, targetEl) {
    if (!draggedId || targetEl.classList.contains("matched")) return;
    const board = container.querySelector("#mg-board");
    const sourceEl = board.querySelector(`.match-item[data-id="${draggedId}"]`);
    if (!sourceEl || sourceEl.classList.contains("matched")) return;

    if (draggedId === targetEl.dataset.id) {
      sourceEl.classList.add("matched");
      targetEl.classList.add("matched");
      sourceEl.classList.remove("selected");
      state.matched += 1;
      SoundFX.correct();
      updateHeader(container);
      if (state.matched === state.pairs) finishRound(container);
    } else {
      targetEl.classList.add("shake");
      setTimeout(() => targetEl.classList.remove("shake"), 400);
      state.mistakes += 1;
      SoundFX.wrong();
      updateHeader(container);
    }
  }

  function updateHeader(container) {
    const p = container.querySelector("#mg-progress");
    const m = container.querySelector("#mg-mistakes");
    if (p) p.textContent = `${state.matched} / ${state.pairs}`;
    if (m) m.textContent = `Sai: ${state.mistakes}`;
  }

  async function finishRound(container) {
    const seconds = Math.round((Date.now() - state.startTime) / 1000);
    container.querySelector("#mg-result").innerHTML = `
      <div class="empty-state">
        🎉 Xong! Thời gian: ${seconds}s — Số lần sai: ${state.mistakes}
      </div>
      <button class="btn btn-primary" id="mg-again">Chơi vòng khác</button>
    `;
    container.querySelector("#mg-again").addEventListener("click", () => startRound(container));

    const stats = await Store.get("stats", { matchingRounds: 0 });
    await Store.merge("stats", { matchingRounds: (stats.matchingRounds || 0) + 1 });
  }

  return { render };
})();
