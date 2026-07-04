// App chính: điều hướng (sidebar kiểu bản đồ metro) + Bảng tin tổng quan
(function () {
  // UI/UX: với 12 mục điều hướng, để rời rạc sẽ khó quét mắt tìm — nhóm lại
  // theo chủ đề (giống cách sắp mục lục sách) để dễ định vị hơn.
  const NAV_GROUPS = [
    { group: null, items: [
      { id: "dashboard", label: "Bảng tin", icon: "🚉" },
      { id: "smart-review", label: "Ôn tập thông minh", icon: "🎯" },
    ] },
    {
      group: "TỪ VỰNG",
      items: [
        { id: "flashcards", label: "Thẻ từ", icon: "🃏" },
        { id: "quiz", label: "Đố vui", icon: "🎲" },
        { id: "matching", label: "Nối từ", icon: "🧩" },
        { id: "speedtype", label: "Gõ nhanh", icon: "⚡" },
        { id: "dictee", label: "Dictée (nghe chép)", icon: "🎧" },
        { id: "dialogue", label: "Hội thoại tình huống", icon: "💬" },
        { id: "learned", label: "Đã học", icon: "📗" },
        { id: "vocab", label: "Từ điển", icon: "📚" },
        { id: "discover", label: "Khám phá", icon: "🔭" },
      ],
    },
    {
      group: "NGỮ PHÁP",
      items: [
        { id: "conjugation", label: "Chia động từ", icon: "🔤" },
        { id: "grammar", label: "Ngữ pháp", icon: "📖" },
        { id: "analyzer", label: "Phân tích câu", icon: "🔬" },
        { id: "reading", label: "Đọc hiểu", icon: "📰" },
      ],
    },
    {
      group: "KHÁC",
      items: [
        { id: "focus", label: "Tập trung", icon: "⏱️" },
        { id: "settings", label: "Cài đặt", icon: "⚙️" },
      ],
    },
  ];
  const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
  window.APP_NAV_ITEMS = NAV_ITEMS; // dùng cho Command Palette

  const MODULES = {
    "smart-review": window.SmartReview,
    flashcards: window.FlashcardsGame,
    quiz: window.QuizGame,
    matching: window.MatchingGame,
    speedtype: window.SpeedTypeGame,
    dictee: window.DicteeGame,
    dialogue: window.DialogueGame,
    learned: window.LearnedWords,
    conjugation: window.ConjugationGame,
    vocab: window.VocabBrowser,
    discover: window.DiscoverVocab,
    grammar: window.GrammarModule,
    analyzer: window.SentenceAnalyzer,
    reading: window.ReadingPractice,
    focus: window.FocusMode,
    settings: window.SettingsPage,
  };

  let current = "dashboard";

  function buildSidebar() {
    const nav = document.getElementById("sidebar-line");
    nav.innerHTML = NAV_GROUPS.map(
      (g) => `
      ${g.group ? `<div class="sidebar-group-label">${g.group}</div>` : ""}
      ${g.items
        .map(
          (item) => `
        <button class="metro-station ${item.id === current ? "active" : ""}" data-id="${item.id}">
          <span class="metro-dot">${item.icon}</span>
          <span class="metro-label">${item.label}</span>
        </button>
      `
        )
        .join("")}
    `
    ).join("");

    nav.querySelectorAll(".metro-station").forEach((btn) => {
      btn.addEventListener("click", () => navigateTo(btn.dataset.id));
    });
  }

  async function navigateTo(id) {
    current = id;
    document.querySelectorAll(".metro-station").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === id);
    });
    const content = document.getElementById("main-content");
    if (id === "dashboard") {
      await renderDashboard(content);
    } else if (MODULES[id]) {
      await MODULES[id].render(content);
    }
  }

  // Cho phép các module con điều hướng chương trình (vd nút "Ôn ngay" ở mục
  // Đã học nhảy sang Thẻ từ) mà không cần import trực tiếp lẫn nhau.
  window.addEventListener("app:navigate", (e) => navigateTo(e.detail));
  window.appNavigateTo = navigateTo; // dùng cho Command Palette

  // Command Palette: Ctrl+K (Windows/Linux) hoặc Cmd+K (Mac)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      window.CommandPalette.toggle();
    }
  });

  function computeStreak(focusLog) {
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (focusLog[key] && focusLog[key] > 0) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return streak;
  }

  async function renderDashboard(container) {
    const stats = await Store.get("stats", {});
    const srsCards = await Store.get("srsCards", {});
    const focusLog = await Store.get("focusLog", {});

    const totalWords = window.VOCAB_DATA.length;
    const started = Object.keys(srsCards).length;
    const mastered = Object.values(srsCards).filter((c) => c.repetition >= 3).length;
    const dueNow = window.VOCAB_DATA.filter((w) => srsCards[w.id] && SRS.isDue(srsCards[w.id])).length;
    const quizAccuracy = stats.quizTotal ? Math.round((stats.quizCorrect / stats.quizTotal) * 100) : null;
    const todaySeconds = focusLog[new Date().toISOString().slice(0, 10)] || 0;
    const streak = computeStreak(focusLog);

    const xp = window.LevelSystem.computeXP(stats, focusLog);
    const progress = window.LevelSystem.getProgress(xp);
    const title = window.LevelSystem.titleForLevel(progress.level);
    await checkLevelUp(progress.level);

    const levelStats = window.LEVELS.map((level) => {
      const wordsInLevel = window.VOCAB_DATA.filter((w) => w.level === level);
      const masteredInLevel = wordsInLevel.filter((w) => srsCards[w.id] && srsCards[w.id].repetition >= 3).length;
      return { level, total: wordsInLevel.length, mastered: masteredInLevel };
    });

    container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-hero">
          <h1>Học tiếng Pháp <span class="accent">điên dại</span> 🔥</h1>
          <p>Cứ chơi mỗi ngày một chút, não sẽ tự khắc nhớ. Không cần nghiêm túc, chỉ cần đều đặn.</p>
          <div class="xp-bar-row">
            <div class="xp-level-badge">Cấp ${progress.level}</div>
            <div class="xp-bar-track">
              <div class="xp-bar-fill" style="width:${progress.pct}%"></div>
            </div>
            <div class="xp-label">${progress.xpIntoLevel}/${progress.xpForLevel} XP</div>
          </div>
          <div class="xp-title">${title}</div>
          <button class="btn btn-primary btn-large sr-hero-cta" id="dash-smart-review">🎯 Ôn tập thông minh hôm nay</button>
        </div>


        <div class="stat-cards-row">
          <div class="stat-card">
            <div class="stat-value">${started} / ${totalWords}</div>
            <div class="stat-label">Từ đã đụng tới</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${mastered}</div>
            <div class="stat-label">Từ đã thuộc lòng</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${dueNow}</div>
            <div class="stat-label">Từ cần ôn ngay</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${quizAccuracy !== null ? quizAccuracy + "%" : "—"}</div>
            <div class="stat-label">Độ chính xác đố vui</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">🔥 ${streak}</div>
            <div class="stat-label">Chuỗi ngày học</div>
          </div>
        </div>

        <h3 class="section-title">Lộ trình cấp độ (kiểu bản đồ metro)</h3>
        <div class="level-metro">
          ${levelStats
            .map((ls, i) => {
              const pct = ls.total ? Math.round((ls.mastered / ls.total) * 100) : 0;
              return `
              <div class="level-station">
                <div class="level-station-dot" style="--pct:${pct}%">
                  <span>${ls.level}</span>
                </div>
                <div class="level-station-info">${ls.mastered}/${ls.total} từ · ${pct}%</div>
              </div>
              ${i < levelStats.length - 1 ? '<div class="level-station-track"></div>' : ""}
            `;
            })
            .join("")}
        </div>

        <h3 class="section-title">Bắt đầu ngay</h3>
        <div class="quick-launch-row">
          <button class="launch-card" data-nav="flashcards">
            <span class="launch-icon">🃏</span>
            <span>Ôn thẻ từ${dueNow > 0 ? ` (${dueNow} từ đến hạn)` : ""}</span>
          </button>
          <button class="launch-card" data-nav="quiz">
            <span class="launch-icon">🎲</span>
            <span>Đố vui nhanh</span>
          </button>
          <button class="launch-card" data-nav="matching">
            <span class="launch-icon">🧩</span>
            <span>Nối từ kéo thả</span>
          </button>
          <button class="launch-card" data-nav="speedtype">
            <span class="launch-icon">⚡</span>
            <span>Gõ nhanh</span>
          </button>
          <button class="launch-card" data-nav="dictee">
            <span class="launch-icon">🎧</span>
            <span>Dictée nghe chép</span>
          </button>
          <button class="launch-card" data-nav="dialogue">
            <span class="launch-icon">💬</span>
            <span>Hội thoại tình huống</span>
          </button>
          <button class="launch-card" data-nav="learned">
            <span class="launch-icon">📗</span>
            <span>Xem từ đã học</span>
          </button>
          <button class="launch-card" data-nav="conjugation">
            <span class="launch-icon">🔤</span>
            <span>Luyện chia động từ</span>
          </button>
          <button class="launch-card" data-nav="focus">
            <span class="launch-icon">⏱️</span>
            <span>Bắt đầu học tập trung</span>
          </button>
        </div>
      </div>
    `;

    container.querySelectorAll(".launch-card").forEach((btn) => {
      btn.addEventListener("click", () => navigateTo(btn.dataset.nav));
    });
    container.querySelector("#dash-smart-review").addEventListener("click", () => navigateTo("smart-review"));
  }

  async function checkLevelUp(currentLevel) {
    const settings = await Store.get("settings", {});
    const lastSeenLevel = settings.lastSeenLevel || 1;
    if (currentLevel > lastSeenLevel) {
      await Store.merge("settings", { lastSeenLevel: currentLevel });
      window.SoundFX.levelUp();
    }
  }

  // Áp dụng giao diện Sáng/Tối và cỡ chữ — dùng chung ở cả lúc khởi động app
  // lẫn khi người dùng đổi trong Cài đặt (áp dụng ngay, không cần tải lại).
  window.applyTheme = function (theme) {
    document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  };
  window.applyFontScale = function (scale) {
    document.body.style.zoom = (scale || 100) / 100;
  };

  document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("search-hint-btn").addEventListener("click", () => window.CommandPalette.open());
    const settings = await Store.get("settings", { soundEnabled: true, theme: "dark", fontScale: 100 });
    window.SoundFX.setEnabled(settings.soundEnabled !== false);
    window.applyTheme(settings.theme || "dark");
    window.applyFontScale(settings.fontScale || 100);
    buildSidebar();
    await navigateTo("dashboard");
    window.Onboarding.maybeShow();
  });
})();
