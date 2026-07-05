// Tiện ích dùng chung cho việc trực quan hoá ngữ pháp:
// - highlightExample: tô màu 1 cụm từ trong câu theo vai trò ngữ pháp
// - genderBadge: huy hiệu màu cho giống đực/cái (♂ xanh dương / ♀ hồng)
// - tenseTimelineSVG: dòng thời gian trực quan cho các thì
window.GrammarUtils = (function () {
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Bọc phần "highlight" trong câu "fr" bằng span màu theo vai trò (role).
  // Nếu không tìm thấy chuỗi khớp, trả về câu gốc không tô màu (an toàn).
  function highlightExample(fr, highlight, role) {
    if (!highlight) return escapeHtml(fr);
    const idx = fr.indexOf(highlight);
    if (idx === -1) return escapeHtml(fr);
    const before = escapeHtml(fr.slice(0, idx));
    const mid = escapeHtml(fr.slice(idx, idx + highlight.length));
    const after = escapeHtml(fr.slice(idx + highlight.length));
    return `${before}<span class="gram-hl gram-hl-${role || "other"}">${mid}</span>${after}`;
  }

  function genderBadge(gender) {
    if (gender === "m") return `<span class="gender-badge gender-m" title="Giống đực">♂ đực</span>`;
    if (gender === "f") return `<span class="gender-badge gender-f" title="Giống cái">♀ cái</span>`;
    return "";
  }

  // Dòng thời gian trực quan: đánh dấu vị trí thì được nhấn mạnh so với hiện
  // tại. imparfait/passe-compose vẽ bên trái "hiện tại", futur/conditionnel
  // vẽ bên phải. imparfait vẽ dạng thanh kéo dài (kéo dài, mờ dần), passé
  // composé vẽ dạng 1 chấm rõ (hành động chớp nhoáng, 1 lần).
  function tenseTimelineSVG(highlightTenses) {
    const active = new Set(highlightTenses || []);
    const dim = (key) => (active.size === 0 || active.has(key) ? 1 : 0.25);
    return `
      <svg viewBox="0 0 560 130" width="100%" height="130" class="tense-timeline-svg">
        <line x1="20" y1="65" x2="540" y2="65" stroke="var(--ink-softer)" stroke-width="3" stroke-linecap="round"/>
        <!-- Imparfait: thanh kéo dài bên trái, thể hiện trạng thái/thói quen kéo dài -->
        <rect x="40" y="58" width="120" height="14" rx="7" fill="var(--coral)" opacity="${dim("imparfait")}"/>
        <text x="100" y="40" text-anchor="middle" fill="var(--chalk)" font-size="13" opacity="${dim("imparfait")}">Imparfait</text>
        <text x="100" y="98" text-anchor="middle" fill="var(--chalk-dim)" font-size="10.5" opacity="${dim("imparfait")}">bối cảnh, thói quen</text>

        <!-- Passé composé: 1 chấm rõ, hành động chớp nhoáng 1 lần -->
        <circle cx="220" cy="65" r="9" fill="var(--gold)" opacity="${dim("passe-compose")}"/>
        <text x="220" y="40" text-anchor="middle" fill="var(--chalk)" font-size="13" opacity="${dim("passe-compose")}">Passé composé</text>
        <text x="220" y="98" text-anchor="middle" fill="var(--chalk-dim)" font-size="10.5" opacity="${dim("passe-compose")}">hành động 1 lần</text>

        <!-- Hiện tại -->
        <circle cx="330" cy="65" r="6" fill="var(--chalk)"/>
        <text x="330" y="40" text-anchor="middle" fill="var(--chalk)" font-size="13" font-weight="700">Maintenant</text>
        <text x="330" y="98" text-anchor="middle" fill="var(--chalk-dim)" font-size="10.5">hiện tại</text>

        <!-- Futur / Conditionnel: bên phải, hướng về tương lai -->
        <rect x="400" y="58" width="120" height="14" rx="7" fill="var(--teal)" opacity="${dim("futur")}"/>
        <text x="460" y="40" text-anchor="middle" fill="var(--chalk)" font-size="13" opacity="${dim("futur")}">Futur</text>
        <text x="460" y="98" text-anchor="middle" fill="var(--chalk-dim)" font-size="10.5" opacity="${dim("futur")}">sẽ xảy ra</text>

        <polygon points="535,60 545,65 535,70" fill="var(--ink-softer)"/>
      </svg>
    `;
  }

  return { highlightExample, genderBadge, tenseTimelineSVG };
})();
