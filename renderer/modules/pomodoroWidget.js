// Widget Pomodoro nổi — hiện ở góc màn hình khi người dùng rời khỏi trang
// Tập trung trong lúc phiên học/nghỉ vẫn đang chạy. Kéo thả được để tránh đè
// lên nội dung khác; vị trí được nhớ lại cho lần sau.
window.PomodoroWidget = (function () {
  let el = null;
  let dragging = false;

  // Art vẽ tay bằng SVG — đồng hồ hình cà chua (giờ học) và đồng hồ có biểu
  // tượng nghỉ ngơi (trăng lưỡi liềm, dịu mắt) ở giữa cho giờ nghỉ.
  const TOMATO_SVG = `
    <svg viewBox="0 0 48 48" width="30" height="30">
      <path d="M24 3 C20 1 15 3 15 7 C18 8 21 8.5 24 7 C27 8.5 30 8 33 7 C33 3 28 1 24 3 Z" fill="#5BA85A"/>
      <ellipse cx="19" cy="6" rx="3" ry="1.4" fill="#3D8B3D" transform="rotate(-20 19 6)"/>
      <circle cx="24" cy="27" r="18" fill="#E85D4A" stroke="#B8402F" stroke-width="1.5"/>
      <circle cx="24" cy="27" r="14.5" fill="#EF7A63" opacity="0.5"/>
      <line x1="24" y1="27" x2="24" y2="17" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="27" x2="30.5" y2="27" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="24" cy="27" r="1.8" fill="#fff"/>
    </svg>
  `;
  const REST_SVG = `
    <svg viewBox="0 0 48 48" width="30" height="30">
      <circle cx="24" cy="24" r="19" fill="#2A9D8F" stroke="#1B6C61" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="15" fill="#3DB5A6" opacity="0.5"/>
      <path d="M30 15 A11 11 0 1 0 30 33 A8.5 8.5 0 1 1 30 15 Z" fill="#FDF6E3"/>
      <circle cx="33" cy="14" r="1.3" fill="#FDF6E3"/>
      <circle cx="36" cy="18" r="0.9" fill="#FDF6E3"/>
    </svg>
  `;

  function formatMMSS(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function ensureEl() {
    if (el) return el;
    el = document.createElement("div");
    el.className = "pomodoro-widget";
    el.innerHTML = `
      <div class="pomodoro-widget-icon" id="pw-icon"></div>
      <div class="pomodoro-widget-info">
        <div class="pomodoro-widget-time" id="pw-time">25:00</div>
        <div class="pomodoro-widget-phase" id="pw-phase">Đang học</div>
      </div>
      <div class="pomodoro-widget-drag-hint" title="Kéo để di chuyển">⠿</div>
    `;
    document.body.appendChild(el);
    restorePosition();
    attachDrag();
    el.addEventListener("click", () => {
      if (dragging) return; // vừa kéo xong thì không tính là click điều hướng
      if (window.appNavigateTo) window.appNavigateTo("focus");
    });
    return el;
  }

  async function restorePosition() {
    try {
      const pos = await window.Store.get("pomodoroWidgetPos", null);
      if (pos && typeof pos.x === "number") {
        el.style.left = pos.x + "px";
        el.style.top = pos.y + "px";
        el.style.right = "auto";
      }
    } catch (e) {
      /* dùng vị trí mặc định (góc phải trên) nếu chưa lưu lần nào */
    }
  }

  function attachDrag() {
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragging = false;
      const rect = el.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = rect.left;
      const startTop = rect.top;
      el.classList.add("pomodoro-widget-dragging");

      function onMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragging = true;
        // Giữ widget trong phạm vi màn hình, không để kéo ra ngoài mất dấu
        const maxLeft = window.innerWidth - rect.width - 8;
        const maxTop = window.innerHeight - rect.height - 8;
        const newLeft = Math.min(Math.max(8, startLeft + dx), Math.max(8, maxLeft));
        const newTop = Math.min(Math.max(8, startTop + dy), Math.max(8, maxTop));
        el.style.left = newLeft + "px";
        el.style.top = newTop + "px";
        el.style.right = "auto";
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        el.classList.remove("pomodoro-widget-dragging");
        if (dragging) {
          const rect2 = el.getBoundingClientRect();
          window.Store.set("pomodoroWidgetPos", { x: rect2.left, y: rect2.top });
        }
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  function update(phase, remainingSeconds) {
    ensureEl();
    el.querySelector("#pw-time").textContent = formatMMSS(remainingSeconds);
    el.querySelector("#pw-phase").textContent = phase === "work" ? "Đang học" : "Đang nghỉ";
    el.querySelector("#pw-icon").innerHTML = phase === "work" ? TOMATO_SVG : REST_SVG;
    el.classList.toggle("pomodoro-widget-work", phase === "work");
    el.classList.toggle("pomodoro-widget-break", phase !== "work");
  }

  function show() {
    ensureEl();
    el.classList.add("pomodoro-widget-visible");
  }

  function hide() {
    if (el) el.classList.remove("pomodoro-widget-visible");
  }

  return { update, show, hide };
})();
