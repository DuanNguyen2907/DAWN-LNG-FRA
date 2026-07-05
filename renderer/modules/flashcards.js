// Mini-game: Flashcards (lật thẻ) + Spaced Repetition
// Nghĩa/ví dụ được lấy động qua Enrichment (API bên ngoài), có thể sửa tay.
window.FlashcardsGame = (function () {
  let state = { pool: [], index: 0, flipped: false, sessionCount: 0, level: "all", cache: {} };

  async function getCardsState() {
    return Store.get("srsCards", {});
  }

  async function buildPool(level) {
    const all = window.VOCAB_DATA.filter((w) => level === "all" || w.level === level);
    const cardsState = await getCardsState();
    const due = all.filter((w) => SRS.isDue(cardsState[w.id]));
    const rest = all.filter((w) => !SRS.isDue(cardsState[w.id]));
    const pool = [...shuffle(due), ...shuffle(rest)];
    return pool.slice(0, 20);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function render(container, customPool) {
    const pool = customPool || (await buildPool(state.level));
    state = { pool, index: 0, flipped: false, sessionCount: 0, level: state.level, cache: {} };
    container.innerHTML = `
      <div class="game-header">
        <h2>🃏 Thẻ từ vựng</h2>
        <select id="fc-level" class="level-select">
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">A1 - Cơ bản</option>
          <option value="A2">A2 - Sơ cấp</option>
          <option value="B1">B1 - Trung cấp</option>
          <option value="B2">B2 - Nâng cao</option>
          <option value="C1">C1 - Thành thạo</option>
          <option value="C2">C2 - Xuất sắc</option>
        </select>
      </div>
      <p class="game-sub">Nhấn vào thẻ để lật, rồi tự đánh giá mức độ nhớ của bạn. Nghĩa được lấy tự động qua API — nếu thấy dịch sai, bấm ✏️ để sửa lại.</p>
      <div id="fc-progress" class="progress-text"></div>
      <div id="fc-card-zone"></div>
      <div id="fc-actions"></div>
    `;
    container.querySelector("#fc-level").value = state.level;
    container.querySelector("#fc-level").addEventListener("change", async (e) => {
      state.level = e.target.value;
      await render(container);
    });
    renderCard(container);
  }

  function getEnrichment(word) {
    if (!state.cache[word.id]) {
      state.cache[word.id] = Enrichment.getForWord(word);
    }
    return state.cache[word.id];
  }

  function renderCard(container) {
    const progressEl = container.querySelector("#fc-progress");
    const cardZone = container.querySelector("#fc-card-zone");
    const actionsZone = container.querySelector("#fc-actions");

    if (state.pool.length === 0) {
      cardZone.innerHTML = `<div class="empty-state">Không có từ nào trong cấp độ này.</div>`;
      actionsZone.innerHTML = "";
      return;
    }

    if (state.index >= state.pool.length) {
      cardZone.innerHTML = `
        <div class="empty-state">
          🎉 Xong phiên học này! Bạn đã ôn ${state.sessionCount} từ.
        </div>`;
      actionsZone.innerHTML = `<button class="btn btn-primary" id="fc-restart">Học thêm phiên nữa</button>`;
      actionsZone.querySelector("#fc-restart").addEventListener("click", () => render(container));
      progressEl.textContent = "";
      return;
    }

    const word = state.pool[state.index];
    progressEl.textContent = `Thẻ ${state.index + 1} / ${state.pool.length}`;
    getEnrichment(word); // bắt đầu tải trước, để lúc lật thẻ đỡ phải chờ

    cardZone.innerHTML = `
      <div class="flashcard ${state.flipped ? "flipped" : ""}" id="fc-card">
        <div class="flashcard-inner">
          <div class="flashcard-face flashcard-front">
            <span class="badge badge-${word.level}">${word.level}</span>
            <div class="fc-word">${word.fr}</div>
            <button class="btn-icon" id="fc-speak" title="Nghe phát âm">🔊</button>
            <div class="fc-hint">Nhấn để xem nghĩa</div>
          </div>
          <div class="flashcard-face flashcard-back" id="fc-back">
            ${window.UIKit.spinnerHTML("Đang tải nghĩa...")}
          </div>
        </div>
      </div>
    `;

    cardZone.querySelector("#fc-card").addEventListener("click", (e) => {
      if (e.target.id === "fc-speak") return;
      if (e.target.closest(".fc-edit-form")) return;
      state.flipped = !state.flipped;
      renderCard(container);
    });
    const speakBtn = cardZone.querySelector("#fc-speak");
    if (speakBtn) {
      speakBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        DictAPI.pronounce(word.fr);
      });
    }

    if (state.flipped) {
      fillBack(container, word);
      actionsZone.innerHTML = `
        <div class="rating-row">
          <button class="btn btn-danger" data-q="1">😵 Khó / Quên</button>
          <button class="btn btn-warning" data-q="3">🤔 Tạm được</button>
          <button class="btn btn-success" data-q="5">😎 Dễ ợt</button>
        </div>
      `;
      actionsZone.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (actionsZone.dataset.locked === "1") return; // Bug fix: chặn bấm nhiều nút đánh giá liên tiếp
          actionsZone.dataset.locked = "1";
          actionsZone.querySelectorAll("button").forEach((b) => (b.disabled = true));
          const quality = Number(btn.dataset.q);
          if (quality >= 5) SoundFX.correct();
          else if (quality <= 1) SoundFX.wrong();
          else SoundFX.click();
          const cardsState = await getCardsState();
          const updated = SRS.review(cardsState[word.id], quality);
          await Store.merge("srsCards", { [word.id]: updated });
          await bumpStats();
          state.sessionCount += 1;
          state.index += 1;
          state.flipped = false;
          renderCard(container);
        });
      });
    } else {
      actionsZone.innerHTML = "";
    }
  }

  async function fillBack(container, word) {
    const backEl = container.querySelector("#fc-back");
    if (!backEl) return;
    const data = await getEnrichment(word);
    const stillSameCard = state.pool[state.index] && state.pool[state.index].id === word.id;
    if (!backEl.isConnected || !stillSameCard) return;

    backEl.innerHTML = `
      <div class="fc-field">
        <div class="fc-meaning">${data.vi ? data.vi : '<span class="fc-error">Không dịch được</span>'}</div>
        <button class="btn-icon fc-edit-btn" data-field="meaning" title="Sửa nghĩa">✏️</button>
      </div>
      <div class="fc-field fc-example-field">
        ${
          data.exampleFr
            ? `<div class="fc-example">${data.exampleFr}</div><div class="fc-example fc-example-vi">${data.exampleVi || ""}</div>`
            : `<div class="fc-error">Chưa tìm được câu ví dụ</div>`
        }
        <button class="btn-icon fc-edit-btn" data-field="example" title="Sửa ví dụ">✏️</button>
      </div>
      ${data.viError || data.exampleError ? `<button class="btn-icon fc-retry-btn" title="Thử tải lại">🔄</button>` : ""}
      <div class="fc-source">${data.viSource === "user" ? "✓ Đã sửa tay" : "Nguồn: dịch tự động"}</div>
    `;

    backEl.querySelector(".fc-edit-btn[data-field='meaning']").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditForm(backEl, "meaning", word, data, container);
    });
    backEl.querySelector(".fc-edit-btn[data-field='example']").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditForm(backEl, "example", word, data, container);
    });
    const retryBtn = backEl.querySelector(".fc-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        backEl.innerHTML = `<div class="fc-loading">Đang thử lại...</div>`;
        state.cache[word.id] = Enrichment.refetch(word);
        fillBack(container, word);
      });
    }
  }

  function openEditForm(backEl, field, word, data, container) {
    const isMeaning = field === "meaning";
    const formHtml = isMeaning
      ? `<div class="fc-edit-form" onclick="event.stopPropagation()">
          <input type="text" class="text-input" id="fc-edit-input" value="${(data.vi || "").replace(/"/g, "&quot;")}" placeholder="Nhập nghĩa đúng..." />
          <div class="fc-edit-actions">
            <button class="btn btn-primary" id="fc-edit-save">Lưu</button>
            <button class="btn btn-icon" id="fc-edit-cancel">Hủy</button>
          </div>
        </div>`
      : `<div class="fc-edit-form" onclick="event.stopPropagation()">
          <input type="text" class="text-input" id="fc-edit-input-fr" value="${(data.exampleFr || "").replace(/"/g, "&quot;")}" placeholder="Câu ví dụ tiếng Pháp..." />
          <input type="text" class="text-input" id="fc-edit-input-vi" value="${(data.exampleVi || "").replace(/"/g, "&quot;")}" placeholder="Nghĩa câu ví dụ..." />
          <div class="fc-edit-actions">
            <button class="btn btn-primary" id="fc-edit-save">Lưu</button>
            <button class="btn btn-icon" id="fc-edit-cancel">Hủy</button>
          </div>
        </div>`;

    const overlay = document.createElement("div");
    overlay.className = "fc-edit-overlay";
    overlay.innerHTML = formHtml;
    backEl.appendChild(overlay);
    overlay.querySelector("input").focus();

    function onKeydown(e) {
      if (e.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
      }
    }
    document.addEventListener("keydown", onKeydown);

    overlay.querySelector("#fc-edit-cancel").addEventListener("click", () => {
      overlay.remove();
      document.removeEventListener("keydown", onKeydown);
    });
    overlay.querySelector("#fc-edit-save").addEventListener("click", async () => {
      document.removeEventListener("keydown", onKeydown);
      if (isMeaning) {
        const val = overlay.querySelector("#fc-edit-input").value.trim();
        if (val) await Enrichment.setUserMeaning(word.id, val);
      } else {
        const fr = overlay.querySelector("#fc-edit-input-fr").value.trim();
        const vi = overlay.querySelector("#fc-edit-input-vi").value.trim();
        await Enrichment.setUserExample(word.id, fr, vi);
      }
      const store = await Store.get("vocabEnrichment", {});
      state.cache[word.id] = Promise.resolve(store[word.id]);
      overlay.remove();
      fillBack(container, word);
    });
  }

  async function bumpStats() {
    const stats = await Store.get("stats", { wordsReviewed: 0 });
    await Store.merge("stats", { wordsReviewed: (stats.wordsReviewed || 0) + 1 });
  }

  return { render };
})();
