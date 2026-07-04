// Trang Cài đặt: mục tiêu học/ngày, bật/tắt âm thanh, xuất/nhập sao lưu, xoá tiến trình
window.SettingsPage = (function () {
  const BACKUP_KEYS = ["stats", "srsCards", "focusLog", "focusCycles", "vocabEnrichment", "vocabImages", "grammarUserNotes", "discoverVocabState", "wikibooksLessonCache", "settings"];

  function clamp(value, min, max, fallback) {
    const n = Number(value);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  async function render(container) {
    const settings = await Store.get("settings", { dailyGoalMinutes: 15, soundEnabled: true, focusWorkMinutes: 25, focusBreakMinutes: 5 });

    container.innerHTML = `
      <div class="game-header">
        <h2>⚙️ Cài đặt</h2>
      </div>

      <div class="settings-section">
        <h3>Mục tiêu học tập</h3>
        <label class="settings-label">
          Mục tiêu học mỗi ngày (phút)
          <input type="number" min="1" max="240" id="st-goal" class="text-input" value="${settings.dailyGoalMinutes || 15}" />
        </label>
      </div>

      <div class="settings-section">
        <h3>Chế độ Tập trung (Pomodoro)</h3>
        <label class="settings-label">
          Thời lượng phiên học (phút)
          <input type="number" min="1" max="90" id="st-work" class="text-input" value="${settings.focusWorkMinutes || 25}" />
        </label>
        <label class="settings-label">
          Thời lượng nghỉ (phút)
          <input type="number" min="1" max="30" id="st-break" class="text-input" value="${settings.focusBreakMinutes || 5}" />
        </label>
      </div>

      <div class="settings-section">
        <h3>Âm thanh</h3>
        <label class="settings-toggle">
          <input type="checkbox" id="st-sound" ${settings.soundEnabled !== false ? "checked" : ""} />
          Bật hiệu ứng âm thanh khi trả lời đúng/sai
        </label>
      </div>

      <div class="settings-actions">
        <button class="btn btn-primary" id="st-save">💾 Lưu cài đặt</button>
      </div>

      <div class="settings-section">
        <h3>Sao lưu &amp; khôi phục</h3>
        <p class="game-sub">Xuất toàn bộ tiến trình học (từ đã ôn, nghĩa đã sửa tay, thống kê...) ra một file, để chuyển sang máy khác hoặc phòng khi cần khôi phục.</p>
        <div class="settings-actions">
          <button class="btn btn-primary" id="st-export">⬇️ Xuất file sao lưu</button>
          <button class="btn btn-primary" id="st-import">⬆️ Nhập từ file sao lưu</button>
        </div>
      </div>

      <div class="settings-section settings-danger">
        <h3>Vùng nguy hiểm</h3>
        <p class="game-sub">Xoá toàn bộ tiến trình học trên máy này (không thể hoàn tác). Nên xuất file sao lưu trước.</p>
        <button class="btn btn-danger" id="st-reset">🗑️ Xoá toàn bộ tiến trình</button>
      </div>
    `;

    // ----- Sửa cài đặt: chuẩn hoá giá trị nhập (clamp min/max) khi rời khỏi ô, để
    // người dùng thấy ngay nếu gõ số vô lý (vd 0 phút hoặc 9999 phút) thay vì im lặng sai lệch -----
    const goalInput = container.querySelector("#st-goal");
    const workInput = container.querySelector("#st-work");
    const breakInput = container.querySelector("#st-break");
    goalInput.addEventListener("blur", () => (goalInput.value = clamp(goalInput.value, 1, 240, 15)));
    workInput.addEventListener("blur", () => (workInput.value = clamp(workInput.value, 1, 90, 25)));
    breakInput.addEventListener("blur", () => (breakInput.value = clamp(breakInput.value, 1, 30, 5)));

    const saveBtn = container.querySelector("#st-save");
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      const dailyGoalMinutes = clamp(goalInput.value, 1, 240, 15);
      const focusWorkMinutes = clamp(workInput.value, 1, 90, 25);
      const focusBreakMinutes = clamp(breakInput.value, 1, 30, 5);
      const soundEnabled = container.querySelector("#st-sound").checked;
      await Store.set("settings", { dailyGoalMinutes, focusWorkMinutes, focusBreakMinutes, soundEnabled });
      window.SoundFX.setEnabled(soundEnabled);
      SoundFX.click();
      window.UIKit.toast("Đã lưu cài đặt", { type: "success" });
      saveBtn.disabled = false;
    });

    const exportBtn = container.querySelector("#st-export");
    exportBtn.addEventListener("click", async () => {
      exportBtn.disabled = true;
      const originalLabel = exportBtn.innerHTML;
      exportBtn.innerHTML = window.UIKit.spinnerHTML("Đang xuất...");
      try {
        const payload = {};
        for (const key of BACKUP_KEYS) {
          payload[key] = await Store.get(key, {});
        }
        const json = JSON.stringify({ exportedAt: new Date().toISOString(), data: payload }, null, 2);
        const result = await window.api.saveFile(`apprends-fou-sao-luu-${new Date().toISOString().slice(0, 10)}.json`, json);
        if (!result.canceled) {
          window.UIKit.toast(`Đã lưu file sao lưu`, { type: "success" });
        }
      } catch (e) {
        window.UIKit.toast("Xuất file thất bại, thử lại nhé.", { type: "error" });
      } finally {
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalLabel;
      }
    });

    const importBtn = container.querySelector("#st-import");
    importBtn.addEventListener("click", async () => {
      const proceed = await window.UIKit.confirmModal(
        "Nhập file sao lưu sẽ GHI ĐÈ toàn bộ tiến trình hiện tại trên máy này. Bạn có chắc chắn muốn tiếp tục?",
        { title: "Nhập dữ liệu sao lưu", confirmLabel: "Tiếp tục nhập", danger: true }
      );
      if (!proceed) return;

      importBtn.disabled = true;
      const originalLabel = importBtn.innerHTML;
      importBtn.innerHTML = window.UIKit.spinnerHTML("Đang chọn file...");
      try {
        const result = await window.api.openFile();
        if (result.canceled) return;
        const parsed = JSON.parse(result.content);
        const data = parsed.data || parsed; // chấp nhận cả file cũ không có bọc "data"
        for (const key of BACKUP_KEYS) {
          if (data[key] !== undefined) await Store.set(key, data[key]);
        }
        window.UIKit.toast("Nhập thành công! Đang tải lại...", { type: "success" });
        setTimeout(() => location.reload(), 900);
      } catch (e) {
        window.UIKit.toast("File không hợp lệ, vui lòng kiểm tra lại.", { type: "error" });
      } finally {
        importBtn.disabled = false;
        importBtn.innerHTML = originalLabel;
      }
    });

    const resetBtn = container.querySelector("#st-reset");
    resetBtn.addEventListener("click", async () => {
      const confirmed = await window.UIKit.confirmModal(
        "Toàn bộ từ đã ôn, thống kê, ghi chú và nghĩa đã sửa tay sẽ bị xoá vĩnh viễn. Hành động này KHÔNG THỂ hoàn tác.",
        { title: "Xoá toàn bộ tiến trình?", confirmLabel: "Xoá vĩnh viễn", danger: true }
      );
      if (!confirmed) return;
      resetBtn.disabled = true;
      resetBtn.innerHTML = window.UIKit.spinnerHTML("Đang xoá...");
      for (const key of BACKUP_KEYS) {
        if (key === "settings") continue; // giữ lại cài đặt
        await Store.set(key, {});
      }
      window.UIKit.toast("Đã xoá toàn bộ tiến trình.", { type: "info" });
      setTimeout(() => location.reload(), 600);
    });
  }

  return { render };
})();
