// Thuật toán lặp lại ngắt quãng (Spaced Repetition) - phiên bản đơn giản hoá từ SM-2
// Mỗi từ có: repetition (số lần đúng liên tiếp), interval (số ngày tới lần ôn sau),
// easeFactor (hệ số dễ), dueDate (ngày đến hạn ôn - ISO string)

window.SRS = (function () {
  const DAY_MS = 24 * 60 * 60 * 1000;

  function initCard() {
    return {
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
    };
  }

  // quality: 0-5 (0-2 = sai/khó, 3-5 = đúng, càng cao càng dễ)
  function review(card, quality) {
    const c = card ? { ...card } : initCard();

    if (quality < 3) {
      // Trả lời sai hoặc rất khó -> reset lại chu kỳ, ôn lại sớm (trong ngày)
      c.repetition = 0;
      c.interval = 0;
      c.dueDate = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 phút sau
    } else {
      c.repetition += 1;
      if (c.repetition === 1) c.interval = 1;
      else if (c.repetition === 2) c.interval = 3;
      else c.interval = Math.round(c.interval * c.easeFactor);

      c.easeFactor = Math.max(
        1.3,
        c.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
      c.dueDate = new Date(Date.now() + c.interval * DAY_MS).toISOString();
    }
    return c;
  }

  function isDue(card) {
    if (!card) return true;
    return new Date(card.dueDate).getTime() <= Date.now();
  }

  return { initCard, review, isDue };
})();
