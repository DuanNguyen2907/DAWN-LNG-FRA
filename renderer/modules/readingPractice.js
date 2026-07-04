// Đọc hiểu: đọc trích đoạn Wikipedia tiếng Pháp thật (văn xuôi bách khoa),
// có bản dịch tự động, và có thể BẤM VÀO TỪNG TỪ để tra nghĩa nhanh ngay khi
// đang đọc — không cần rời khỏi bài để tra từ điển riêng.
window.ReadingPractice = (function () {
  const STORE_KEY = "readingTextCache";

  async function getCache(slug) {
    const store = await Store.get(STORE_KEY, {});
    return store[slug] || null;
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>📰 Đọc hiểu</h2>
      </div>
      <p class="game-sub">
        Trích đoạn thật từ Wikipedia tiếng Pháp (văn xuôi, có dịch tự động bên dưới). Bấm vào bất kỳ từ nào trong bài để tra nghĩa nhanh.
      </p>
      <div class="lesson-chips" id="reading-chips"></div>
      <div id="reading-content"></div>
    `;

    const chipsZone = container.querySelector("#reading-chips");
    chipsZone.innerHTML = window.READING_TEXTS.map(
      (t) => `<button class="discover-chip" data-slug="${t.slug}"><span class="badge badge-${t.level}">${t.level}</span> ${t.title}</button>`
    ).join("");
    chipsZone.querySelectorAll("[data-slug]").forEach((btn) => {
      btn.addEventListener("click", () => {
        chipsZone.querySelectorAll(".discover-chip").forEach((b) => b.classList.toggle("active", b === btn));
        selectText(container, btn.dataset.slug);
      });
    });
  }

  async function selectText(container, slug) {
    const text = window.READING_TEXTS.find((t) => t.slug === slug);
    const zone = container.querySelector("#reading-content");
    zone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang tải bài đọc...")}</div>`;

    let cached = await getCache(slug);
    if (!cached || !cached.extract) {
      try {
        const extract = await window.ExternalSources.fetchWikipediaExtract(text.pageTitle);
        if (!extract) throw new Error("Không có nội dung");
        const trimmed = extract.slice(0, 1800);
        const translated = await Enrichment.translateLong(trimmed, "fr|vi");
        cached = { extract: trimmed, translated, fetchedAt: Date.now() };
        await Store.mergeNested(STORE_KEY, slug, cached);
      } catch (e) {
        zone.innerHTML = `
          <div class="empty-state">Không tải được bài này (có thể mất mạng hoặc bài chưa tồn tại).</div>
          <button class="btn btn-primary" id="reading-retry">🔄 Thử lại</button>
        `;
        zone.querySelector("#reading-retry").addEventListener("click", () => selectText(container, slug));
        return;
      }
    }

    const words = cached.extract.split(/(\s+)/); // giữ lại khoảng trắng để ghép lại đúng
    const clickableHtml = words
      .map((w) => {
        const clean = w.replace(/[.,!?;:"«»()]/g, "");
        if (!clean || /^\s+$/.test(w)) return w;
        return `<span class="reading-word" data-word="${clean.replace(/"/g, "&quot;")}">${w}</span>`;
      })
      .join("");

    zone.innerHTML = `
      <div class="grammar-card">
        <h3>${text.title}</h3>
        <div class="badge badge-${text.level}" style="margin-bottom:14px;display:inline-block;">${text.level}</div>
        <div class="grammar-block">
          <div class="grammar-block-label">🇫🇷 Nguyên văn (Wikipédia) — bấm vào từ để tra nghĩa</div>
          <div class="grammar-text reading-original">${clickableHtml}</div>
          <div id="reading-word-lookup" class="reading-word-lookup"></div>
        </div>
        <div class="grammar-block">
          <div class="grammar-block-label">🇻🇳 Bản dịch tự động</div>
          <div class="grammar-text">${cached.translated || '<span class="fc-error">Không dịch được</span>'}</div>
        </div>
        <a class="grammar-source-link" href="https://fr.wikipedia.org/wiki/${encodeURIComponent(text.pageTitle.replace(/ /g, "_"))}" target="_blank" rel="noopener">Xem bài đầy đủ trên Wikipédia ↗</a>
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
