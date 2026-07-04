// Khám phá từ vựng: duyệt theo chủ đề qua Wiktionnaire, không giới hạn số
// lượng — bấm "Tải thêm" để lấy tiếp, danh sách đã tải được lưu lại trên máy
// nên lần sau mở lại không cần gọi lại Wiktionnaire (chỉ Enrichment mới cần
// mạng, và cũng được cache lại như các từ khác).
window.DiscoverVocab = (function () {
  const STORE_KEY = "discoverVocabState";
  let currentSlug = null;

  async function getCategoryState(slug) {
    const store = await Store.get(STORE_KEY, {});
    return store[slug] || { members: [], nextContinue: null, exhausted: false };
  }

  async function saveCategoryState(slug, state) {
    await Store.mergeNested(STORE_KEY, slug, state);
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>🔭 Khám phá từ vựng</h2>
      </div>
      <p class="game-sub">Duyệt từ vựng không giới hạn theo chủ đề, lấy trực tiếp từ Wiktionnaire. Từ đã tải được lưu lại trên máy — mở lại không cần tải lại.</p>
      <div class="discover-categories" id="discover-categories"></div>
      <div id="discover-content"></div>
    `;

    const catZone = container.querySelector("#discover-categories");
    catZone.innerHTML = window.DISCOVER_CATEGORIES.map(
      (c) => `<button class="discover-chip" data-slug="${c.slug}">${c.label}</button>`
    ).join("");

    catZone.querySelectorAll(".discover-chip").forEach((btn) => {
      btn.addEventListener("click", () => selectCategory(container, btn.dataset.slug));
    });

    if (currentSlug) selectCategory(container, currentSlug);
  }

  async function selectCategory(container, slug) {
    currentSlug = slug;
    container.querySelectorAll(".discover-chip").forEach((b) => b.classList.toggle("active", b.dataset.slug === slug));
    const category = window.DISCOVER_CATEGORIES.find((c) => c.slug === slug);
    const contentZone = container.querySelector("#discover-content");
    contentZone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang tải danh sách từ...")}</div>`;

    let state = await getCategoryState(slug);

    if (state.members.length === 0 && !state.exhausted) {
      try {
        const { members, nextContinue } = await window.ExternalSources.fetchWiktionaryCategoryMembers(category.categoryTitle);
        state = { members, nextContinue, exhausted: !nextContinue };
        await saveCategoryState(slug, state);
      } catch (e) {
        contentZone.innerHTML = `
          <div class="empty-state">Không tải được chủ đề này (có thể do mất mạng hoặc chủ đề chưa có trên Wiktionnaire).</div>
          <button class="btn btn-primary" id="discover-retry">🔄 Thử lại</button>
        `;
        contentZone.querySelector("#discover-retry").addEventListener("click", () => selectCategory(container, slug));
        return;
      }
    }

    renderWordList(container, slug, state);
  }

  function renderWordList(container, slug, state) {
    const contentZone = container.querySelector("#discover-content");

    if (state.members.length === 0) {
      contentZone.innerHTML = `<div class="empty-state">Chủ đề này chưa có từ nào trên Wiktionnaire.</div>`;
      return;
    }

    contentZone.innerHTML = `
      <div class="game-sub">${state.members.length} từ đã tải</div>
      <div class="vocab-list" id="discover-word-list"></div>
      <div class="discover-load-more">
        ${
          state.exhausted
            ? `<span class="muted">Đã tải hết từ trong chủ đề này.</span>`
            : `<button class="btn btn-primary" id="discover-load-more-btn">⬇️ Tải thêm từ</button>`
        }
      </div>
    `;

    const listEl = contentZone.querySelector("#discover-word-list");
    listEl.innerHTML = state.members
      .map(
        (term, i) => `
        <div class="vocab-row" data-idx="${i}">
          <div class="vocab-row-main">
            <div class="vocab-row-fr">${term}</div>
            <div class="vocab-row-meaning" id="disc-meaning-${slug}-${i}"><span class="skeleton-row" style="width:120px;display:inline-block;"></span></div>
            <div class="vocab-row-example" id="disc-example-${slug}-${i}"></div>
          </div>
          <button class="btn-icon" data-word="${term.replace(/"/g, "&quot;")}" title="Nghe phát âm">🔊</button>
        </div>
      `
      )
      .join("");

    listEl.querySelectorAll("button[data-word]").forEach((btn) => {
      btn.addEventListener("click", () => DictAPI.pronounce(btn.dataset.word));
    });

    state.members.forEach((term, i) => loadWordMeaning(slug, i, term));

    const loadMoreBtn = contentZone.querySelector("#discover-load-more-btn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", async () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = "Đang tải...";
        const category = window.DISCOVER_CATEGORIES.find((c) => c.slug === slug);
        try {
          const { members: newMembers, nextContinue } = await window.ExternalSources.fetchWiktionaryCategoryMembers(
            category.categoryTitle,
            state.nextContinue
          );
          const merged = { members: [...state.members, ...newMembers], nextContinue, exhausted: !nextContinue };
          await saveCategoryState(slug, merged);
          renderWordList(container, slug, merged);
        } catch (e) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "⬇️ Tải thêm từ (thử lại)";
        }
      });
    }
  }

  async function loadWordMeaning(slug, index, term) {
    // Dùng lại toàn bộ hạ tầng Enrichment (dịch, ví dụ, audio, cache) như từ vựng cốt lõi,
    // chỉ khác là id dạng chuỗi để không đụng ID số của bộ từ đã phân cấp độ.
    const syntheticWord = { id: `wikt_${slug}_${term}`, fr: term };
    const data = await Enrichment.getForWord(syntheticWord);
    const meaningEl = document.getElementById(`disc-meaning-${slug}-${index}`);
    const exampleEl = document.getElementById(`disc-example-${slug}-${index}`);
    if (!meaningEl) return;
    meaningEl.innerHTML = data.vi
      ? `<span class="vocab-row-vi">${data.vi}</span>`
      : `<span class="fc-error">Không dịch được</span>`;
    if (exampleEl && data.exampleFr) {
      exampleEl.innerHTML = `${data.exampleFr} <span class="muted">— ${data.exampleVi || ""}</span>`;
    }
  }

  return { render };
})();
