// Hiệu ứng âm thanh: tự tạo bằng Web Audio API (không cần file mp3),
// nhẹ, không tốn dung lượng, hoạt động 100% offline.
window.SoundFX = (function () {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, duration, { type = "sine", gain = 0.15, delay = 0 } = {}) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(c.destination);
      const start = c.currentTime + delay;
      g.gain.setValueAtTime(gain, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch (e) {
      // Một số môi trường có thể chặn AudioContext trước tương tác người dùng — bỏ qua lặng lẽ
    }
  }

  function correct() {
    tone(880, 0.1, { gain: 0.13 });
    tone(1318, 0.16, { gain: 0.11, delay: 0.07 });
  }

  function wrong() {
    tone(220, 0.22, { type: "triangle", gain: 0.12 });
  }

  function click() {
    tone(700, 0.045, { type: "square", gain: 0.05 });
  }

  function levelUp() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, { gain: 0.12, delay: i * 0.09 }));
  }

  function phaseEnd() {
    tone(660, 0.2, { gain: 0.14 });
    tone(880, 0.28, { gain: 0.12, delay: 0.18 });
  }

  function setEnabled(v) {
    enabled = v;
  }
  function isEnabled() {
    return enabled;
  }

  return {
    correct: () => enabled && correct(),
    wrong: () => enabled && wrong(),
    click: () => enabled && click(),
    levelUp: () => enabled && levelUp(),
    phaseEnd: () => enabled && phaseEnd(),
    setEnabled,
    isEnabled,
  };
})();
