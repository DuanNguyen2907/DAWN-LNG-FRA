// Mini-game: Chia động từ (conjugaison) — chấm điểm bằng bộ máy quy tắc
// trong conjugation.js để đảm bảo luôn đúng.
window.ConjugationGame = (function () {
  let state = { level: "all", tenseKey: "all", score: 0, streak: 0, round: 0, totalRounds: 10, locked: false, bestStreak: 0 };

  function pool() {
    return window.CONJUGATION_VERBS.filter((v) => state.level === "all" || v.level === state.level);
  }

  function pickTense() {
    if (state.tenseKey !== "all") return state.tenseKey;
    const tenses = window.ConjugationEngine.TENSES;
    return tenses[Math.floor(Math.random() * tenses.length)].key;
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function render(container) {
    state = { ...state, score: 0, streak: 0, round: 0 };
    const levels = window.LEVELS;
    const tenses = window.ConjugationEngine.TENSES;

    container.innerHTML = `
      <div class="game-header">
        <h2>🔤 Chia động từ</h2>
        <div class="quiz-controls">
          <select id="cj-level" class="level-select">
            <option value="all">Tất cả cấp độ</option>
            ${levels.map((l) => `<option value="${l}">${l}</option>`).join("")}
          </select>
          <select id="cj-tense" class="level-select">
            <option value="all">Trộn cả 3 thì</option>
            ${tenses.map((t) => `<option value="${t.key}">${t.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <p class="game-sub">Gõ đúng dạng chia động từ (nhớ dấu trong tiếng Pháp!). Chấm điểm bằng quy tắc ngữ pháp, không qua API dịch, nên luôn chuẩn.</p>
      <div class="quiz-scorebar">
        <span>Điểm: <b id="cj-score">0</b></span>
        <span>Chuỗi đúng: <b id="cj-streak">0</b> 🔥</span>
        <span>Câu <b id="cj-round">0</b>/${state.totalRounds}</span>
      </div>
      <div id="cj-question-zone"></div>
    `;

    container.querySelector("#cj-level").value = state.level;
    container.querySelector("#cj-tense").value = state.tenseKey;
    container.querySelector("#cj-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      render(container);
    });
    container.querySelector("#cj-tense").addEventListener("change", (e) => {
      state.tenseKey = e.target.value;
      render(container);
    });

    nextQuestion(container);
  }

  function nextQuestion(container) {
    state.locked = false;
    const zone = container.querySelector("#cj-question-zone");
    const verbs = pool();

    if (state.round >= state.totalRounds) {
      zone.innerHTML = `
        <div class="empty-state">
          🏁 Hoàn thành! Điểm số: <b>${state.score}</b>/${state.totalRounds}<br/>
          Chuỗi đúng dài nhất: <b>${state.bestStreak}</b> 🔥
        </div>
        <button class="btn btn-primary" id="cj-restart">Chơi lại</button>
      `;
      zone.querySelector("#cj-restart").addEventListener("click", () => render(container));
      saveScore();
      return;
    }

    if (verbs.length === 0) {
      zone.innerHTML = `<div class="empty-state">Không có động từ nào trong cấp độ này.</div>`;
      return;
    }

    const verb = randomFrom(verbs);
    const tenseKey = pickTense();
    const tenseLabel = window.ConjugationEngine.TENSES.find((t) => t.key === tenseKey).label;
    const forms = window.ConjugationEngine.getForms(verb, tenseKey);

    if (!forms) {
      // An toàn: nếu vì lý do gì đó không tính được (không nên xảy ra), bỏ qua câu này
      state.round += 1;
      nextQuestion(container);
      return;
    }

    const pronounIndex = Math.floor(Math.random() * window.ConjugationEngine.PRONOUNS.length);
    const pronoun = window.ConjugationEngine.PRONOUNS[pronounIndex];
    const correctForm = forms[pronounIndex];

    zone.innerHTML = `
      <div class="quiz-card">
        <div class="conjugation-prompt">
          Chia <b>${verb.infinitive}</b> — <span class="badge badge-${verb.level}">${verb.level}</span><br/>
          <span class="conjugation-tense">${tenseLabel}</span>
        </div>
        <div class="conjugation-input-row">
          <span class="conjugation-pronoun">${pronoun.label}</span>
          <input type="text" id="cj-answer" class="text-input conjugation-input" autocomplete="off" placeholder="Gõ đáp án..." />
          <button class="btn btn-primary" id="cj-submit">Kiểm tra</button>
        </div>
        <div id="cj-feedback" class="quiz-feedback"></div>
        <button class="btn-icon" id="cj-hint-toggle" title="Xem bảng chia đầy đủ" style="margin-top:14px;">📋 Xem bảng chia đầy đủ</button>
        <div id="cj-hint-table"></div>
      </div>
    `;

    const input = zone.querySelector("#cj-answer");
    input.focus();

    function submit() {
      if (state.locked) return;
      state.locked = true;
      const userAnswer = window.ConjugationEngine.normalizeAnswer(input.value);
      const isCorrect = userAnswer === window.ConjugationEngine.normalizeAnswer(correctForm);
      const feedback = zone.querySelector("#cj-feedback");
      const fullCorrect = window.ConjugationEngine.formatWithPronoun(pronoun.key, correctForm);

      if (isCorrect) {
        state.score += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        feedback.textContent = `Chính xác! ${fullCorrect} 🎉`;
        feedback.className = "quiz-feedback feedback-good";
        SoundFX.correct();
      } else {
        state.streak = 0;
        feedback.innerHTML = `Chưa đúng. Đáp án: <b>${fullCorrect}</b>`;
        feedback.className = "quiz-feedback feedback-bad";
        SoundFX.wrong();
      }
      // Bug fix: đại từ "il / elle" đọc thẳng sẽ phát âm luôn dấu "/", nghe rất kỳ.
      // Bỏ phần "/ elle" trước khi đưa qua TTS, chỉ giữ "il" để đọc tự nhiên.
      const speechText = fullCorrect.replace(/^j'/, "je ").replace(/\s*\/\s*elle/, "");
      DictAPI.pronounce(speechText);
      updateBars(container);
      state.round += 1;
      bumpStats(isCorrect);
      setTimeout(() => nextQuestion(container), 1400);
    }

    zone.querySelector("#cj-submit").addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });

    zone.querySelector("#cj-hint-toggle").addEventListener("click", () => {
      const hintZone = zone.querySelector("#cj-hint-table");
      if (hintZone.innerHTML) {
        hintZone.innerHTML = "";
        return;
      }
      hintZone.innerHTML = `
        <table class="conjugation-table">
          ${window.ConjugationEngine.PRONOUNS.map(
            (p, i) => `<tr><td>${p.label}</td><td>${forms[i]}</td></tr>`
          ).join("")}
        </table>
      `;
    });

    updateBars(container);
  }

  function updateBars(container) {
    const scoreEl = container.querySelector("#cj-score");
    const streakEl = container.querySelector("#cj-streak");
    const roundEl = container.querySelector("#cj-round");
    if (scoreEl) scoreEl.textContent = state.score;
    if (streakEl) streakEl.textContent = state.streak;
    if (roundEl) roundEl.textContent = Math.min(state.round, state.totalRounds);
  }

  async function bumpStats(isCorrect) {
    const stats = await Store.get("stats", { conjugationCorrect: 0, conjugationTotal: 0 });
    await Store.merge("stats", {
      conjugationCorrect: (stats.conjugationCorrect || 0) + (isCorrect ? 1 : 0),
      conjugationTotal: (stats.conjugationTotal || 0) + 1,
    });
  }

  async function saveScore() {
    const stats = await Store.get("stats", { bestConjugationScore: 0 });
    if (state.score > (stats.bestConjugationScore || 0)) {
      await Store.merge("stats", { bestConjugationScore: state.score });
    }
  }

  return { render };
})();
