// Trình duyệt từ vựng: xem toàn bộ từ, lọc theo cấp độ/chủ đề, phát âm.
// Nghĩa tiếng Việt + ví dụ được tải lười (lazy) qua Enrichment khi từ xuất
// hiện trong danh sách lọc hiện tại, có cache và cho sửa tay.
window.VocabBrowser = (function () {
  let state = { level: "all", category: "all", search: "", page: 1, pageSize: 20 };

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
          <option value="C1">C1 - Thành thạo</option>
          <option value="C2">C2 - Xuất sắc</option>
        </select>
        <select id="vb-category" class="level-select">
          <option value="all">Tất cả chủ đề</option>
          ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>
        <label class="vb-pagesize-label">
          Hiển thị
          <select id="vb-pagesize" class="level-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          / trang
        </label>
      </div>
      <div id="vb-count" class="game-sub"></div>
      <div id="vb-list" class="vocab-list"></div>
      <div id="vb-pagination" class="pagination-bar"></div>
    `;

    container.querySelector("#vb-search").addEventListener("input", (e) => {
      state.search = e.target.value.toLowerCase();
      state.page = 1;
      renderList(container);
    });
    container.querySelector("#vb-search").focus();
    container.querySelector("#vb-level").addEventListener("change", (e) => {
      state.level = e.target.value;
      state.page = 1;
      renderList(container);
    });
    container.querySelector("#vb-category").addEventListener("change", (e) => {
      state.category = e.target.value;
      state.page = 1;
      renderList(container);
    });
    const pageSizeSelect = container.querySelector("#vb-pagesize");
    pageSizeSelect.value = String(state.pageSize);
    pageSizeSelect.addEventListener("change", (e) => {
      state.pageSize = Number(e.target.value);
      state.page = 1;
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
    const listEl = container.querySelector("#vb-list");
    const paginationEl = container.querySelector("#vb-pagination");

    if (list.length === 0) {
      countEl.textContent = "0 từ";
      listEl.innerHTML = `<div class="empty-state">Không tìm thấy từ nào phù hợp.</div>`;
      paginationEl.innerHTML = "";
      return;
    }

    const totalPages = Math.max(1, Math.ceil(list.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const startIdx = (state.page - 1) * state.pageSize;
    const visible = list.slice(startIdx, startIdx + state.pageSize);

    countEl.textContent = isViSearch
      ? `Đang lọc theo nghĩa...`
      : `${list.length} từ — trang ${state.page}/${totalPages}`;

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

    renderPagination(container, list.length, totalPages);

    listEl.querySelectorAll('button[data-action="speak"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        DictAPI.pronounce(btn.dataset.word);
      });
    });
    listEl.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const word = visible.find((w) => String(w.id) === btn.dataset.id);
        openEditRow(container, word);
      });
    });
    listEl.querySelectorAll(".vocab-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest(".fc-edit-form") || e.target.closest(".vocab-row-actions")) return;
        const word = visible.find((w) => String(w.id) === row.dataset.id);
        if (word) window.WordDetailModal.open(word);
      });
    });

    await Promise.all(
      visible.map((w) => Promise.all([loadRowMeaning(container, w), loadRowImage(container, w)]))
    );

    if (isViSearch) {
      const visibleCount = listEl.querySelectorAll('.vocab-row:not([style*="display: none"])').length;
      const countElAfter = container.querySelector("#vb-count");
      if (countElAfter) countElAfter.textContent = `${visibleCount} từ trên trang này (trang ${state.page}/${totalPages})`;
    }
  }

  function renderPagination(container, totalItems, totalPages) {
    const paginationEl = container.querySelector("#vb-pagination");
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    // Hiện tối đa 5 số trang xung quanh trang hiện tại, kèm nút đầu/cuối khi cần
    const page = state.page;
    const pages = [];
    const windowSize = 2;
    for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
      pages.push(p);
    }

    paginationEl.innerHTML = `
      <button class="pagination-btn" id="vb-page-prev" ${page === 1 ? "disabled" : ""}>‹ Trước</button>
      ${page > windowSize + 1 ? `<button class="pagination-btn" data-page="1">1</button>${page > windowSize + 2 ? '<span class="pagination-ellipsis">…</span>' : ""}` : ""}
      ${pages.map((p) => `<button class="pagination-btn ${p === page ? "active" : ""}" data-page="${p}">${p}</button>`).join("")}
      ${page < totalPages - windowSize ? `${page < totalPages - windowSize - 1 ? '<span class="pagination-ellipsis">…</span>' : ""}<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>` : ""}
      <button class="pagination-btn" id="vb-page-next" ${page === totalPages ? "disabled" : ""}>Sau ›</button>
    `;

    paginationEl.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.page = Number(btn.dataset.page);
        renderList(container);
        container.querySelector("#vb-list").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    const prevBtn = paginationEl.querySelector("#vb-page-prev");
    const nextBtn = paginationEl.querySelector("#vb-page-next");
    if (prevBtn) prevBtn.addEventListener("click", () => {
      if (state.page > 1) {
        state.page -= 1;
        renderList(container);
        container.querySelector("#vb-list").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
      if (state.page < totalPages) {
        state.page += 1;
        renderList(container);
        container.querySelector("#vb-list").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
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
