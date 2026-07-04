// Phân tích câu — PHẠM VI CÓ GIỚI HẠN CÓ CHỦ ĐÍCH: chỉ nhận diện được các từ
// khớp với dữ liệu đã kiểm chứng của app (đại từ, động từ trong danh sách
// Chia động từ, mạo từ, danh từ/tính từ trong dữ liệu hợp giống). Từ nào
// không khớp sẽ hiện là "chưa nhận diện" thay vì đoán bừa — vì xây một bộ
// phân tích ngữ pháp tiếng Pháp tổng quát chính xác là bài toán NLP khó,
// không thể đảm bảo đúng nếu tự viết trong phạm vi dự án này.
window.SentenceAnalyzer = (function () {
  const ARTICLES = ["le", "la", "les", "un", "une", "des", "l'", "au", "aux", "du"];
  const NE_WORDS = ["ne", "n'", "pas", "jamais", "plus", "rien"];

  function stripPunctuation(token) {
    return token.replace(/[.,!?;:"«»()]/g, "");
  }

  // Tìm xem 1 từ có khớp dạng chia của động từ nào trong CONJUGATION_VERBS
  // ở thì nào, ngôi nào hay không — dựa trên bộ máy chia đã kiểm chứng đúng.
  function lookupVerbForm(word) {
    const lower = word.toLowerCase();
    for (const verb of window.CONJUGATION_VERBS) {
      for (const tense of window.ConjugationEngine.TENSES) {
        const forms = window.ConjugationEngine.getForms(verb, tense.key);
        if (!forms) continue;
        const idx = forms.findIndex((f) => f.toLowerCase() === lower);
        if (idx !== -1) {
          return { infinitive: verb.infinitive, tense: tense.label, pronoun: window.ConjugationEngine.PRONOUNS[idx].label };
        }
      }
    }
    return null;
  }

  function lookupNoun(word) {
    return window.GENDERED_NOUNS.find((n) => n.fr.toLowerCase() === word.toLowerCase()) || null;
  }

  function lookupAdjective(word) {
    const lower = word.toLowerCase();
    return window.AGREEMENT_ADJECTIVES.find((a) => a.base.toLowerCase() === lower || a.fem.toLowerCase() === lower) || null;
  }

  function analyzeToken(rawToken) {
    const token = stripPunctuation(rawToken);
    if (!token) return null;
    const lower = token.toLowerCase();

    const pronoun = window.ConjugationEngine.PRONOUNS.find((p) =>
      p.label.toLowerCase().split(" / ").includes(lower)
    );
    if (pronoun) return { token, type: "pronoun", label: "Chủ ngữ (đại từ)", detail: "" };

    if (ARTICLES.includes(lower)) return { token, type: "article", label: "Mạo từ", detail: "" };
    if (NE_WORDS.includes(lower)) return { token, type: "negation", label: "Từ phủ định", detail: "" };

    const verbMatch = lookupVerbForm(token);
    if (verbMatch) {
      return {
        token,
        type: "verb",
        label: "Động từ",
        detail: `Nguyên mẫu: ${verbMatch.infinitive} · Thì: ${verbMatch.tense} · Ngôi: ${verbMatch.pronoun}`,
      };
    }

    const noun = lookupNoun(token);
    if (noun) return { token, type: "noun", label: "Danh từ", detail: `${noun.vi} · Giống ${noun.gender === "m" ? "đực" : "cái"}` };

    const adj = lookupAdjective(token);
    if (adj) return { token, type: "adjective", label: "Tính từ", detail: adj.vi };

    return { token, type: "unknown", label: "Chưa nhận diện được", detail: "" };
  }

  function analyze(sentence) {
    return sentence
      .trim()
      .split(/\s+/)
      .map(analyzeToken)
      .filter(Boolean);
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>🔬 Phân tích câu</h2>
      </div>
      <p class="game-sub">
        Gõ một câu tiếng Pháp để xem từng từ được nhận diện thế nào (chủ ngữ, động từ + thì + ngôi, mạo từ, danh từ, tính từ).
        <b>Lưu ý:</b> công cụ này chỉ nhận diện được từ có trong dữ liệu đã kiểm chứng của app (danh sách động từ ở mục Chia động từ,
        danh từ/tính từ ở bài tập Ngữ pháp) — không phải một bộ phân tích ngữ pháp tổng quát cho mọi câu tiếng Pháp.
      </p>
      <div class="sa-input-row">
        <input type="text" id="sa-input" class="text-input sa-input" placeholder="Vd: Je mange une pomme" autocomplete="off" />
        <button class="btn btn-primary" id="sa-analyze">Phân tích</button>
      </div>
      <div id="sa-result"></div>
      <div class="sa-examples">
        <span class="muted">Thử nhanh:</span>
        <button class="discover-chip sa-example-chip" data-sentence="Je mange une pomme">Je mange une pomme</button>
        <button class="discover-chip sa-example-chip" data-sentence="Elle était contente">Elle était contente</button>
        <button class="discover-chip sa-example-chip" data-sentence="Nous irons à Paris">Nous irons à Paris</button>
      </div>
    `;

    const input = container.querySelector("#sa-input");
    function run() {
      const sentence = input.value.trim();
      if (!sentence) return;
      const tokens = analyze(sentence);
      renderResult(container, tokens);
    }

    container.querySelector("#sa-analyze").addEventListener("click", run);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run();
    });
    container.querySelectorAll(".sa-example-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        input.value = btn.dataset.sentence;
        run();
      });
    });
  }

  const TYPE_COLORS = {
    pronoun: "sa-tag-pronoun",
    verb: "sa-tag-verb",
    article: "sa-tag-article",
    noun: "sa-tag-noun",
    adjective: "sa-tag-adjective",
    negation: "sa-tag-negation",
    unknown: "sa-tag-unknown",
  };

  function renderResult(container, tokens) {
    const resultEl = container.querySelector("#sa-result");
    resultEl.innerHTML = `
      <div class="sa-sentence-row">
        ${tokens
          .map(
            (t) => `
          <div class="sa-token ${TYPE_COLORS[t.type]}">
            <div class="sa-token-word">${t.token}</div>
            <div class="sa-token-label">${t.label}</div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="sa-details">
        ${tokens
          .filter((t) => t.detail)
          .map((t) => `<div class="sa-detail-row"><b>${t.token}</b> — ${t.detail}</div>`)
          .join("")}
      </div>
    `;
  }

  return { render, analyze };
})();
