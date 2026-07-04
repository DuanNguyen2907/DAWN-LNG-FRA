// Dictée: nghe một câu tiếng Pháp thật (lấy từ ví dụ đã có qua Enrichment),
// gõ lại chính xác, chấm theo từng từ. Đây là kỹ năng NGHE thật sự — khó hơn
// nhiều so với "nghe rồi chọn nghĩa" ở Đố vui.
window.DicteeGame = (function () {
  let state = { level: "all", score: 0, round: 0, totalRounds: 8, sentences: [] };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[.,!?;:"«»]/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>🎧 Dictée — Nghe chép chính tả</h2>
        <select id="dc-level" class="level-select">
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>
      </div>
      <p class="game-sub">Bấm 🔊 để nghe câu, gõ lại chính xác những gì bạn nghe được. Có thể nghe lại nhiều lần.</p>
      <div class="quiz-scorebar">
        <span>Điểm: <b id="dc-score">0</b>/${state.totalRounds}</span>
        <span>Câu <b id="dc-round">0</b>/${state.totalRounds}</span>
      </div>
      <div id="dc-zone"></div>
    `;
    container.querySelector("#dc-level").value = state.level;
    container.querySelector("#dc-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      startSession(container);
    });
    startSession(container);
  }

  async function startSession(container) {
    const zone = container.querySelector("#dc-zone");
    zone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang chuẩn bị câu nghe...")}</div>`;
    state.score = 0;
    state.round = 0;
    updateBars(container);

    const pool = shuffle(window.VOCAB_DATA.filter((w) => state.level === "all" || w.level === state.level)).slice(0, 30);
    const withExamples = [];
    for (const w of pool) {
      if (withExamples.length >= state.totalRounds) break;
      const data = await Enrichment.getForWord(w);
      if (data.exampleFr && data.exampleFr.split(/\s+/).length >= 3) {
        withExamples.push({ word: w, sentence: data.exampleFr, translation: data.exampleVi });
      }
    }
    state.sentences = withExamples;

    if (state.sentences.length === 0) {
      zone.innerHTML = `<div class="empty-state">Không tìm được câu ví dụ nào có sẵn cho cấp độ này. Thử vào Từ điển ở cấp độ này trước để tải sẵn ví dụ, rồi quay lại đây.</div>`;
      return;
    }
    nextRound(container);
  }

  function nextRound(container) {
    const zone = container.querySelector("#dc-zone");
    if (state.round >= state.sentences.length || state.round >= state.totalRounds) {
      zone.innerHTML = `
        <div class="empty-state">🏁 Hoàn thành! Điểm số: <b>${state.score}</b>/${Math.min(state.sentences.length, state.totalRounds)}</div>
        <button class="btn btn-primary" id="dc-restart">Chơi lại</button>
      `;
      zone.querySelector("#dc-restart").addEventListener("click", () => startSession(container));
      saveScore();
      return;
    }

    const item = state.sentences[state.round];
    let playCount = 0;

    zone.innerHTML = `
      <div class="quiz-card">
        <button class="btn btn-primary btn-large" id="dc-play">🔊 Nghe câu</button>
        <div class="game-sub" id="dc-play-count" style="margin-top:10px;">Chưa nghe lần nào</div>
        <textarea id="dc-answer" class="text-input dictee-textarea" placeholder="Gõ lại câu bạn nghe được..." autocomplete="off"></textarea>
        <button class="btn btn-primary" id="dc-submit">Kiểm tra</button>
        <div id="dc-feedback" class="dictee-feedback"></div>
      </div>
    `;

    const playBtn = zone.querySelector("#dc-play");
    const playCountEl = zone.querySelector("#dc-play-count");
    function play() {
      playCount += 1;
      playCountEl.textContent = `Đã nghe ${playCount} lần`;
      DictAPI.speak(item.sentence);
    }
    playBtn.addEventListener("click", play);
    play();

    const input = zone.querySelector("#dc-answer");
    input.focus();
    let locked = false;

    function submit() {
      if (locked) return;
      locked = true;
      const expectedWords = normalize(item.sentence);
      const userWords = normalize(input.value);
      let correctCount = 0;
      const diffHtml = expectedWords
        .map((w, i) => {
          const isMatch = userWords[i] === w;
          if (isMatch) correctCount += 1;
          return `<span class="dictee-word ${isMatch ? "dictee-word-ok" : "dictee-word-bad"}">${w}</span>`;
        })
        .join(" ");
      const pct = Math.round((correctCount / expectedWords.length) * 100);
      const passed = pct >= 80;
      if (passed) {
        state.score += 1;
        SoundFX.correct();
      } else {
        SoundFX.wrong();
      }

      const feedback = zone.querySelector("#dc-feedback");
      feedback.innerHTML = `
        <div class="quiz-feedback ${passed ? "feedback-good" : "feedback-bad"}">${passed ? "Tốt lắm! 🎉" : "Chưa khớp hoàn toàn"} (${pct}% đúng từ)</div>
        <div class="dictee-correct-sentence">${diffHtml}</div>
        <div class="game-sub">${item.translation || ""}</div>
      `;
      updateBars(container);
      state.round += 1;
      setTimeout(() => nextRound(container), 2200);
    }

    zone.querySelector("#dc-submit").addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
    });
  }

  function updateBars(container) {
    const scoreEl = container.querySelector("#dc-score");
    const roundEl = container.querySelector("#dc-round");
    if (scoreEl) scoreEl.textContent = state.score;
    if (roundEl) roundEl.textContent = Math.min(state.round, state.totalRounds);
  }

  async function saveScore() {
    const stats = await Store.get("stats", { dicteeCorrect: 0, bestDicteeScore: 0 });
    await Store.merge("stats", {
      dicteeCorrect: (stats.dicteeCorrect || 0) + state.score,
      bestDicteeScore: Math.max(stats.bestDicteeScore || 0, state.score),
    });
  }

  return { render };
})();
