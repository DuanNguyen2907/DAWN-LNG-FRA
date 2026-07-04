// Nguồn ngoài: Wiktionnaire (từ vựng theo chủ đề, có phân trang) và Wikibooks
// French Course (bài học ngữ pháp viết theo hướng sư phạm, không phải tóm tắt
// bách khoa). Cả hai đều miễn phí, không cần API key, dữ liệu mở (CC-BY-SA).
window.ExternalSources = (function () {
  // ---- Wiktionnaire: lấy danh sách từ trong 1 chủ đề, hỗ trợ "tải thêm" qua cmcontinue ----
  async function fetchWiktionaryCategoryMembers(categoryTitle, cmcontinue) {
    const params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: `Catégorie:${categoryTitle}`,
      cmlimit: "20",
      cmtype: "page",
      format: "json",
      origin: "*",
    });
    if (cmcontinue) params.set("cmcontinue", cmcontinue);

    const res = await fetch(`https://fr.wiktionary.org/w/api.php?${params.toString()}`);
    if (!res.ok) throw new Error("Lỗi Wiktionnaire");
    const data = await res.json();
    const members = (data.query?.categorymembers || [])
      .map((m) => m.title)
      .filter((t) => !t.includes(":")); // loại bỏ trang phụ/thể loại con
    const nextContinue = data.continue?.cmcontinue || null;
    return { members, nextContinue };
  }

  // ---- Wikibooks: lấy toàn văn (plain text) một bài học tiếng Pháp ----
  async function fetchWikibooksLesson(pageTitle) {
    const params = new URLSearchParams({
      action: "query",
      prop: "extracts",
      explaintext: "true",
      titles: pageTitle,
      format: "json",
      origin: "*",
    });
    const res = await fetch(`https://en.wikibooks.org/w/api.php?${params.toString()}`);
    if (!res.ok) throw new Error("Lỗi Wikibooks");
    const data = await res.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return null;
    return page.extract || null;
  }

  // ---- Wikipedia tiếng Pháp: lấy toàn văn (plain text) đoạn mở đầu bài viết ----
  async function fetchWikipediaExtract(pageTitle) {
    const params = new URLSearchParams({
      action: "query",
      prop: "extracts",
      explaintext: "true",
      titles: pageTitle,
      format: "json",
      origin: "*",
    });
    const res = await fetch(`https://fr.wikipedia.org/w/api.php?${params.toString()}`);
    if (!res.ok) throw new Error("Lỗi Wikipedia");
    const data = await res.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return null;
    return page.extract || null;
  }

  return { fetchWiktionaryCategoryMembers, fetchWikibooksLesson, fetchWikipediaExtract };
})();
