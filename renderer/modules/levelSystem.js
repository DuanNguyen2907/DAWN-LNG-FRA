// Hệ thống Cấp độ/XP tổng thể của người học — tính từ các số liệu đã có sẵn
// (không lưu trùng), để đo tiến bộ chung thay vì chỉ theo từng từ riêng lẻ.
window.LevelSystem = (function () {
  const XP_RATES = {
    wordsReviewed: 2, // mỗi lần ôn thẻ từ
    quizCorrect: 3,
    matchingRounds: 12,
    conjugationCorrect: 3,
    grammarExerciseCorrect: 3,
    speedTypeCorrect: 2,
    focusMinute: 1,
  };

  function computeXP(stats, focusLog) {
    const totalFocusSeconds = Object.values(focusLog || {}).reduce((a, b) => a + b, 0);
    const focusMinutes = Math.floor(totalFocusSeconds / 60);
    return (
      (stats.wordsReviewed || 0) * XP_RATES.wordsReviewed +
      (stats.quizCorrect || 0) * XP_RATES.quizCorrect +
      (stats.matchingRounds || 0) * XP_RATES.matchingRounds +
      (stats.conjugationCorrect || 0) * XP_RATES.conjugationCorrect +
      (stats.grammarExerciseCorrect || 0) * XP_RATES.grammarExerciseCorrect +
      (stats.speedTypeCorrect || 0) * XP_RATES.speedTypeCorrect +
      focusMinutes * XP_RATES.focusMinute
    );
  }

  // Ngưỡng XP tăng dần: cấp n cần 25*n^2 XP tích lũy để đạt được
  function xpThresholdForLevel(level) {
    return 25 * Math.pow(level - 1, 2);
  }

  function levelFromXP(xp) {
    let level = 1;
    while (xpThresholdForLevel(level + 1) <= xp) level += 1;
    return level;
  }

  function getProgress(xp) {
    const level = levelFromXP(xp);
    const currentStart = xpThresholdForLevel(level);
    const nextStart = xpThresholdForLevel(level + 1);
    const span = nextStart - currentStart;
    const into = xp - currentStart;
    const pct = span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 100;
    return { level, xp, currentStart, nextStart, xpIntoLevel: into, xpForLevel: span, pct };
  }

  const TITLES = [
    { min: 1, title: "Người mới nổi loạn" },
    { min: 5, title: "Kẻ tò mò tiếng Pháp" },
    { min: 10, title: "Chiến binh từ vựng" },
    { min: 16, title: "Tay chia động từ cứng" },
    { min: 24, title: "Người kể chuyện bằng tiếng Pháp" },
    { min: 34, title: "Bậc thầy điên dại" },
  ];

  function titleForLevel(level) {
    let best = TITLES[0].title;
    for (const t of TITLES) {
      if (level >= t.min) best = t.title;
    }
    return best;
  }

  return { computeXP, levelFromXP, getProgress, titleForLevel };
})();
