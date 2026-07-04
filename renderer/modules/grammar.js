// Mục Ngữ pháp: nội dung giải thích được VIẾT SẴN (curated) trong
// data/grammarTopics.js — không lấy qua API nữa (bản trước lấy tóm tắt
// Wikipedia nhưng quá hàn lâm, không có ví dụ thực hành cho người học).
// Vẫn cho phép người dùng viết lại/bổ sung theo cách hiểu riêng nếu muốn.
window.GrammarModule = (function () {
  const STORE_KEY = "grammarUserNotes";
  const LESSON_STORE_KEY = "wikibooksLessonCache";
  let currentSlug = null;
  let visibleLessonCount = 6;

  async function getUserNote(slug) {
    const store = await Store.get(STORE_KEY, {});
    return store[slug] || null;
  }

  async function setUserNote(slug, note) {
    await Store.mergeNested(STORE_KEY, slug, { note, savedAt: Date.now() });
  }

  async function clearUserNote(slug) {
    const store = await Store.get(STORE_KEY, {});
    delete store[slug];
    await Store.set(STORE_KEY, store);
  }

  function render(container) {
    const levels = window.LEVELS;
    container.innerHTML = `
      <div class="game-header">
        <h2>📖 Ngữ pháp</h2>
      </div>
      <p class="game-sub">20 chủ điểm từ A1 đến B2, giải thích ngắn gọn kèm ví dụ thực tế. Bạn có thể ghi chú thêm cách hiểu của riêng mình ở cuối mỗi bài.</p>
      <div class="grammar-layout">
        <div class="grammar-topics">
          ${levels
            .map(
              (lvl) => `
            <div class="grammar-level-group">
              <div class="grammar-level-title">${lvl}</div>
              ${window.GRAMMAR_TOPICS.filter((t) => t.level === lvl)
                .map((t) => `<button class="grammar-topic-btn" data-slug="${t.slug}">${t.label}</button>`)
                .join("")}
            </div>
          `
            )
            .join("")}
        </div>
        <div class="grammar-content" id="grammar-content">
          <div class="empty-state">👈 Chọn một chủ điểm bên trái để xem giải thích.</div>
        </div>
      </div>

      <h3 class="section-title" style="margin-top:40px;">📗 Bài học theo chủ đề (Wikibooks, đầy đủ hơn)</h3>
      <p class="game-sub">Giáo trình mở, viết theo hướng sư phạm (không phải tóm tắt bách khoa). Nội dung gốc tiếng Anh xen tiếng Pháp, có bản dịch tự động bên dưới.</p>
      <div class="lesson-chips" id="lesson-chips"></div>
      <div id="lesson-load-more-zone"></div>
      <div id="lesson-content"></div>
    `;

    renderLessonChips(container);

    container.querySelectorAll(".grammar-topic-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectTopic(container, btn.dataset.slug));
    });

    if (currentSlug) selectTopic(container, currentSlug);
  }

  function renderLessonChips(container) {
    const chipsZone = container.querySelector("#lesson-chips");
    const visible = window.WIKIBOOKS_LESSONS.slice(0, visibleLessonCount);
    chipsZone.innerHTML = visible
      .map((l) => `<button class="discover-chip" data-lesson-slug="${l.slug}"><span class="badge badge-${l.level}">${l.level}</span> ${l.label}</button>`)
      .join("");
    chipsZone.querySelectorAll("[data-lesson-slug]").forEach((btn) => {
      btn.addEventListener("click", () => selectLesson(container, btn.dataset.lessonSlug));
    });

    const loadMoreZone = container.querySelector("#lesson-load-more-zone");
    if (visibleLessonCount < window.WIKIBOOKS_LESSONS.length) {
      loadMoreZone.innerHTML = `<button class="btn btn-primary" id="lesson-load-more-btn" style="margin-top:12px;">⬇️ Tải thêm bài học</button>`;
      loadMoreZone.querySelector("#lesson-load-more-btn").addEventListener("click", () => {
        visibleLessonCount += 6;
        renderLessonChips(container);
      });
    } else {
      loadMoreZone.innerHTML = "";
    }
  }

  async function getLessonCache(slug) {
    const store = await Store.get(LESSON_STORE_KEY, {});
    return store[slug] || null;
  }

  async function selectLesson(container, slug) {
    container.querySelectorAll("[data-lesson-slug]").forEach((b) => b.classList.toggle("active", b.dataset.lessonSlug === slug));
    const lesson = window.WIKIBOOKS_LESSONS.find((l) => l.slug === slug);
    const zone = container.querySelector("#lesson-content");
    zone.innerHTML = `<div class="empty-state">${window.UIKit.spinnerHTML("Đang tải bài học từ Wikibooks...")}</div>`;

    let cached = await getLessonCache(slug);
    if (!cached || !cached.extract) {
      try {
        const extract = await window.ExternalSources.fetchWikibooksLesson(lesson.pageTitle);
        if (!extract) throw new Error("Không có nội dung");
        const translated = await Enrichment.translateLong(extract.slice(0, 3000), "en|vi");
        cached = { extract: extract.slice(0, 3000), translated, fetchedAt: Date.now() };
        await Store.mergeNested(LESSON_STORE_KEY, slug, cached);
      } catch (e) {
        zone.innerHTML = `
          <div class="empty-state">Không tải được bài học này (trang có thể chưa tồn tại hoặc mất mạng).</div>
          <button class="btn btn-primary" id="lesson-retry">🔄 Thử lại</button>
        `;
        zone.querySelector("#lesson-retry").addEventListener("click", () => selectLesson(container, slug));
        return;
      }
    }

    zone.innerHTML = `
      <div class="grammar-card">
        <h3>${lesson.label}</h3>
        <div class="badge badge-${lesson.level}" style="margin-bottom:14px;display:inline-block;">${lesson.level}</div>
        <div class="grammar-block">
          <div class="grammar-block-label">📄 Nguyên văn (Wikibooks, tiếng Anh xen tiếng Pháp)</div>
          <div class="grammar-text lesson-original">${cached.extract.replace(/\n+/g, "<br/><br/>")}</div>
        </div>
        <div class="grammar-block">
          <div class="grammar-block-label">🇻🇳 Bản dịch tự động</div>
          <div class="grammar-text">${cached.translated || '<span class="fc-error">Không dịch được</span>'}</div>
        </div>
        <a class="grammar-source-link" href="https://en.wikibooks.org/wiki/${encodeURIComponent(lesson.pageTitle.replace(/ /g, "_"))}" target="_blank" rel="noopener">Xem bài đầy đủ trên Wikibooks ↗</a>
      </div>
    `;
  }

  async function selectTopic(container, slug) {
    currentSlug = slug;
    container.querySelectorAll(".grammar-topic-btn").forEach((b) => b.classList.toggle("active", b.dataset.slug === slug));
    const topic = window.GRAMMAR_TOPICS.find((t) => t.slug === slug);
    const contentEl = container.querySelector("#grammar-content");
    const userNote = await getUserNote(slug);

    contentEl.innerHTML = `
      <div class="grammar-card">
        <h3>${topic.label}</h3>
        <div class="badge badge-${topic.level}" style="margin-bottom:14px;display:inline-block;">${topic.level}</div>

        <p class="grammar-intro">${topic.intro}</p>

        <div class="grammar-block">
          <div class="grammar-block-label">📌 Quy tắc chính</div>
          <ul class="grammar-rules-list">
            ${topic.rules.map((r) => `<li>${r}</li>`).join("")}
          </ul>
        </div>

        <div class="grammar-block">
          <div class="grammar-block-label">💬 Ví dụ</div>
          <div class="grammar-examples">
            ${topic.examples
              .map(
                (ex) => `
              <div class="grammar-example-row">
                <button class="btn-icon" data-speak="${ex.fr.replace(/"/g, "&quot;")}" title="Nghe phát âm">🔊</button>
                <div>
                  <div class="grammar-example-fr">${ex.fr}</div>
                  <div class="grammar-example-vi">${ex.vi}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        ${topic.tip ? `<div class="grammar-tip">💡 <b>Mẹo:</b> ${topic.tip}</div>` : ""}

        ${
          topic.wikiTitle
            ? `<a class="grammar-source-link" href="https://fr.wikipedia.org/wiki/${encodeURIComponent(topic.wikiTitle.replace(/ /g, "_"))}" target="_blank" rel="noopener">Đọc thêm trên Wikipédia (tiếng Pháp, chuyên sâu hơn) ↗</a>`
            : ""
        }

        <div class="grammar-block grammar-user-note-block">
          <div class="grammar-block-label">📝 Ghi chú của bạn</div>
          <div id="grammar-note-display">
            ${
              userNote
                ? `<div class="grammar-text">${userNote.note}</div>`
                : `<div class="muted">Chưa có ghi chú — bấm bên dưới để thêm cách hiểu/ví dụ của riêng bạn.</div>`
            }
          </div>
          <button class="btn btn-primary" id="grammar-note-edit-btn" style="margin-top:10px;">✏️ ${userNote ? "Sửa ghi chú" : "Thêm ghi chú"}</button>
        </div>

        ${
          topic.exerciseType
            ? `<div class="grammar-exercise-launch">
                <button class="btn btn-primary" id="grammar-practice-btn">🎯 Luyện tập chủ điểm này (5 câu)</button>
              </div>
              <div id="grammar-exercise-zone"></div>`
            : `<div class="grammar-exercise-launch"><span class="muted">Chủ điểm này chưa có bài luyện tập tự động.</span></div>`
        }
      </div>
    `;

    contentEl.querySelectorAll("[data-speak]").forEach((btn) => {
      btn.addEventListener("click", () => DictAPI.pronounce(btn.dataset.speak));
    });

    if (topic.exerciseType) {
      contentEl.querySelector("#grammar-practice-btn").addEventListener("click", () => {
        startExerciseSet(contentEl.querySelector("#grammar-exercise-zone"), topic);
      });
    }

    contentEl.querySelector("#grammar-note-edit-btn").addEventListener("click", () => {
      const displayEl = contentEl.querySelector("#grammar-note-display");
      const form = document.createElement("div");
      form.className = "fc-edit-form";
      form.innerHTML = `
        <textarea class="text-input grammar-edit-textarea" id="grammar-note-textarea" placeholder="Viết cách bạn hiểu chủ điểm này, hoặc thêm ví dụ của riêng bạn...">${userNote ? userNote.note : ""}</textarea>
        <div class="fc-edit-actions">
          <button class="btn btn-primary" id="grammar-note-save">Lưu</button>
          <button class="btn btn-icon" id="grammar-note-cancel">Hủy</button>
        </div>
      `;
      displayEl.replaceWith(form);
      form.querySelector("#grammar-note-cancel").addEventListener("click", () => selectTopic(container, slug));
      form.querySelector("#grammar-note-save").addEventListener("click", async () => {
        const text = form.querySelector("#grammar-note-textarea").value.trim();
        if (text) await setUserNote(slug, text);
        else await clearUserNote(slug);
        selectTopic(container, slug);
      });
    });
  }

  function startExerciseSet(zone, topic) {
    let round = 0;
    let score = 0;
    const totalRounds = 5;
    runRound();

    function runRound() {
      if (round >= totalRounds) {
        zone.innerHTML = `<div class="empty-state">🏁 Xong! Bạn làm đúng ${score}/${totalRounds} câu.</div>`;
        return;
      }
      const exercise = window.GrammarExercises.generate(topic.exerciseType, topic.level);
      zone.innerHTML = `
        <div class="quiz-card" style="margin-top:16px;">
          <div class="conjugation-prompt">${exercise.prompt}</div>
          <div class="conjugation-input-row">
            <input type="text" id="ge-answer" class="text-input conjugation-input" autocomplete="off" placeholder="Gõ đáp án..." />
            <button class="btn btn-primary" id="ge-submit">Kiểm tra</button>
          </div>
          <div id="ge-feedback" class="quiz-feedback"></div>
          <div class="game-sub" style="margin-top:10px;">Câu ${round + 1}/${totalRounds} — Đúng: ${score}</div>
        </div>
      `;
      const input = zone.querySelector("#ge-answer");
      input.focus();
      let locked = false;

      function submit() {
        if (locked) return;
        locked = true;
        const isCorrect = window.GrammarExercises.checkAnswer(input.value, exercise);
        const feedback = zone.querySelector("#ge-feedback");
        if (isCorrect) {
          score += 1;
          feedback.textContent = `Chính xác! ${exercise.fullSentence} 🎉`;
          feedback.className = "quiz-feedback feedback-good";
          window.SoundFX.correct();
        } else {
          feedback.innerHTML = `Chưa đúng. Câu đúng: <b>${exercise.fullSentence}</b>`;
          feedback.className = "quiz-feedback feedback-bad";
          window.SoundFX.wrong();
        }
        bumpExerciseStats(isCorrect);
        round += 1;
        setTimeout(runRound, 1600);
      }

      zone.querySelector("#ge-submit").addEventListener("click", submit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit();
      });
    }
  }

  async function bumpExerciseStats(isCorrect) {
    if (!isCorrect) return;
    const stats = await Store.get("stats", { grammarExerciseCorrect: 0 });
    await Store.merge("stats", { grammarExerciseCorrect: (stats.grammarExerciseCorrect || 0) + 1 });
  }

  return { render };
})();
