// Bộ UI dùng chung: Toast (thông báo nhỏ), Modal xác nhận tuỳ biến (thay cho
// confirm() gốc của trình duyệt nhìn lạc quẻ với giao diện), và spinner loading
// nhất quán cho toàn app.
window.UIKit = (function () {
  // ---- Toast: thông báo nhỏ góc màn hình, tự biến mất ----
  let toastContainer = null;
  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function toast(message, { type = "success", duration = 2600 } = {}) {
    const container = ensureToastContainer();
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
    el.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast-visible"));
    setTimeout(() => {
      el.classList.remove("toast-visible");
      setTimeout(() => el.remove(), 250);
    }, duration);
  }

  // ---- Modal xác nhận tuỳ biến, thay cho confirm() gốc ----
  function confirmModal(message, { title = "Xác nhận", confirmLabel = "Đồng ý", cancelLabel = "Hủy", danger = false } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal-card">
          <div class="modal-title">${title}</div>
          <div class="modal-message">${message}</div>
          <div class="modal-actions">
            <button class="btn btn-icon" id="modal-cancel-btn">${cancelLabel}</button>
            <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="modal-confirm-btn">${confirmLabel}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add("modal-visible"));

      function close(result) {
        overlay.classList.remove("modal-visible");
        setTimeout(() => overlay.remove(), 180);
        document.removeEventListener("keydown", onKeydown);
        resolve(result);
      }
      function onKeydown(e) {
        if (e.key === "Escape") close(false);
        if (e.key === "Enter") close(true);
      }
      document.addEventListener("keydown", onKeydown);
      overlay.querySelector("#modal-cancel-btn").addEventListener("click", () => close(false));
      overlay.querySelector("#modal-confirm-btn").addEventListener("click", () => close(true));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close(false);
      });
      overlay.querySelector("#modal-confirm-btn").focus();
    });
  }

  // ---- Spinner + chữ, dùng nhất quán thay cho các dòng "Đang tải..." rời rạc ----
  function spinnerHTML(text = "Đang tải...") {
    return `<div class="loading-row"><span class="spinner"></span><span>${text}</span></div>`;
  }

  return { toast, confirmModal, spinnerHTML };
})();
