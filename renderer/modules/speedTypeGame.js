// Mini-game: Gõ nhanh — cho nghĩa tiếng Việt, gõ đúng từ tiếng Pháp trong
// thời gian giới hạn. Chiều ngược lại với Flashcards, luyện phản xạ nhớ từ.
window.SpeedTypeGame = (function () {
  let state = { level: "all", timeLeft: 60, score: 0, streak: 0, bestStreak: 0, running: false, queue: [], qIndex: 0 };
  let timerHandle = null;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pool() {
    return window.VOCAB_DATA.filter((w) => state.level === "all" || w.level === state.level);
  }

  function render(container) {
    stopTimer();
    state = { level: state.level, timeLeft: 60, score: 0, streak: 0, bestStreak: 0, running: false, queue: [], qIndex: 0 };

    container.innerHTML = `
      <div class="game-header">
        <h2>⚡ Gõ nhanh</h2>
        <select id="sp-level" class="level-select">
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>
      </div>
      <p class="game-sub">Cho nghĩa tiếng Việt — gõ đúng từ tiếng Pháp càng nhanh càng tốt. Còn 60 giây, gõ được bao nhiêu từ tuỳ bạn!</p>
      <div id="sp-zone"></div>
    `;

    container.querySelector("#sp-level").value = state.level;
    container.querySelector("#sp-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      render(container);
    });

    showStartScreen(container);
  }

  function showStartScreen(container) {
    const zone = container.querySelector("#sp-zone");
    zone.innerHTML = `
      <div class="empty-state">
        Sẵn sàng chưa? Bấm bắt đầu để đếm ngược 60 giây.
      </div>
      <button class="btn btn-primary btn-large" id="sp-start">▶️ Bắt đầu</button>
    `;
    zone.querySelector("#sp-start").addEventListener("click", () => startGame(container));
  }

  async function startGame(container) {
    const zone = container.querySelector("#sp-zone");
    zone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang chuẩn bị từ...")}</div>`;

    const words = shuffle(pool()).slice(0, 12); // Bug fix: 25 từ khiến người chơi chờ quá lâu trước khi bắt đầu
    if (words.length === 0) {
      zone.innerHTML = `<div class="empty-state">Không có từ nào trong cấp độ này.</div>`;
      return;
    }
    // Tải trước nghĩa cho cả lượt chơi để không bị khựng giữa chừng
    const enriched = await Promise.all(
      words.map(async (w) => {
        const data = await Enrichment.getForWord(w);
        return { ...w, vi: data.vi };
      })
    );
    state.queue = enriched.filter((w) => w.vi);

    // Bug fix: nếu API dịch lỗi hết (vd. mất mạng) thì queue rỗng — trước đây
    // sẽ crash khi truy cập state.queue[0]. Giờ báo lỗi rõ ràng và cho thử lại.
    if (state.queue.length === 0) {
      zone.innerHTML = `
        <div class="empty-state">Không lấy được nghĩa cho từ nào (có thể do mất mạng hoặc API đang bận). Thử lại nhé.</div>
        <button class="btn btn-primary" id="sp-retry">🔄 Thử lại</button>
      `;
      zone.querySelector("#sp-retry").addEventListener("click", () => startGame(container));
      return;
    }
    state.qIndex = 0;
    state.running = true;
    state.timeLeft = 60;

    zone.innerHTML = `
      <div class="speedtype-bar">
        <span>⏱️ <b id="sp-time">60</b>s</span>
        <span>Điểm: <b id="sp-score">0</b></span>
        <span>Chuỗi: <b id="sp-streak">0</b> 🔥</span>
      </div>
      <div id="sp-question"></div>
    `;

    timerHandle = setInterval(() => {
      state.timeLeft -= 1;
      const timeEl = container.querySelector("#sp-time");
      if (timeEl) timeEl.textContent = state.timeLeft;
      if (state.timeLeft <= 0) endGame(container);
    }, 1000);

    nextWord(container);
  }

  function nextWord(container) {
    if (!state.running) return;
    if (state.qIndex >= state.queue.length) {
      state.queue = shuffle(state.queue);
      state.qIndex = 0;
    }
    const word = state.queue[state.qIndex];
    const qZone = container.querySelector("#sp-question");
    if (!qZone) return;

    qZone.innerHTML = `
      <div class="quiz-card">
        <div class="speedtype-meaning">${word.vi}</div>
        <input type="text" id="sp-answer" class="text-input conjugation-input" autocomplete="off" placeholder="Gõ từ tiếng Pháp..." />
        <div id="sp-feedback" class="quiz-feedback"></div>
      </div>
    `;
    const input = qZone.querySelector("#sp-answer");
    input.focus();
    let answered = false; // Bug fix: chặn bấm Enter liên tiếp tính điểm 2 lần cho cùng 1 từ
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || answered) return;
      answered = true;
      input.disabled = true;
      const userAnswer = input.value.trim().toLowerCase();
      const correct = word.fr.trim().toLowerCase();
      const feedback = qZone.querySelector("#sp-feedback");
      if (userAnswer === correct) {
        state.score += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        feedback.textContent = "Đúng! 🎉";
        feedback.className = "quiz-feedback feedback-good";
        SoundFX.correct();
      } else {
        state.streak = 0;
        feedback.innerHTML = `Chưa đúng — đáp án: <b>${word.fr}</b>`;
        feedback.className = "quiz-feedback feedback-bad";
        SoundFX.wrong();
        Store.get("weakWords", {}).then((store) => {
          const existing = store[word.id] || { count: 0 };
          Store.mergeNested("weakWords", word.id, { count: existing.count + 1, lastWrong: Date.now() });
        });
      }
      const scoreEl = container.querySelector("#sp-score");
      const streakEl = container.querySelector("#sp-streak");
      if (scoreEl) scoreEl.textContent = state.score;
      if (streakEl) streakEl.textContent = state.streak;
      state.qIndex += 1;
      setTimeout(() => nextWord(container), 500);
    });
  }

  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  async function endGame(container) {
    state.running = false;
    stopTimer();
    const zone = container.querySelector("#sp-zone");
    zone.innerHTML = `
      <div class="empty-state">
        ⏰ Hết giờ! Bạn gõ đúng <b>${state.score}</b> từ. Chuỗi dài nhất: <b>${state.bestStreak}</b> 🔥
      </div>
      <button class="btn btn-primary btn-large" id="sp-restart">Chơi lại</button>
    `;
    zone.querySelector("#sp-restart").addEventListener("click", () => render(container));

    const stats = await Store.get("stats", { speedTypeCorrect: 0, bestSpeedTypeScore: 0 });
    await Store.merge("stats", {
      speedTypeCorrect: (stats.speedTypeCorrect || 0) + state.score,
      bestSpeedTypeScore: Math.max(stats.bestSpeedTypeScore || 0, state.score),
    });
  }

  return { render };
})();
