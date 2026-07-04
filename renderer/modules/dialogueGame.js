// Giao diện chơi Hội thoại tình huống: hiện câu thoại của nhân vật, người
// học chọn 1 trong các câu trả lời để dẫn dắt hội thoại tới nhánh tiếp theo.
window.DialogueGame = (function () {
  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>💬 Hội thoại tình huống</h2>
      </div>
      <p class="game-sub">Chọn câu trả lời để dẫn dắt cuộc hội thoại — luyện phản xạ giao tiếp thay vì học từ rời rạc.</p>
      <div class="dialogue-scenario-list" id="dialogue-list"></div>
      <div id="dialogue-play-zone"></div>
    `;

    const listEl = container.querySelector("#dialogue-list");
    listEl.innerHTML = window.DIALOGUE_SCENARIOS.map(
      (s) => `<button class="discover-chip" data-slug="${s.slug}"><span class="badge badge-${s.level}">${s.level}</span> ${s.title}</button>`
    ).join("");

    listEl.querySelectorAll("[data-slug]").forEach((btn) => {
      btn.addEventListener("click", () => {
        listEl.querySelectorAll(".discover-chip").forEach((b) => b.classList.toggle("active", b === btn));
        startScenario(container, btn.dataset.slug);
      });
    });
  }

  function startScenario(container, slug) {
    const scenario = window.DIALOGUE_SCENARIOS.find((s) => s.slug === slug);
    playNode(container, scenario, scenario.startNode, []);
  }

  function playNode(container, scenario, nodeId, history) {
    const zone = container.querySelector("#dialogue-play-zone");
    const node = scenario.nodes[nodeId];
    const newHistory = [...history, node];

    zone.innerHTML = `
      <div class="quiz-card dialogue-card">
        <div class="dialogue-history">
          ${newHistory
            .map(
              (n) => `
            <div class="dialogue-line">
              <div class="dialogue-speaker">${n.speaker}</div>
              <div class="dialogue-text">${n.text}</div>
              ${n.translation ? `<div class="dialogue-translation">${n.translation}</div>` : ""}
            </div>
          `
            )
            .join("")}
        </div>
        ${
          node.end
            ? `
          <div class="dialogue-ending">${node.ending}</div>
          <button class="btn btn-primary" id="dialogue-restart">🔁 Chơi lại tình huống này</button>
          <button class="btn btn-icon" id="dialogue-back">← Chọn tình huống khác</button>
        `
            : `
          <div class="dialogue-choices">
            ${node.choices
              .map(
                (c, i) => `
              <button class="dialogue-choice-btn" data-idx="${i}">
                <span class="dialogue-choice-fr">${c.text}</span>
                <span class="dialogue-choice-vi">${c.translation}</span>
              </button>
            `
              )
              .join("")}
          </div>
        `
        }
      </div>
    `;

    zone.querySelector(".dialogue-history").scrollTo?.(0, zone.querySelector(".dialogue-history").scrollHeight);

    if (node.end) {
      SoundFX.correct();
      zone.querySelector("#dialogue-restart").addEventListener("click", () => startScenario(container, scenario.slug));
      zone.querySelector("#dialogue-back").addEventListener("click", () => render(container));
      Store.get("stats", { dialoguesCompleted: 0 }).then((stats) => {
        Store.merge("stats", { dialoguesCompleted: (stats.dialoguesCompleted || 0) + 1 });
      });
    } else {
      zone.querySelectorAll(".dialogue-choice-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const choice = node.choices[Number(btn.dataset.idx)];
          DictAPI.pronounce(choice.text);
          playNode(container, scenario, choice.next, newHistory);
        });
      });
    }
  }

  return { render };
})();
