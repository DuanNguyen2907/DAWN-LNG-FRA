// Thẻ chi tiết từ vựng — dùng chung cho Khám phá và Từ điển. Hiện đầy đủ:
// nghĩa, ví dụ câu, phiên âm (IPA), từ loại, đồng nghĩa/trái nghĩa (từ Free
// Dictionary API khi có), và cho sửa nghĩa/ví dụ ngay tại thẻ.
window.WordDetailModal = (function () {
  let overlay = null;

  function close() {
    if (!overlay) return;
    overlay.classList.remove("modal-visible");
    setTimeout(() => {
      if (overlay) overlay.remove();
      overlay = null;
    }, 180);
  }

  async function open(word) {
    if (overlay) close();
    overlay = document.createElement("div");
    overlay.className = "modal-overlay word-detail-overlay";
    overlay.innerHTML = `
      <div class="modal-card word-detail-card">
        <button class="btn-icon word-detail-close" id="wd-close">✕</button>
        <div id="wd-body">${window.UIKit.spinnerHTML("Đang tải chi tiết...")}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("modal-visible"));

    overlay.querySelector("#wd-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    function onKeydown(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", onKeydown);
      }
    }
    document.addEventListener("keydown", onKeydown);

    const [data, image] = await Promise.all([
      window.Enrichment.getForWord(word),
      window.Enrichment.getImage(word).catch(() => null),
    ]);

    renderBody(word, data, image);
  }

  function renderBody(word, data, image) {
    if (!overlay) return;
    const body = overlay.querySelector("#wd-body");
    if (!body) return;

    body.innerHTML = `
      <div class="word-detail-header">
        ${image && image.url ? `<img src="${image.url}" class="word-detail-image" alt="${word.fr}" />` : ""}
        <div>
          <div class="word-detail-word">${word.fr}</div>
          <div class="word-detail-meta">
            ${word.level ? `<span class="badge badge-${word.level}">${word.level}</span>` : ""}
            ${data.partOfSpeech ? `<span class="word-detail-pos">${data.partOfSpeech}</span>` : ""}
            ${data.phonetic ? `<span class="word-detail-phonetic">${data.phonetic}</span>` : ""}
          </div>
        </div>
        <button class="btn-icon" id="wd-speak" title="Nghe phát âm">🔊</button>
      </div>

      <div class="word-detail-section">
        <div class="word-detail-label">Nghĩa</div>
        <div class="word-detail-meaning" id="wd-meaning-display">${data.vi ? data.vi : '<span class="fc-error">Không dịch được</span>'}</div>
      </div>

      <div class="word-detail-section">
        <div class="word-detail-label">Ví dụ</div>
        <div id="wd-example-display">
          ${
            data.exampleFr
              ? `<div class="grammar-example-fr">${data.exampleFr}</div><div class="grammar-example-vi">${data.exampleVi || ""}</div>`
              : `<span class="fc-error">Chưa có ví dụ</span>`
          }
        </div>
      </div>

      ${
        (data.synonyms && data.synonyms.length) || (data.antonyms && data.antonyms.length)
          ? `<div class="word-detail-section word-detail-syn-ant">
              ${
                data.synonyms && data.synonyms.length
                  ? `<div>
                      <div class="word-detail-label">Đồng nghĩa</div>
                      <div class="related-chips">${data.synonyms.map((s) => `<button class="discover-chip related-chip word-detail-syn-chip" data-word="${s.replace(/"/g, "&quot;")}">${s}</button>`).join("")}</div>
                    </div>`
                  : ""
              }
              ${
                data.antonyms && data.antonyms.length
                  ? `<div>
                      <div class="word-detail-label">Trái nghĩa</div>
                      <div class="related-chips">${data.antonyms.map((s) => `<button class="discover-chip related-chip related-chip-opposite word-detail-syn-chip" data-word="${s.replace(/"/g, "&quot;")}">${s}</button>`).join("")}</div>
                    </div>`
                  : ""
              }
            </div>`
          : `<div class="word-detail-section"><span class="muted">Free Dictionary API không có sẵn từ đồng nghĩa/trái nghĩa cho từ này.</span></div>`
      }

      <button class="btn btn-primary" id="wd-edit-btn" style="margin-top:6px;">✏️ Sửa nghĩa/ví dụ</button>
    `;

    overlay.querySelector("#wd-speak").addEventListener("click", () => window.DictAPI.pronounce(word.fr));
    overlay.querySelectorAll(".word-detail-syn-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        open({ id: `syn_${chip.dataset.word.toLowerCase()}`, fr: chip.dataset.word });
      });
    });
    overlay.querySelector("#wd-edit-btn").addEventListener("click", () => openEditForm(word, data));
  }

  function openEditForm(word, data) {
    const body = overlay.querySelector("#wd-body");
    const existingForm = body.querySelector(".fc-edit-form");
    if (existingForm) return;

    const form = document.createElement("div");
    form.className = "fc-edit-form";
    form.innerHTML = `
      <input type="text" class="text-input" id="wd-edit-vi" value="${(data.vi || "").replace(/"/g, "&quot;")}" placeholder="Nghĩa tiếng Việt..." />
      <input type="text" class="text-input" id="wd-edit-ex-fr" value="${(data.exampleFr || "").replace(/"/g, "&quot;")}" placeholder="Câu ví dụ tiếng Pháp..." />
      <input type="text" class="text-input" id="wd-edit-ex-vi" value="${(data.exampleVi || "").replace(/"/g, "&quot;")}" placeholder="Nghĩa câu ví dụ..." />
      <div class="fc-edit-actions">
        <button class="btn btn-primary" id="wd-edit-save">Lưu</button>
        <button class="btn btn-icon" id="wd-edit-cancel">Hủy</button>
      </div>
    `;
    body.appendChild(form);
    form.querySelector("#wd-edit-vi").focus();

    form.querySelector("#wd-edit-cancel").addEventListener("click", () => form.remove());
    form.querySelector("#wd-edit-save").addEventListener("click", async () => {
      const vi = form.querySelector("#wd-edit-vi").value.trim();
      const exFr = form.querySelector("#wd-edit-ex-fr").value.trim();
      const exVi = form.querySelector("#wd-edit-ex-vi").value.trim();
      if (vi) await window.Enrichment.setUserMeaning(word.id, vi);
      if (exFr) await window.Enrichment.setUserExample(word.id, exFr, exVi);
      window.UIKit.toast("Đã lưu", { type: "success" });
      const fresh = await window.Enrichment.getForWord(word);
      const image = await window.Enrichment.getImage(word).catch(() => null);
      renderBody(word, fresh, image);
    });
  }

  return { open, close };
})();
