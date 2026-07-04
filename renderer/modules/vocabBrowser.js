// Trình duyệt từ vựng: xem toàn bộ từ, lọc theo cấp độ/chủ đề, phát âm.
// Nghĩa tiếng Việt + ví dụ được tải lười (lazy) qua Enrichment khi từ xuất
// hiện trong danh sách lọc hiện tại, có cache và cho sửa tay.
window.VocabBrowser = (function () {
  let state = { level: "all", category: "all", search: "" };

  function render(container) {
    const categories = window.CATEGORIES;
    container.innerHTML = `
      <div class="game-header">
        <h2>📚 Từ điển của bạn</h2>
      </div>
      <p class="game-sub">Nghĩa được dịch tự động qua API — bấm ✏️ ở mỗi dòng nếu muốn sửa lại cho chuẩn.</p>
      <div class="browser-filters">
        <input type="text" id="vb-search" class="text-input" placeholder="Tìm từ tiếng Pháp hoặc tiếng Việt..." />
        <select id="vb-level" class="level-select">
          <option value="all">Tất cả cấp độ</option>
          <option value="A1">A1 - Cơ bản</option>
          <option value="A2">A2 - Sơ cấp</option>
          <option value="B1">B1 - Trung cấp</option>
          <option value="B2">B2 - Nâng cao</option>
        </select>
        <select id="vb-category" class="level-select">
          <option value="all">Tất cả chủ đề</option>
          ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
      <div id="vb-count" class="game-sub"></div>
      <div id="vb-list" class="vocab-list"></div>
    `;

    container.querySelector("#vb-search").addEventListener("input", (e) => {
      state.search = e.target.value.toLowerCase();
      renderList(container);
    });
    container.querySelector("#vb-search").focus();
    container.querySelector("#vb-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      renderList(container);
    });
    container.querySelector("#vb-category").addEventListener("change", (e) => {
      state.category = e.target.value;
      renderList(container);
    });

    renderList(container);
  }

  async function renderList(container) {
    const list = window.VOCAB_DATA.filter((w) => {
      const matchLevel = state.level === "all" || w.level === state.level;
      const matchCategory = state.category === "all" || w.category === state.category;
      // Tìm theo tiếng Pháp luôn khả dụng ngay (không cần chờ API)
      const matchSearch = !state.search || w.fr.toLowerCase().includes(state.search);
      return matchLevel && matchCategory && matchSearch;
    });

    const countEl = container.querySelector("#vb-count");
    const isViSearch = !!state.search;
    countEl.textContent = isViSearch ? `Đang lọc theo nghĩa...` : `${list.length} từ`;
    const listEl = container.querySelector("#vb-list");

    if (list.length === 0) {
      listEl.innerHTML = `<div class="empty-state">Không tìm thấy từ nào phù hợp.</div>`;
      return;
    }

    // Giới hạn hiển thị/tải cùng lúc để không spam API — cuộn để tải thêm.
    const visible = list.slice(0, 40);
    listEl.innerHTML = visible
      .map(
        (w) => `
        <div class="vocab-row" data-id="${w.id}">
          <span class="badge badge-${w.level}">${w.level}</span>
          <div class="vocab-row-thumb" id="vb-thumb-${w.id}"></div>
          <div class="vocab-row-main">
            <div class="vocab-row-fr">${w.fr}</div>
            <div class="vocab-row-meaning" id="vb-meaning-${w.id}"><span class="skeleton-row" style="width:120px;display:inline-block;"></span></div>
            <div class="vocab-row-example" id="vb-example-${w.id}"></div>
          </div>
          <div class="vocab-row-actions">
            <button class="btn-icon" data-action="speak" data-word="${w.fr}" title="Nghe phát âm">🔊</button>
            <button class="btn-icon" data-action="edit" data-id="${w.id}" title="Sửa nghĩa">✏️</button>
          </div>
        </div>
      `
      )
      .join("");

    if (list.length > 40) {
      listEl.insertAdjacentHTML(
        "beforeend",
        `<div class="game-sub">Đang hiển thị 40/${list.length} từ — thu hẹp bằng bộ lọc hoặc ô tìm kiếm để xem các từ khác.</div>`
      );
    }

    listEl.querySelectorAll('button[data-action="speak"]').forEach((btn) => {
      btn.addEventListener("click", () => DictAPI.pronounce(btn.dataset.word));
    });
    listEl.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const word = visible.find((w) => String(w.id) === btn.dataset.id);
        openEditRow(container, word);
      });
    });

    await Promise.all(
      visible.map((w) => Promise.all([loadRowMeaning(container, w), loadRowImage(container, w)]))
    );

    if (isViSearch) {
      const visibleCount = listEl.querySelectorAll('.vocab-row:not([style*="display: none"])').length;
      const countElAfter = container.querySelector("#vb-count");
      if (countElAfter) countElAfter.textContent = `${visibleCount} từ`;
    }
  }

  async function loadRowImage(container, word) {
    const thumbEl = container.querySelector(`#vb-thumb-${word.id}`);
    if (!thumbEl) return;
    const image = await Enrichment.getImage(word);
    if (!thumbEl.isConnected) return;
    if (image && image.url) {
      thumbEl.innerHTML = `<img src="${image.url}" alt="${word.fr}" loading="lazy" title="Ảnh: ${image.creator} (${image.license})" />`;
    }
  }

  async function loadRowMeaning(container, word) {
    const data = await Enrichment.getForWord(word);
    const meaningEl = container.querySelector(`#vb-meaning-${word.id}`);
    const exampleEl = container.querySelector(`#vb-example-${word.id}`);
    if (!meaningEl) return; // đã lọc sang danh sách khác

    // Nếu có ô tìm kiếm theo tiếng Việt mà nghĩa không khớp, ẩn dòng này
    if (state.search && !word.fr.toLowerCase().includes(state.search)) {
      const matchViSearch = data.vi && data.vi.toLowerCase().includes(state.search);
      if (!matchViSearch) {
        const row = container.querySelector(`.vocab-row[data-id="${word.id}"]`);
        if (row) row.style.display = "none";
        return;
      }
    }

    meaningEl.innerHTML = data.vi
      ? `<span class="vocab-row-vi">${data.vi}</span>${data.viSource === "user" ? ' <span class="muted">(đã sửa)</span>' : ""}`
      : `<span class="fc-error">Không dịch được — bấm ✏️ để nhập tay</span>`;

    if (exampleEl) {
      exampleEl.innerHTML = data.exampleFr
        ? `${data.exampleFr} <span class="muted">— ${data.exampleVi || ""}</span>`
        : "";
    }
  }

  function openEditRow(container, word) {
    const row = container.querySelector(`.vocab-row[data-id="${word.id}"]`);
    if (!row) return;
    const mainEl = row.querySelector(".vocab-row-main");
    const existingForm = row.querySelector(".fc-edit-form");
    if (existingForm) {
      existingForm.remove();
      return;
    }

    Enrichment.getForWord(word).then((data) => {
      const form = document.createElement("div");
      form.className = "fc-edit-form";
      form.innerHTML = `
        <input type="text" class="text-input" id="vb-edit-vi-${word.id}" value="${(data.vi || "").replace(/"/g, "&quot;")}" placeholder="Nghĩa tiếng Việt..." />
        <input type="text" class="text-input" id="vb-edit-ex-${word.id}" value="${(data.exampleFr || "").replace(/"/g, "&quot;")}" placeholder="Câu ví dụ tiếng Pháp (tùy chọn)..." />
        <div class="fc-edit-actions">
          <button class="btn btn-primary" id="vb-edit-save-${word.id}">Lưu</button>
          <button class="btn btn-icon" id="vb-edit-cancel-${word.id}">Hủy</button>
        </div>
      `;
      mainEl.appendChild(form);

      form.querySelector(`#vb-edit-cancel-${word.id}`).addEventListener("click", () => form.remove());
      form.querySelector(`#vb-edit-save-${word.id}`).addEventListener("click", async () => {
        const vi = form.querySelector(`#vb-edit-vi-${word.id}`).value.trim();
        const exampleFr = form.querySelector(`#vb-edit-ex-${word.id}`).value.trim();
        if (vi) await Enrichment.setUserMeaning(word.id, vi);
        if (exampleFr) await Enrichment.setUserExample(word.id, exampleFr, data.exampleVi || "");
        form.remove();
        loadRowMeaning(container, word);
      });
    });
  }

  return { render };
})();
