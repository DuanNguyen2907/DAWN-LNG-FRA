// Mini-game: Đố vui trắc nghiệm (đọc chữ đoán nghĩa / nghe đoán nghĩa)
// Nghĩa các đáp án lấy động qua Enrichment (API dịch), cache lại để chơi lại không phải chờ.
window.QuizGame = (function () {
  let state = { level: "all", mode: "read", score: 0, streak: 0, round: 0, totalRounds: 10, locked: false, cache: {} };

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
    state = { ...state, score: 0, streak: 0, round: 0 };
    container.innerHTML = `
      <div class="game-header">
        <h2>🎯 Đố vui từ vựng</h2>
        <div class="quiz-controls">
          <select id="qz-level" class="level-select">
            <option value="all">Tất cả cấp độ</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
          </select>
          <select id="qz-mode" class="level-select">
            <option value="read">👁️ Nhìn chữ đoán nghĩa</option>
            <option value="listen">👂 Nghe đoán nghĩa</option>
          </select>
        </div>
      </div>
      <div class="quiz-scorebar">
        <span>Điểm: <b id="qz-score">0</b></span>
        <span>Chuỗi đúng: <b id="qz-streak">0</b> 🔥</span>
        <span>Câu <b id="qz-round">0</b>/${state.totalRounds}</span>
      </div>
      <div id="qz-question-zone"></div>
    `;
    container.querySelector("#qz-level").value = state.level;
    container.querySelector("#qz-mode").value = state.mode;
    container.querySelector("#qz-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      render(container);
    });
    container.querySelector("#qz-mode").addEventListener("change", (e) => {
      state.mode = e.target.value;
      render(container);
    });
    nextQuestion(container);
  }

  async function nextQuestion(container) {
    state.locked = false;
    const zone = container.querySelector("#qz-question-zone");
    const data = pool();

    if (state.round >= state.totalRounds) {
      zone.innerHTML = `
        <div class="empty-state">
          🏁 Hoàn thành! Điểm số: <b>${state.score}</b>/${state.totalRounds}<br/>
          Chuỗi đúng dài nhất trong phiên: <b>${state.bestStreak || state.streak}</b> 🔥
        </div>
        <button class="btn btn-primary" id="qz-restart">Chơi lại</button>
      `;
      zone.querySelector("#qz-restart").addEventListener("click", () => render(container));
      updateBars(container);
      saveScore();
      return;
    }

    if (data.length < 4) {
      zone.innerHTML = `<div class="empty-state">Cần ít nhất 4 từ trong cấp độ này để chơi.</div>`;
      return;
    }

    zone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang chuẩn bị câu hỏi...")}</div>`;

    const shuffled = shuffle(data);
    const correct = shuffled[0];
    const distractors = shuffled.slice(1, 4);
    const options = shuffle([correct, ...distractors]);

    // Tải nghĩa tiếng Việt cho cả 4 lựa chọn (song song, có cache)
    const enrichments = await Promise.all(options.map((opt) => getEnrichment(opt)));
    const optionMeanings = options.map((opt, i) => ({
      word: opt,
      vi: enrichments[i].vi || "(không dịch được)",
    }));

    // Nếu người dùng đã đổi cấp độ/chế độ trong lúc đang tải thì bỏ qua kết quả này
    if (zone.dataset.stale === "1") return;

    zone.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-prompt">
          ${
            state.mode === "listen"
              ? `<button class="btn btn-primary btn-large" id="qz-play">🔊 Nghe từ</button>`
              : `<div class="quiz-word">${correct.fr}</div>`
          }
        </div>
        <div class="quiz-options">
          ${optionMeanings
            .map((opt, i) => `<button class="quiz-option" data-id="${opt.word.id}" data-idx="${i}">${opt.vi}</button>`)
            .join("")}
        </div>
        <div id="qz-feedback" class="quiz-feedback"></div>
      </div>
    `;

    if (state.mode === "listen") {
      const playBtn = zone.querySelector("#qz-play");
      const playSound = () => DictAPI.pronounce(correct.fr);
      playBtn.addEventListener("click", playSound);
      setTimeout(playSound, 300);
    }

    zone.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (state.locked) return;
        state.locked = true;
        zone.querySelectorAll(".quiz-option").forEach((b) => (b.disabled = true));
        const isCorrect = Number(btn.dataset.id) === correct.id;
        btn.classList.add(isCorrect ? "correct" : "wrong");
        zone.querySelectorAll(".quiz-option").forEach((b) => {
          if (Number(b.dataset.id) === correct.id) b.classList.add("correct");
        });

        const feedback = zone.querySelector("#qz-feedback");
        const correctMeaning = optionMeanings.find((o) => o.word.id === correct.id).vi;
        if (isCorrect) {
          state.score += 1;
          state.streak += 1;
          state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
          feedback.textContent = "Chính xác! 🎉";
          feedback.className = "quiz-feedback feedback-good";
          SoundFX.correct();
        } else {
          state.streak = 0;
          feedback.textContent = `Sai rồi! Đáp án đúng: ${correctMeaning}`;
          feedback.className = "quiz-feedback feedback-bad";
          SoundFX.wrong();
          bumpWeakWord(correct.id);
        }
        updateBars(container);
        state.round += 1;
        await bumpStats(isCorrect);
        setTimeout(() => nextQuestion(container), 1100);
      });
    });

    updateBars(container);
  }

  function updateBars(container) {
    const scoreEl = container.querySelector("#qz-score");
    const streakEl = container.querySelector("#qz-streak");
    const roundEl = container.querySelector("#qz-round");
    if (scoreEl) scoreEl.textContent = state.score;
    if (streakEl) streakEl.textContent = state.streak;
    if (roundEl) roundEl.textContent = Math.min(state.round, state.totalRounds);
  }

  async function bumpWeakWord(wordId) {
    const store = await Store.get("weakWords", {});
    const existing = store[wordId] || { count: 0 };
    await Store.mergeNested("weakWords", wordId, { count: existing.count + 1, lastWrong: Date.now() });
  }

  async function bumpStats(isCorrect) {
    const stats = await Store.get("stats", { quizCorrect: 0, quizTotal: 0 });
    await Store.merge("stats", {
      quizCorrect: (stats.quizCorrect || 0) + (isCorrect ? 1 : 0),
      quizTotal: (stats.quizTotal || 0) + 1,
    });
  }

  async function saveScore() {
    const stats = await Store.get("stats", { bestQuizScore: 0 });
    if (state.score > (stats.bestQuizScore || 0)) {
      await Store.merge("stats", { bestQuizScore: state.score });
    }
  }

  return { render };
})();
