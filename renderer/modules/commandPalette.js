// Command Palette (Ctrl+K / Cmd+K): tìm kiếm nhanh xuyên suốt toàn app —
// mục điều hướng, từ vựng, chủ điểm ngữ pháp, động từ, chủ đề khám phá —
// không cần click qua từng mục một.
window.CommandPalette = (function () {
  let overlay = null;

  function buildIndex(query) {
    const q = query.trim().toLowerCase();
    const results = [];

    (window.APP_NAV_ITEMS || []).forEach((item) => {
      if (!q || item.label.toLowerCase().includes(q)) {
        results.push({
          icon: item.icon,
          title: item.label,
          sub: "Chuyển tới mục",
          action: () => window.appNavigateTo(item.id),
        });
      }
    });

    if (q.length >= 2) {
      (window.VOCAB_DATA || [])
        .filter((w) => w.fr.toLowerCase().includes(q))
        .slice(0, 6)
        .forEach((w) => {
          results.push({
            icon: "📚",
            title: w.fr,
            sub: `Từ vựng · ${w.level} · ${w.category}`,
            action: async () => {
              await window.appNavigateTo("vocab");
              const input = document.querySelector("#vb-search");
              if (input) {
                input.value = w.fr;
                input.dispatchEvent(new Event("input"));
              }
            },
          });
        });

      (window.GRAMMAR_TOPICS || [])
        .filter((t) => t.label.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((t) => {
          results.push({
            icon: "📖",
            title: t.label,
            sub: `Ngữ pháp · ${t.level}`,
            action: async () => {
              await window.appNavigateTo("grammar");
              const btn = document.querySelector(`.grammar-topic-btn[data-slug="${t.slug}"]`);
              if (btn) btn.click();
            },
          });
        });

      (window.CONJUGATION_VERBS || [])
        .filter((v) => v.infinitive.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((v) => {
          results.push({
            icon: "🔤",
            title: v.infinitive,
            sub: `Chia động từ · ${v.level}`,
            action: async () => window.appNavigateTo("conjugation"),
          });
        });

      (window.DISCOVER_CATEGORIES || [])
        .filter((c) => c.label.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((c) => {
          results.push({
            icon: "🔭",
            title: c.label,
            sub: "Khám phá từ vựng",
            action: async () => {
              await window.appNavigateTo("discover");
              const chip = document.querySelector(`.discover-chip[data-slug="${c.slug}"]`);
              if (chip) chip.click();
            },
          });
        });

      (window.WIKIBOOKS_LESSONS || [])
        .filter((l) => l.label.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach((l) => {
          results.push({
            icon: "📗",
            title: l.label,
            sub: `Bài học Wikibooks · ${l.level}`,
            action: async () => window.appNavigateTo("grammar"),
          });
        });
    }

    return results.slice(0, 20);
  }

  function open() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "cmdk-overlay";
    overlay.innerHTML = `
      <div class="cmdk-box">
        <input type="text" id="cmdk-input" class="cmdk-input" placeholder="Tìm mục, từ vựng, chủ điểm ngữ pháp, động từ..." autocomplete="off" />
        <div class="cmdk-results" id="cmdk-results"></div>
        <div class="cmdk-hint">↑↓ chọn · Enter mở · Esc đóng</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#cmdk-input");
    const resultsEl = overlay.querySelector("#cmdk-results");
    let activeIndex = 0;
    let currentResults = [];

    function renderResults(query) {
      currentResults = buildIndex(query);
      activeIndex = 0;
      if (currentResults.length === 0) {
        resultsEl.innerHTML = `<div class="cmdk-empty">Không tìm thấy gì khớp.</div>`;
        return;
      }
      resultsEl.innerHTML = currentResults
        .map(
          (r, i) => `
        <button class="cmdk-item ${i === 0 ? "active" : ""}" data-idx="${i}">
          <span class="cmdk-item-icon">${r.icon}</span>
          <span class="cmdk-item-text">
            <span class="cmdk-item-title">${r.title}</span>
            <span class="cmdk-item-sub">${r.sub}</span>
          </span>
        </button>
      `
        )
        .join("");
      resultsEl.querySelectorAll(".cmdk-item").forEach((btn) => {
        btn.addEventListener("click", () => selectResult(Number(btn.dataset.idx)));
      });
    }

    function selectResult(idx) {
      const r = currentResults[idx];
      if (!r) return;
      close();
      r.action();
    }

    function moveActive(delta) {
      if (currentResults.length === 0) return;
      activeIndex = (activeIndex + delta + currentResults.length) % currentResults.length;
      resultsEl.querySelectorAll(".cmdk-item").forEach((el, i) => el.classList.toggle("active", i === activeIndex));
      const activeEl = resultsEl.querySelector(".cmdk-item.active");
      if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveActive(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveActive(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectResult(activeIndex);
      } else if (e.key === "Escape") {
        close();
      }
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    renderResults("");
    requestAnimationFrame(() => {
      overlay.classList.add("cmdk-visible");
      input.focus();
    });
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
  }

  function toggle() {
    if (overlay) close();
    else open();
  }

  return { open, close, toggle };
})();
