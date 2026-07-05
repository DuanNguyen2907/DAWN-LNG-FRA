// Bài tập Sắp xếp câu: xáo trộn các từ trong 1 câu đúng, người học kéo-thả
// (hoặc bấm chọn) để ghép lại đúng thứ tự. Hỗ trợ cả kéo-thả lẫn bấm chọn
// (giống cơ chế đã dùng ở Nối từ) để chắc chắn dùng được trên mọi máy.
window.SentenceOrderExercise = (function () {
  function shuffleDistinct(words) {
    // Đảm bảo thứ tự xáo trộn khác thứ tự gốc (nếu có thể) để bài không quá dễ
    let attempt = 0;
    let arr = [...words];
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      attempt += 1;
    } while (arr.map((w) => w.text).join(" ") === words.map((w) => w.text).join(" ") && attempt < 8 && words.length > 1);
    return arr;
  }

  function render(container, sentenceFr, sentenceVi, onResult) {
    const words = sentenceFr
      .trim()
      .split(/\s+/)
      .map((text, origIndex) => ({ text, origIndex, id: `w${origIndex}` }));
    const bank = shuffleDistinct(words);
    const placed = new Array(words.length).fill(null);

    container.innerHTML = `
      <div class="so-target" id="so-target"></div>
      <div class="so-bank" id="so-bank"></div>
      <div class="so-actions">
        <button class="btn btn-icon" id="so-reset">↺ Làm lại</button>
        <button class="btn btn-primary" id="so-check">Kiểm tra</button>
      </div>
      <div id="so-feedback" class="quiz-feedback"></div>
      <div class="game-sub">${sentenceVi}</div>
    `;

    let draggedId = null;

    function draw() {
      const targetEl = container.querySelector("#so-target");
      const bankEl = container.querySelector("#so-bank");

      targetEl.innerHTML = placed
        .map(
          (w, i) =>
            `<div class="so-slot" data-slot="${i}">${w ? `<span class="so-word-chip so-placed" data-id="${w.id}" draggable="true">${w.text}</span>` : ""}</div>`
        )
        .join("");

      const placedIds = new Set(placed.filter(Boolean).map((w) => w.id));
      bankEl.innerHTML = bank
        .filter((w) => !placedIds.has(w.id))
        .map((w) => `<span class="so-word-chip" data-id="${w.id}" draggable="true">${w.text}</span>`)
        .join("");

      // Bấm chọn: từ trong ngân hàng -> đặt vào ô trống đầu tiên
      bankEl.querySelectorAll(".so-word-chip").forEach((chip) => {
        chip.addEventListener("click", () => placeInFirstEmpty(chip.dataset.id));
        chip.addEventListener("dragstart", (e) => {
          draggedId = chip.dataset.id;
          e.dataTransfer.effectAllowed = "move";
        });
      });
      // Bấm chọn: từ đã đặt -> trả về ngân hàng
      targetEl.querySelectorAll(".so-word-chip").forEach((chip) => {
        chip.addEventListener("click", () => removeFromSlot(chip.dataset.id));
        chip.addEventListener("dragstart", (e) => {
          draggedId = chip.dataset.id;
          e.dataTransfer.effectAllowed = "move";
        });
      });
      // Kéo-thả vào từng ô
      targetEl.querySelectorAll(".so-slot").forEach((slot) => {
        slot.addEventListener("dragover", (e) => e.preventDefault());
        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          placeInSlot(draggedId, Number(slot.dataset.slot));
        });
      });
    }

    function findWord(id) {
      return words.find((w) => w.id === id);
    }

    function placeInFirstEmpty(id) {
      const emptyIndex = placed.findIndex((w) => !w);
      if (emptyIndex === -1) return;
      placeInSlot(id, emptyIndex);
    }

    function placeInSlot(id, slotIndex) {
      if (!id) return;
      // gỡ từ này khỏi vị trí cũ nếu đang nằm ở ô khác
      const existingIndex = placed.findIndex((w) => w && w.id === id);
      if (existingIndex !== -1) placed[existingIndex] = null;
      // nếu ô đích đã có từ khác, đẩy nó về ngân hàng
      placed[slotIndex] = findWord(id);
      draw();
    }

    function removeFromSlot(id) {
      const idx = placed.findIndex((w) => w && w.id === id);
      if (idx !== -1) placed[idx] = null;
      draw();
    }

    container.querySelector("#so-reset").addEventListener("click", () => {
      placed.fill(null);
      draw();
    });

    container.querySelector("#so-check").addEventListener("click", () => {
      const feedback = container.querySelector("#so-feedback");
      if (placed.some((w) => !w)) {
        feedback.innerHTML = "Bạn chưa xếp hết các từ.";
        feedback.className = "quiz-feedback feedback-bad";
        return;
      }
      const userOrder = placed.map((w) => w.origIndex).join(",");
      const correctOrder = words.map((w) => w.origIndex).join(",");
      const isCorrect = userOrder === correctOrder;
      if (isCorrect) {
        feedback.textContent = "Chính xác! 🎉";
        feedback.className = "quiz-feedback feedback-good";
        window.SoundFX.correct();
      } else {
        feedback.innerHTML = `Chưa đúng thứ tự. Câu đúng: <b>${sentenceFr}</b>`;
        feedback.className = "quiz-feedback feedback-bad";
        window.SoundFX.wrong();
      }
      if (onResult) onResult(isCorrect);
    });

    draw();
  }

  return { render };
})();
