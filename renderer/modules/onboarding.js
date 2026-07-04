// Màn hình chào mừng — chỉ hiện ở lần mở app đầu tiên, giới thiệu nhanh các mục
window.Onboarding = (function () {
  const STEPS = [
    { icon: "🃏", title: "Thẻ từ & Đố vui & Nối từ & Gõ nhanh", text: "4 kiểu mini-game để học từ vựng theo nhiều cách khác nhau, đỡ chán." },
    { icon: "🔤", title: "Chia động từ", text: "Luyện chia động từ tiếng Pháp theo đúng quy tắc ngữ pháp, chấm điểm ngay." },
    { icon: "📖", title: "Ngữ pháp", text: "Đọc giải thích + làm bài tập điền từ cho từng chủ điểm ngữ pháp." },
    { icon: "⏱️", title: "Tập trung kiểu Pomodoro", text: "Học/nghỉ xen kẽ, tự động đếm giờ và lưu thống kê mỗi ngày." },
    { icon: "✏️", title: "Sửa được mọi nghĩa", text: "Nghĩa/ví dụ lấy tự động qua API — thấy sai chỗ nào cứ bấm ✏️ để sửa lại." },
  ];

  async function maybeShow() {
    const settings = await Store.get("settings", {});
    if (settings.hasSeenOnboarding) return;
    show();
  }

  function show() {
    const overlay = document.createElement("div");
    overlay.className = "onboarding-overlay";
    overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-title">Chào mừng đến với <span class="accent">Apprends Fou</span> 🔥</div>
        <div class="onboarding-steps">
          ${STEPS.map(
            (s) => `
            <div class="onboarding-step">
              <span class="onboarding-step-icon">${s.icon}</span>
              <div>
                <div class="onboarding-step-title">${s.title}</div>
                <div class="onboarding-step-text">${s.text}</div>
              </div>
            </div>
          `
          ).join("")}
        </div>
        <button class="btn btn-primary btn-large" id="onboarding-start">Bắt đầu học! 🚀</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector("#onboarding-start").addEventListener("click", async () => {
      await Store.merge("settings", { hasSeenOnboarding: true });
      overlay.remove();
    });
  }

  return { maybeShow };
})();
