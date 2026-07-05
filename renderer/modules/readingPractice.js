// Đọc hiểu: (1) vài bài gợi ý sẵn theo cấp độ ước lượng, và (2) khám phá
// thêm bài đọc KHÔNG GIỚI HẠN theo chủ đề qua Wikipedia — bấm "Tải thêm bài"
// để lấy tiếp, danh sách đã tải được lưu lại trên máy như phần Khám phá từ
// vựng. Nội dung đọc luôn là văn xuôi bách khoa thật, có dịch tự động, và có
// thể bấm vào từng từ để tra nghĩa ngay khi đang đọc.
window.ReadingPractice = (function () {
  const TEXT_CACHE_KEY = "readingTextCache";
  const DISCOVER_STATE_KEY = "readingDiscoverState";
  let currentCategorySlug = null;

  async function getTextCache(slug) {
    const store = await Store.get(TEXT_CACHE_KEY, {});
    return store[slug] || null;
  }

  async function getCategoryState(slug) {
    const store = await Store.get(DISCOVER_STATE_KEY, {});
    return store[slug] || { members: [], nextContinue: null, exhausted: false };
  }

  async function saveCategoryState(slug, state) {
    await Store.mergeNested(DISCOVER_STATE_KEY, slug, state);
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>📰 Đọc hiểu</h2>
      </div>
      <p class="game-sub">
        Trích đoạn thật từ Wikipedia tiếng Pháp (văn xuôi, có dịch tự động bên dưới). Bấm vào bất kỳ từ nào trong bài để tra nghĩa nhanh.
      </p>

      <h3 class="section-title" style="margin-top:8px;">✨ Bài gợi ý</h3>
      <div class="lesson-chips" id="reading-suggested-chips"></div>

      <h3 class="section-title" style="margin-top:32px;">🔭 Khám phá thêm theo chủ đề</h3>
      <p class="game-sub">Chọn một chủ đề, tải thêm bài đọc liên tục — không giới hạn số lượng.</p>
      <div class="discover-categories" id="reading-category-chips"></div>
      <div id="reading-article-list"></div>

      <div id="reading-content"></div>
    `;

    const suggestedZone = container.querySelector("#reading-suggested-chips");
    suggestedZone.innerHTML = window.READING_TEXTS.map(
      (t) => `<button class="discover-chip" data-kind="suggested" data-slug="${t.slug}"><span class="badge badge-${t.level}">${t.level}</span> ${t.title}</button>`
    ).join("");

    const categoryZone = container.querySelector("#reading-category-chips");
    categoryZone.innerHTML = window.READING_CATEGORIES.map(
      (c) => `<button class="discover-chip" data-cat-slug="${c.slug}">${c.label}</button>`
    ).join("");

    container.querySelectorAll('[data-kind="suggested"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".discover-chip").forEach((b) => b.classList.toggle("active", b === btn));
        const t = window.READING_TEXTS.find((x) => x.slug === btn.dataset.slug);
        openArticle(container, { slug: `suggested_${t.slug}`, title: t.title, pageTitle: t.pageTitle, level: t.level });
      });
    });

    categoryZone.querySelectorAll("[data-cat-slug]").forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryZone.querySelectorAll(".discover-chip").forEach((b) => b.classList.toggle("active", b === btn));
        selectCategory(container, btn.dataset.catSlug);
      });
    });

    if (currentCategorySlug) selectCategory(container, currentCategorySlug);
  }

  async function selectCategory(container, slug) {
    currentCategorySlug = slug;
    const category = window.READING_CATEGORIES.find((c) => c.slug === slug);
    const listZone = container.querySelector("#reading-article-list");
    listZone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang tải danh sách bài viết...")}</div>`;

    let state = await getCategoryState(slug);
    if (state.members.length === 0 && !state.exhausted) {
      try {
        const { members, nextContinue } = await window.ExternalSources.fetchWikipediaCategoryMembers(category.categoryTitle);
        state = { members, nextContinue, exhausted: !nextContinue };
        await saveCategoryState(slug, state);
      } catch (e) {
        listZone.innerHTML = `
          <div class="empty-state">Không tải được chủ đề này (mất mạng hoặc chủ đề chưa có trên Wikipedia).</div>
          <button class="btn btn-primary" id="reading-cat-retry">🔄 Thử lại</button>
        `;
        listZone.querySelector("#reading-cat-retry").addEventListener("click", () => selectCategory(container, slug));
        return;
      }
    }
    renderArticleList(container, slug, state);
  }

  function renderArticleList(container, slug, state) {
    const listZone = container.querySelector("#reading-article-list");
    const category = window.READING_CATEGORIES.find((c) => c.slug === slug);

    if (state.members.length === 0) {
      listZone.innerHTML = `<div class="empty-state">Chủ đề này chưa có bài viết nào phù hợp trên Wikipedia.</div>`;
      return;
    }

    listZone.innerHTML = `
      <div class="game-sub">${state.members.length} bài đã tải trong "${category.label}"</div>
      <div class="reading-article-chips">
        ${state.members
          .map((title) => `<button class="discover-chip reading-article-chip" data-title="${title.replace(/"/g, "&quot;")}">${title}</button>`)
          .join("")}
      </div>
      <div class="discover-load-more">
        ${
          state.exhausted
            ? `<span class="muted">Đã tải hết bài trong chủ đề này.</span>`
            : `<button class="btn btn-primary" id="reading-load-more-btn">⬇️ Tải thêm bài</button>`
        }
      </div>
    `;

    listZone.querySelectorAll(".reading-article-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        listZone.querySelectorAll(".reading-article-chip").forEach((b) => b.classList.toggle("active", b === btn));
        const title = btn.dataset.title;
        openArticle(container, { slug: `discover_${slug}_${title}`, title, pageTitle: title, level: "Khám phá" });
      });
    });

    const loadMoreBtn = listZone.querySelector("#reading-load-more-btn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", async () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = "Đang tải...";
        try {
          const { members: newMembers, nextContinue } = await window.ExternalSources.fetchWikipediaCategoryMembers(
            category.categoryTitle,
            state.nextContinue
          );
          const merged = { members: [...state.members, ...newMembers], nextContinue, exhausted: !nextContinue };
          await saveCategoryState(slug, merged);
          renderArticleList(container, slug, merged);
        } catch (e) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "⬇️ Tải thêm bài (thử lại)";
        }
      });
    }
  }

  async function openArticle(container, article) {
    const zone = container.querySelector("#reading-content");
    zone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang tải bài đọc...")}</div>`;
    zone.scrollIntoView({ behavior: "smooth", block: "start" });

    let cached = await getTextCache(article.slug);
    if (!cached || !cached.extract) {
      try {
        const extract = await window.ExternalSources.fetchWikipediaExtract(article.pageTitle);
        if (!extract) throw new Error("Không có nội dung");
        const trimmed = extract.slice(0, 1800);
        const translated = await Enrichment.translateLong(trimmed, "fr|vi");
        cached = { extract: trimmed, translated, fetchedAt: Date.now() };
        await Store.mergeNested(TEXT_CACHE_KEY, article.slug, cached);
      } catch (e) {
        zone.innerHTML = `
          <div class="empty-state">Không tải được bài này (có thể mất mạng hoặc bài chưa tồn tại).</div>
          <button class="btn btn-primary" id="reading-retry">🔄 Thử lại</button>
        `;
        zone.querySelector("#reading-retry").addEventListener("click", () => openArticle(container, article));
        return;
      }
    }

    const words = cached.extract.split(/(\s+)/);
    const clickableHtml = words
      .map((w) => {
        const clean = w.replace(/[.,!?;:"«»()]/g, "");
        if (!clean || /^\s+$/.test(w)) return w;
        return `<span class="reading-word" data-word="${clean.replace(/"/g, "&quot;")}">${w}</span>`;
      })
      .join("");

    zone.innerHTML = `
      <div class="grammar-card">
        <h3>${article.title}</h3>
        <div class="badge badge-${["A1", "A2", "B1", "B2"].includes(article.level) ? article.level : "B1"}" style="margin-bottom:14px;display:inline-block;">${article.level}</div>
        <div class="grammar-block">
          <div class="grammar-block-label">🇫🇷 Nguyên văn (Wikipédia) — bấm vào từ để tra nghĩa</div>
          <div class="grammar-text reading-original">${clickableHtml}</div>
          <div id="reading-word-lookup" class="reading-word-lookup"></div>
        </div>
        <div class="grammar-block">
          <div class="grammar-block-label">🇻🇳 Bản dịch tự động</div>
          <div class="grammar-text">${cached.translated || '<span class="fc-error">Không dịch được</span>'}</div>
        </div>
        <a class="grammar-source-link" href="https://fr.wikipedia.org/wiki/${encodeURIComponent(article.pageTitle.replace(/ /g, "_"))}" target="_blank" rel="noopener">Xem bài đầy đủ trên Wikipédia ↗</a>
      </div>
    `;

    const lookupZone = zone.querySelector("#reading-word-lookup");
    zone.querySelectorAll(".reading-word").forEach((span) => {
      span.addEventListener("click", async () => {
        const word = span.dataset.word;
        DictAPI.pronounce(word);
        lookupZone.innerHTML = window.UIKit.spinnerHTML(`Đang tra "${word}"...`);
        const data = await Enrichment.getForWord({ id: `reading_${word.toLowerCase()}`, fr: word });
        lookupZone.innerHTML = `<b>${word}</b>: ${data.vi || "Không dịch được"}`;
      });
    });
  }

  return { render };
})();
