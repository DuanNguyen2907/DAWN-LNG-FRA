// Mục "Đã học": xem lại tất cả từ đã từng ôn qua Thẻ từ (có dữ liệu SRS),
// biết từ nào đã thuộc, từ nào sắp quên, và ôn nhanh ngay tại chỗ (bấm vào
// dòng để lật xem nghĩa) mà không cần chơi lại từ đầu.
window.LearnedWords = (function () {
  let state = { level: "all", sort: "recent" };

  function masteryInfo(card) {
    if (!card) return { label: "Chưa ôn", cls: "mastery-new" };
    if (card.repetition >= 5) return { label: "Thành thạo", cls: "mastery-high" };
    if (card.repetition >= 2) return { label: "Đang nhớ", cls: "mastery-mid" };
    return { label: "Mới học", cls: "mastery-low" };
  }

  function formatDueIn(card) {
    const now = Date.now();
    const due = new Date(card.dueDate).getTime();
    const diffMs = due - now;
    if (diffMs <= 0) return { text: "Đến hạn ôn", overdue: true };
    const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
    if (days <= 0) return { text: "Trong hôm nay", overdue: false };
    return { text: `Còn ${days} ngày`, overdue: false };
  }

  async function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>📗 Từ đã học</h2>
      </div>
      <p class="game-sub">Toàn bộ từ bạn đã từng ôn qua Thẻ từ, kèm mức độ ghi nhớ. Bấm vào một từ để ôn nhanh ngay tại đây.</p>
      <div class="browser-filters">
        <select id="lw-level" class="level-select">
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
        <select id="lw-sort" class="level-select">
          <option value="recent">Ôn gần đây nhất</option>
          <option value="due">Sắp đến hạn ôn</option>
          <option value="mastery">Mức độ thuộc (thấp → cao)</option>
        </select>
      </div>
      <div id="lw-summary" class="lw-summary"></div>
      <div id="lw-list" class="vocab-list"></div>
    `;

    container.querySelector("#lw-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      renderList(container);
    });
    container.querySelector("#lw-sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderList(container);
    });

    renderList(container);
  }

  async function renderList(container) {
    const srsCards = await Store.get("srsCards", {});
    const learnedIds = Object.keys(srsCards).map((id) => (isNaN(id) ? id : Number(id)));
    let words = window.VOCAB_DATA.filter((w) => learnedIds.includes(w.id));
    if (state.level !== "all") words = words.filter((w) => w.level === state.level);

    const withCards = words.map((w) => ({ word: w, card: srsCards[w.id] }));

    if (state.sort === "due") {
      withCards.sort((a, b) => new Date(a.card.dueDate) - new Date(b.card.dueDate));
    } else if (state.sort === "mastery") {
      withCards.sort((a, b) => (a.card.repetition || 0) - (b.card.repetition || 0));
    } else {
      withCards.sort((a, b) => new Date(b.card.dueDate) - new Date(a.card.dueDate));
    }

    const totalLearned = Object.keys(srsCards).length;
    const mastered = Object.values(srsCards).filter((c) => c.repetition >= 5).length;
    const dueNow = window.VOCAB_DATA.filter((w) => srsCards[w.id] && SRS.isDue(srsCards[w.id])).length;

    container.querySelector("#lw-summary").innerHTML = `
      <div class="stat-card"><div class="stat-value">${totalLearned}</div><div class="stat-label">Đã đụng tới</div></div>
      <div class="stat-card"><div class="stat-value">${mastered}</div><div class="stat-label">Thành thạo</div></div>
      <div class="stat-card"><div class="stat-value">${dueNow}</div><div class="stat-label">Cần ôn ngay</div></div>
      ${dueNow > 0 ? `<button class="btn btn-primary lw-review-btn" id="lw-review-now">🔁 Ôn ${dueNow} từ đến hạn</button>` : ""}
    `;
    const reviewBtn = container.querySelector("#lw-review-now");
    if (reviewBtn) {
      reviewBtn.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: "flashcards" }));
      });
    }

    const listEl = container.querySelector("#lw-list");
    if (withCards.length === 0) {
      listEl.innerHTML = `<div class="empty-state">Chưa có từ nào được ôn qua Thẻ từ. Vào mục 🃏 Thẻ từ để bắt đầu học nhé!</div>`;
      return;
    }

    listEl.innerHTML = withCards
      .map(({ word, card }, i) => {
        const mastery = masteryInfo(card);
        const due = formatDueIn(card);
        return `
        <div class="vocab-row lw-row" data-idx="${i}">
          <span class="badge badge-${word.level}">${word.level}</span>
          <div class="vocab-row-main">
            <div class="vocab-row-fr">${word.fr}</div>
            <div class="lw-meta">
              <span class="lw-mastery ${mastery.cls}">${mastery.label}</span>
              <span class="lw-due ${due.overdue ? "lw-due-overdue" : ""}">${due.text}</span>
            </div>
            <div class="vocab-row-meaning lw-reveal" id="lw-reveal-${i}" style="display:none;"></div>
          </div>
          <button class="btn-icon" data-word="${word.fr}" title="Nghe phát âm">🔊</button>
        </div>
      `;
      })
      .join("");

    listEl.querySelectorAll('button[data-word]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        DictAPI.pronounce(btn.dataset.word);
      });
    });

    listEl.querySelectorAll(".lw-row").forEach((row) => {
      row.addEventListener("click", async () => {
        const idx = Number(row.dataset.idx);
        const revealEl = row.querySelector(".lw-reveal");
        const isOpen = revealEl.style.display !== "none";
        if (isOpen) {
          revealEl.style.display = "none";
          return;
        }
        listEl.querySelectorAll(".lw-reveal").forEach((el) => (el.style.display = "none"));
        const { word } = withCards[idx];
        revealEl.style.display = "block";
        revealEl.innerHTML = `<span class="skeleton-row" style="width:140px;display:inline-block;"></span>`;
        const data = await Enrichment.getForWord(word);
        revealEl.innerHTML = data.vi
          ? `<span class="vocab-row-vi">${data.vi}</span>${data.exampleFr ? `<div class="vocab-row-example">${data.exampleFr}</div>` : ""}`
          : `<span class="fc-error">Không dịch được</span>`;
      });
    });
  }

  return { render };
})();
