// Ôn tập thông minh: gộp (1) từ đến hạn ôn theo SRS, (2) từ hay sai ở
// Đố vui/Nối từ/Gõ nhanh, (3) vài từ mới — thành MỘT phiên ôn duy nhất mỗi
// ngày, ưu tiên từ cần chú ý nhất lên đầu. Dùng lại giao diện lật thẻ có sẵn
// của Thẻ từ (FlashcardsGame) để không phải xây UI riêng.
window.SmartReview = (function () {
  const SESSION_SIZE = 20;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function buildSmartPool() {
    const srsCards = await Store.get("srsCards", {});
    const weakWords = await Store.get("weakWords", {});

    const dueWords = window.VOCAB_DATA.filter((w) => srsCards[w.id] && SRS.isDue(srsCards[w.id]));

    const weakIds = Object.keys(weakWords)
      .map((id) => (isNaN(id) ? id : Number(id)))
      .sort((a, b) => (weakWords[b].count || 0) - (weakWords[a].count || 0));
    const weakWordsList = weakIds
      .map((id) => window.VOCAB_DATA.find((w) => w.id === id))
      .filter(Boolean)
      .filter((w) => !dueWords.some((d) => d.id === w.id));

    const touchedIds = new Set(Object.keys(srsCards).map((id) => (isNaN(id) ? id : Number(id))));
    const newWords = shuffle(window.VOCAB_DATA.filter((w) => !touchedIds.has(w.id))).slice(0, 5);

    const pool = [...dueWords, ...weakWordsList, ...newWords].slice(0, SESSION_SIZE);
    return {
      pool,
      dueCount: dueWords.length,
      weakCount: weakWordsList.length,
      newCount: Math.min(newWords.length, Math.max(0, SESSION_SIZE - dueWords.length - weakWordsList.length)),
    };
  }

  async function render(container) {
    container.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang chuẩn bị phiên ôn tập...")}</div>`;
    const { pool, dueCount, weakCount, newCount } = await buildSmartPool();

    if (pool.length === 0) {
      container.innerHTML = `
        <div class="game-header"><h2>🎯 Ôn tập thông minh</h2></div>
        <div class="empty-state">
          🎉 Không có gì cần ôn ngay lúc này! Hãy học vài từ mới ở Thẻ từ hoặc quay lại sau.
        </div>
        <button class="btn btn-primary" id="sr-goto-flashcards" style="margin-top:14px;">🃏 Học từ mới</button>
      `;
      container.querySelector("#sr-goto-flashcards").addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: "flashcards" }));
      });
      return;
    }

    container.innerHTML = `
      <div class="game-header"><h2>🎯 Ôn tập thông minh</h2></div>
      <div class="smart-review-breakdown">
        ${dueCount > 0 ? `<span class="sr-chip sr-chip-due">🔴 ${dueCount} đến hạn</span>` : ""}
        ${weakCount > 0 ? `<span class="sr-chip sr-chip-weak">🟡 ${Math.min(weakCount, pool.length - dueCount)} hay sai</span>` : ""}
        ${newCount > 0 ? `<span class="sr-chip sr-chip-new">🟢 ${newCount} từ mới</span>` : ""}
      </div>
      <div id="sr-flashcard-zone"></div>
    `;

    await window.FlashcardsGame.render(container.querySelector("#sr-flashcard-zone"), pool);
  }

  return { render };
})();
