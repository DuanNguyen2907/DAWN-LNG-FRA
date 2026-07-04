// Chế độ Tập trung kiểu Pomodoro: xen kẽ phiên Học / Nghỉ, tự chuyển giai
// đoạn, vẫn cộng dồn thời gian học thật vào thống kê theo ngày như trước.
window.FocusMode = (function () {
  let timerHandle = null;
  let running = false;
  let phase = "work"; // "work" | "break"
  let remainingSeconds = 0;
  let workSecondsThisPhase = 0; // để cộng dồn đúng số giây đã học thật (phòng khi bấm dừng giữa chừng)
  let initialized = false; // Bug fix: đánh dấu đã khởi tạo phiên hay chưa

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatMMSS(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function getSettings() {
    return Store.get("settings", { focusWorkMinutes: 25, focusBreakMinutes: 5 });
  }

  // Bug fix (Pomodoro tự restart khi chuyển tab): trước đây render() luôn
  // reset phase/remainingSeconds/running mỗi khi được gọi lại — kể cả khi chỉ
  // là quay lại tab Tập trung sau khi ghé qua tab khác. Giờ chỉ khởi tạo phiên
  // mới ở LẦN ĐẦU thực sự (hoặc sau khi bấm "Đặt lại"); nếu đã có phiên đang
  // chạy/tạm dừng, render() chỉ vẽ lại giao diện theo đúng trạng thái hiện có.
  let hasStartedOnce = false; // để hiện "Tiếp tục" thay vì "Bắt đầu" sau khi đã chạy dở

  async function initFreshSession() {
    stop();
    if (workSecondsThisPhase > 0) await saveWorkSeconds();
    const settings = await getSettings();
    phase = "work";
    remainingSeconds = (settings.focusWorkMinutes || 25) * 60;
    workSecondsThisPhase = 0;
    running = false;
    hasStartedOnce = false;
    initialized = true;
  }

  async function render(container) {
    if (!initialized) {
      await initFreshSession();
    }

    const settings = await getSettings();
    const focusLog = await Store.get("focusLog", {});
    const cycles = await Store.get("focusCycles", {});
    const todaySeconds = focusLog[todayKey()] || 0;
    const totalSeconds = Object.values(focusLog).reduce((a, b) => a + b, 0);
    const todayCycles = cycles[todayKey()] || 0;
    const streak = computeStreak(focusLog);

    container.innerHTML = `
      <div class="game-header">
        <h2>⏱️ Tập trung (Pomodoro)</h2>
      </div>
      <p class="game-sub">Học ${settings.focusWorkMinutes || 25} phút, nghỉ ${settings.focusBreakMinutes || 5} phút, lặp lại. Đổi thời lượng trong mục Cài đặt. Chuyển sang mục khác vẫn không làm mất phiên đang chạy.</p>

      <div class="pomodoro-phase-label" id="focus-phase-label">${phase === "work" ? "🎯 Phiên học" : "☕ Giờ nghỉ"}</div>
      <div class="focus-timer-display" id="focus-session-time">${formatMMSS(remainingSeconds)}</div>
      <div class="focus-actions">
        <button class="btn btn-primary btn-large" id="focus-start" ${running ? "disabled" : ""}>▶️ ${hasStartedOnce ? "Tiếp tục" : "Bắt đầu"}</button>
        <button class="btn btn-warning btn-large" id="focus-pause" ${running ? "" : "disabled"}>⏸️ Tạm dừng</button>
        <button class="btn btn-danger btn-large" id="focus-reset">⏹️ Đặt lại</button>
      </div>

      <div class="focus-stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="focus-today">${formatDuration(todaySeconds)}</div>
          <div class="stat-label">Hôm nay</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatDuration(totalSeconds)}</div>
          <div class="stat-label">Tổng cộng</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🍅 ${todayCycles}</div>
          <div class="stat-label">Phiên đã xong hôm nay</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🔥 ${streak}</div>
          <div class="stat-label">Chuỗi ngày liên tiếp</div>
        </div>
      </div>

      <div class="focus-history">
        <h3>7 ngày gần đây</h3>
        <div class="focus-history-bars" id="focus-history-bars"></div>
      </div>
    `;

    renderHistory(container, focusLog);

    const startBtn = container.querySelector("#focus-start");
    const pauseBtn = container.querySelector("#focus-pause");
    const resetBtn = container.querySelector("#focus-reset");

    startBtn.addEventListener("click", () => {
      if (running) return;
      running = true;
      hasStartedOnce = true;
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      SoundFX.click();
      timerHandle = setInterval(() => tick(container), 1000);
    });

    pauseBtn.addEventListener("click", async () => {
      stop();
      if (workSecondsThisPhase > 0) await saveWorkSeconds();
      startBtn.disabled = false;
      startBtn.textContent = "▶️ Tiếp tục";
      pauseBtn.disabled = true;
    });

    resetBtn.addEventListener("click", async () => {
      await initFreshSession();
      render(container);
    });
  }

  function updateDisplay(container) {
    const display = container.querySelector("#focus-session-time");
    const label = container.querySelector("#focus-phase-label");
    if (display) display.textContent = formatMMSS(remainingSeconds);
    if (label) label.textContent = phase === "work" ? "🎯 Phiên học" : "☕ Giờ nghỉ";
  }

  async function tick(container) {
    remainingSeconds -= 1;
    if (phase === "work") workSecondsThisPhase += 1;
    updateDisplay(container);

    if (remainingSeconds <= 0) {
      await onPhaseComplete(container);
    }
  }

  async function onPhaseComplete(container) {
    SoundFX.phaseEnd();
    if (phase === "work") {
      await saveWorkSeconds();
      await bumpCycleCount();
      const settings = await getSettings();
      phase = "break";
      remainingSeconds = (settings.focusBreakMinutes || 5) * 60;
    } else {
      const settings = await getSettings();
      phase = "work";
      remainingSeconds = (settings.focusWorkMinutes || 25) * 60;
      workSecondsThisPhase = 0;
    }
    updateDisplay(container);
    // Cập nhật lại các thẻ thống kê để phản ánh phiên vừa hoàn thành
    const focusLog = await Store.get("focusLog", {});
    const cycles = await Store.get("focusCycles", {});
    const todayEl = container.querySelector("#focus-today");
    if (todayEl) todayEl.textContent = formatDuration(focusLog[todayKey()] || 0);
    renderHistory(container, focusLog);
  }

  function stop() {
    running = false;
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  async function saveWorkSeconds() {
    if (workSecondsThisPhase <= 0) return;
    const log = await Store.get("focusLog", {});
    const key = todayKey();
    log[key] = (log[key] || 0) + workSecondsThisPhase;
    await Store.set("focusLog", log);
    workSecondsThisPhase = 0;
  }

  async function bumpCycleCount() {
    const cycles = await Store.get("focusCycles", {});
    const key = todayKey();
    cycles[key] = (cycles[key] || 0) + 1;
    await Store.set("focusCycles", cycles);
  }

  function computeStreak(focusLog) {
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (focusLog[key] && focusLog[key] > 0) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return streak;
  }

  function renderHistory(container, focusLog) {
    const bars = container.querySelector("#focus-history-bars");
    if (!bars) return;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, seconds: focusLog[key] || 0, label: d.toLocaleDateString("vi-VN", { weekday: "short" }) });
    }
    const maxSeconds = Math.max(...days.map((d) => d.seconds), 60);
    bars.innerHTML = days
      .map((d) => {
        const heightPct = Math.max(4, Math.round((d.seconds / maxSeconds) * 100));
        return `
          <div class="history-bar-col">
            <div class="history-bar" style="height:${heightPct}%" title="${Math.round(d.seconds / 60)} phút"></div>
            <div class="history-bar-label">${d.label}</div>
          </div>
        `;
      })
      .join("");
  }

  return { render };
})();
