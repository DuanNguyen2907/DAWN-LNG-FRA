// Mục Ngữ pháp — bản trực quan hoá: nhóm theo chủ đề, thẻ công thức/nghĩa/
// giải thích, ví dụ tô màu theo vai trò ngữ pháp, dòng thời gian cho các thì,
// chủ điểm liên quan, bài kéo-thả sắp xếp câu, và phần luyện viết (có thể bỏ qua).
window.GrammarModule = (function () {
  const NOTE_STORE_KEY = "grammarUserNotes";
  const LESSON_STORE_KEY = "wikibooksLessonCache";
  const WRITING_STORE_KEY = "grammarWritingPractice";
  let currentSlug = null;
  let visibleLessonCount = 6;
  let activeCategory = window.GRAMMAR_CATEGORIES[0];

  // Chỉ vài chủ điểm về THÌ mới cần dòng thời gian — không áp cho mọi chủ điểm.
  const TIMELINE_BY_SLUG = {
    "passe-compose": ["passe-compose"],
    "imparfait-vs-passe-compose": ["imparfait", "passe-compose"],
    futur: ["futur"],
  };

  function getTopic(slug) {
    return window.GRAMMAR_TOPICS.find((t) => t.slug === slug);
  }

  async function getUserNote(slug) {
    const store = await Store.get(NOTE_STORE_KEY, {});
    return store[slug] || null;
  }
  async function setUserNote(slug, note) {
    await Store.mergeNested(NOTE_STORE_KEY, slug, { note, savedAt: Date.now() });
  }
  async function clearUserNote(slug) {
    const store = await Store.get(NOTE_STORE_KEY, {});
    delete store[slug];
    await Store.set(NOTE_STORE_KEY, store);
  }

  async function getWritingEntries(slug) {
    const store = await Store.get(WRITING_STORE_KEY, {});
    return store[slug] || { sentences: ["", "", "", ""], skipped: false };
  }
  async function saveWritingEntries(slug, sentences, skipped) {
    await Store.mergeNested(WRITING_STORE_KEY, slug, { sentences, skipped, savedAt: Date.now() });
  }

  function render(container) {
    container.innerHTML = `
      <div class="game-header">
        <h2>📖 Ngữ pháp</h2>
      </div>
      <p class="game-sub">20 chủ điểm A1-B2, nhóm theo chủ đề. Mỗi bài có công thức, ví dụ tô màu theo vai trò ngữ pháp, chủ điểm liên quan, và phần luyện viết riêng.</p>
      <div class="grammar-legend">
        <span class="gram-hl gram-hl-pronoun">chủ ngữ</span>
        <span class="gram-hl gram-hl-verb">động từ</span>
        <span class="gram-hl gram-hl-article">mạo từ</span>
        <span class="gram-hl gram-hl-noun">danh từ</span>
        <span class="gram-hl gram-hl-adjective">tính từ</span>
        <span class="gram-hl gram-hl-negation">phủ định</span>
      </div>

      <div class="grammar-category-tabs-wrap">
        <button class="grammar-tab-arrow" id="grammar-cat-left" title="Cuộn trái">‹</button>
        <div class="grammar-category-tabs" id="grammar-category-tabs">
          ${window.GRAMMAR_CATEGORIES.map(
            (cat) => `<button class="grammar-cat-tab ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">${cat}</button>`
          ).join("")}
        </div>
        <button class="grammar-tab-arrow" id="grammar-cat-right" title="Cuộn phải">›</button>
      </div>

      <div class="grammar-layout">
        <div class="grammar-topics" id="grammar-topics-list"></div>
        <div class="grammar-content" id="grammar-content">
          <div class="empty-state">👈 Chọn một chủ điểm bên trái để xem giải thích.</div>
        </div>
      </div>

      <h3 class="section-title" style="margin-top:40px;">📗 Bài học theo chủ đề (Wikibooks, đầy đủ hơn)</h3>
      <p class="game-sub">Giáo trình mở, viết theo hướng sư phạm. Nội dung gốc tiếng Anh xen tiếng Pháp, có bản dịch tự động bên dưới.</p>
      <div class="lesson-chips" id="lesson-chips"></div>
      <div id="lesson-load-more-zone"></div>
      <div id="lesson-content"></div>
    `;

    renderTopicList(container);
    renderLessonChips(container);

    const tabsEl = container.querySelector("#grammar-category-tabs");
    tabsEl.querySelectorAll(".grammar-cat-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        tabsEl.querySelectorAll(".grammar-cat-tab").forEach((b) => b.classList.toggle("active", b === btn));
        renderTopicList(container);
        const firstInCategory = window.GRAMMAR_TOPICS.find((t) => t.category === activeCategory);
        if (firstInCategory) selectTopic(container, firstInCategory.slug);
      });
    });
    container.querySelector("#grammar-cat-left").addEventListener("click", () => {
      tabsEl.scrollBy({ left: -160, behavior: "smooth" });
    });
    container.querySelector("#grammar-cat-right").addEventListener("click", () => {
      tabsEl.scrollBy({ left: 160, behavior: "smooth" });
    });

    if (!currentSlug) {
      const firstInCategory = window.GRAMMAR_TOPICS.find((t) => t.category === activeCategory);
      currentSlug = firstInCategory ? firstInCategory.slug : null;
    }
    if (currentSlug) selectTopic(container, currentSlug);
  }

  function renderTopicList(container) {
    const listEl = container.querySelector("#grammar-topics-list");
    const topicsInCategory = window.GRAMMAR_TOPICS.filter((t) => t.category === activeCategory);
    listEl.innerHTML = topicsInCategory
      .map(
        (t) => `
        <button class="grammar-topic-btn ${t.slug === currentSlug ? "active" : ""}" data-slug="${t.slug}">
          <span class="badge badge-${t.level}">${t.level}</span> ${t.label}
        </button>
      `
      )
      .join("");
    listEl.querySelectorAll(".grammar-topic-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectTopic(container, btn.dataset.slug));
    });
  }

  async function selectTopic(container, slug) {
    currentSlug = slug;
    const topic = getTopic(slug);

    // Nếu chủ điểm được chọn thuộc chủ đề khác (vd bấm "chủ điểm liên quan"),
    // đồng bộ lại tab chủ đề + danh sách bên trái cho khớp.
    if (topic.category !== activeCategory) {
      activeCategory = topic.category;
      container.querySelectorAll(".grammar-cat-tab").forEach((b) => b.classList.toggle("active", b.dataset.cat === activeCategory));
      renderTopicList(container);
    }
    container.querySelectorAll(".grammar-topic-btn").forEach((b) => b.classList.toggle("active", b.dataset.slug === slug));

    const contentEl = container.querySelector("#grammar-content");
    const userNote = await getUserNote(slug);
    const timelineTenses = TIMELINE_BY_SLUG[slug];

    contentEl.innerHTML = `
      <div class="grammar-card">
        <h3>${topic.label}</h3>
        <div class="badge badge-${topic.level}" style="margin-bottom:14px;display:inline-block;">${topic.level}</div>

        <div class="formula-box">
          <div class="formula-label">📐 Công thức</div>
          <div class="formula-text">${topic.formula}</div>
        </div>

        <p class="grammar-meaning"><b>Nghĩa:</b> ${topic.meaning}</p>
        <p class="grammar-intro">${topic.explanation}</p>
        ${topic.notes ? `<div class="grammar-tip">💡 <b>Lưu ý:</b> ${topic.notes}</div>` : ""}

        ${
          timelineTenses
            ? `<div class="grammar-block">
                <div class="grammar-block-label">🕒 Dòng thời gian</div>
                ${window.GrammarUtils.tenseTimelineSVG(timelineTenses)}
              </div>`
            : ""
        }

        <div class="grammar-block">
          <div class="grammar-block-label">💬 4 ví dụ minh hoạ</div>
          <div class="grammar-examples">
            ${topic.examples
              .map(
                (ex) => `
              <div class="grammar-example-row">
                <button class="btn-icon" data-speak="${ex.fr.replace(/"/g, "&quot;")}" title="Nghe phát âm">🔊</button>
                <div>
                  <div class="grammar-example-fr">${window.GrammarUtils.highlightExample(ex.fr, ex.highlight, ex.role)}</div>
                  <div class="grammar-example-vi">${ex.vi}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        ${
          topic.related && (topic.related.similar.length || topic.related.opposite.length)
            ? `<div class="grammar-block">
                <div class="grammar-block-label">🔗 Chủ điểm liên quan</div>
                <div class="related-chips">
                  ${topic.related.similar.map((s) => `<button class="discover-chip related-chip" data-related="${s}">≈ ${getTopic(s).label}</button>`).join("")}
                  ${topic.related.opposite.map((s) => `<button class="discover-chip related-chip related-chip-opposite" data-related="${s}">⇄ ${getTopic(s).label}</button>`).join("")}
                </div>
              </div>`
            : ""
        }

        ${
          topic.wikiTitle
            ? `<a class="grammar-source-link" href="https://fr.wikipedia.org/wiki/${encodeURIComponent(topic.wikiTitle.replace(/ /g, "_"))}" target="_blank" rel="noopener">Đọc thêm trên Wikipédia (chuyên sâu hơn) ↗</a>`
            : ""
        }

        <div class="grammar-block grammar-user-note-block">
          <div class="grammar-block-label">📝 Ghi chú của bạn</div>
          <div id="grammar-note-display">
            ${userNote ? `<div class="grammar-text">${userNote.note}</div>` : `<div class="muted">Chưa có ghi chú — bấm bên dưới để thêm cách hiểu của riêng bạn.</div>`}
          </div>
          <button class="btn btn-primary" id="grammar-note-edit-btn" style="margin-top:10px;">✏️ ${userNote ? "Sửa ghi chú" : "Thêm ghi chú"}</button>
        </div>

        <div class="grammar-block grammar-practice-block">
          <div class="grammar-block-label">🎯 Luyện tập</div>
          <div class="practice-buttons">
            ${topic.exerciseType ? `<button class="btn btn-primary" id="grammar-practice-btn">✏️ Điền từ (5 câu)</button>` : ""}
            <button class="btn btn-primary" id="grammar-order-btn">🧩 Sắp xếp câu</button>
          </div>
          <div id="grammar-exercise-zone"></div>
          <div id="grammar-order-zone"></div>
        </div>

        <div class="grammar-block grammar-writing-block">
          <div class="grammar-block-label">✍️ Viết 4 câu dùng chủ điểm này</div>
          <div id="grammar-writing-zone"></div>
        </div>
      </div>
    `;

    contentEl.querySelectorAll("[data-speak]").forEach((btn) => {
      btn.addEventListener("click", () => DictAPI.pronounce(btn.dataset.speak));
    });

    contentEl.querySelectorAll(".related-chip").forEach((btn) => {
      btn.addEventListener("click", () => selectTopic(container, btn.dataset.related));
    });

    if (topic.exerciseType) {
      contentEl.querySelector("#grammar-practice-btn").addEventListener("click", () => {
        startExerciseSet(contentEl.querySelector("#grammar-exercise-zone"), topic);
      });
    }
    contentEl.querySelector("#grammar-order-btn").addEventListener("click", () => {
      startOrderExercise(contentEl.querySelector("#grammar-order-zone"), topic);
    });

    renderWritingPractice(contentEl.querySelector("#grammar-writing-zone"), slug);

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

  function startOrderExercise(zone, topic) {
    const example = topic.examples[Math.floor(Math.random() * topic.examples.length)];
    zone.innerHTML = `<div class="quiz-card" style="margin-top:14px;"></div>`;
    window.SentenceOrderExercise.render(zone.querySelector(".quiz-card"), example.fr, example.vi, () => {
      // không cần làm gì thêm — phản hồi đã hiển thị trong chính exercise
    });
  }

  async function renderWritingPractice(zone, slug) {
    const data = await getWritingEntries(slug);
    if (data.skipped) {
      zone.innerHTML = `
        <div class="muted">Bạn đã bỏ qua phần này cho chủ điểm này.</div>
        <button class="btn btn-icon" id="writing-unskip">Viết lại</button>
      `;
      zone.querySelector("#writing-unskip").addEventListener("click", async () => {
        await saveWritingEntries(slug, data.sentences, false);
        renderWritingPractice(zone, slug);
      });
      return;
    }

    zone.innerHTML = `
      <p class="game-sub">Viết 4 câu tiếng Pháp có dùng chủ điểm này (không bắt buộc — có thể bỏ qua). App không chấm điểm tự động phần này, đây là chỗ để bạn tự luyện diễn đạt.</p>
      ${[0, 1, 2, 3]
        .map(
          (i) => `<input type="text" class="text-input writing-input" id="writing-input-${i}" placeholder="Câu ${i + 1}..." value="${(data.sentences[i] || "").replace(/"/g, "&quot;")}" />`
        )
        .join("")}
      <div class="fc-edit-actions" style="margin-top:12px;">
        <button class="btn btn-primary" id="writing-save">💾 Lưu</button>
        <button class="btn btn-icon" id="writing-skip">Bỏ qua phần này</button>
      </div>
      <div id="writing-saved-msg" class="settings-saved-msg"></div>
    `;

    zone.querySelector("#writing-save").addEventListener("click", async () => {
      const sentences = [0, 1, 2, 3].map((i) => zone.querySelector(`#writing-input-${i}`).value.trim());
      await saveWritingEntries(slug, sentences, false);
      window.UIKit.toast("Đã lưu câu của bạn", { type: "success" });
    });
    zone.querySelector("#writing-skip").addEventListener("click", async () => {
      const sentences = [0, 1, 2, 3].map((i) => zone.querySelector(`#writing-input-${i}`).value.trim());
      await saveWritingEntries(slug, sentences, true);
      renderWritingPractice(zone, slug);
    });
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
