// Module "làm giàu" dữ liệu từ vựng: lấy nghĩa tiếng Việt (dịch máy), câu ví dụ
// thật (Tatoeba), phiên âm/audio (Free Dictionary API) — tất cả qua API bên
// ngoài, không khai báo tay. Kết quả được cache trong Store; người dùng có
// thể sửa tay nghĩa/ví dụ, phần đã sửa tay sẽ KHÔNG bị ghi đè bởi lần lấy
// API sau này.
window.Enrichment = (function () {
  const STORE_KEY = "vocabEnrichment";

  // ---- Hàng đợi giới hạn số request chạy song song, tránh spam API free-tier ----
  let activeCount = 0;
  const MAX_CONCURRENT = 3; // Tăng nhẹ từ 2 lên 3 để các game đỡ phải chờ giữa các câu hỏi
  const queue = [];

  function runQueue() {
    while (activeCount < MAX_CONCURRENT && queue.length > 0) {
      const { fn, resolve, reject } = queue.shift();
      activeCount += 1;
      fn()
        .then(resolve, reject)
        .finally(() => {
          activeCount -= 1;
          setTimeout(runQueue, 120); // giãn cách nhẹ giữa các lượt gọi
        });
    }
  }

  function enqueue(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      runQueue();
    });
  }

  // ---- Gọi API dịch (MyMemory, miễn phí, không cần key) ----
  async function translate(text, langpair = "fr|vi") {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
    );
    if (!res.ok) throw new Error("Lỗi dịch");
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || /MYMEMORY WARNING/i.test(translated)) throw new Error("Không dịch được");
    return translated;
  }

  // ---- Gọi Tatoeba để lấy câu ví dụ tiếng Pháp thật chứa từ này ----
  async function fetchExampleSentence(word) {
    const res = await fetch(
      `https://tatoeba.org/en/api_v0/search?from=fra&query=${encodeURIComponent(word)}&orphans=no&unapproved=no&sort=relevance`
    );
    if (!res.ok) throw new Error("Lỗi Tatoeba");
    const data = await res.json();
    const first = (data?.results || []).find((r) => r.text && r.text.length < 140);
    return first ? first.text : null;
  }

  async function fetchFresh(word) {
    const [dict, viRaw, exampleFr] = await Promise.all([
      window.DictAPI.lookup(word).catch(() => ({ phonetic: null, audio: null })),
      translate(word, "fr|vi").catch(() => null),
      fetchExampleSentence(word).catch(() => null),
    ]);

    let exampleVi = null;
    if (exampleFr) {
      exampleVi = await translate(exampleFr, "fr|vi").catch(() => null);
    }

    return {
      vi: viRaw,
      viSource: "api",
      viError: !viRaw,
      exampleFr: exampleFr,
      exampleVi: exampleVi,
      exampleSource: "api",
      exampleError: !exampleFr,
      phonetic: dict.phonetic || null,
      audio: dict.audio || null,
      fetchedAt: Date.now(),
    };
  }

  async function getStore() {
    return window.Store.get(STORE_KEY, {});
  }

  // Trả về dữ liệu làm giàu cho 1 từ. force=true để bỏ qua cache API (nhưng
  // vẫn giữ nguyên phần người dùng đã tự sửa tay).
  async function getForWord(word, { force = false } = {}) {
    const store = await getStore();
    const cached = store[word.id];

    const hasUsableCache =
      cached && cached.vi && cached.exampleFr !== undefined && !force;
    if (hasUsableCache) return cached;

    let fresh;
    try {
      fresh = await enqueue(() => fetchFresh(word.fr));
    } catch (e) {
      fresh = { vi: null, viError: true, exampleFr: null, exampleError: true };
    }

    // Không ghi đè phần người dùng đã tự sửa tay
    const merged = { ...fresh };
    if (cached && cached.viSource === "user") {
      merged.vi = cached.vi;
      merged.viSource = "user";
      merged.viError = false;
    }
    if (cached && cached.exampleSource === "user") {
      merged.exampleFr = cached.exampleFr;
      merged.exampleVi = cached.exampleVi;
      merged.exampleSource = "user";
      merged.exampleError = false;
    }

    await window.Store.mergeNested(STORE_KEY, word.id, merged);
    return merged;
  }

  async function setUserMeaning(wordId, vi) {
    await window.Store.mergeNested(STORE_KEY, wordId, {
      vi,
      viSource: "user",
      viError: false,
    });
  }

  async function setUserExample(wordId, exampleFr, exampleVi) {
    await window.Store.mergeNested(STORE_KEY, wordId, {
      exampleFr,
      exampleVi,
      exampleSource: "user",
      exampleError: false,
    });
  }

  // Dịch đoạn văn dài (vd. giải thích ngữ pháp từ Wikipedia) bằng cách chia
  // nhỏ theo câu để không vượt giới hạn ký tự của API dịch miễn phí.
  function splitIntoChunks(text, maxLen) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if ((current + " " + s).trim().length > maxLen) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current += (current ? " " : "") + s;
      }
    }
    if (current) chunks.push(current.trim());
    return chunks;
  }

  async function translateLong(text, langpair = "fr|vi") {
    if (!text) return null;
    const chunks = splitIntoChunks(text, 450);
    const results = [];
    for (const chunk of chunks) {
      try {
        const t = await enqueue(() => translate(chunk, langpair));
        results.push(t);
      } catch (e) {
        results.push("");
      }
    }
    return results.filter(Boolean).join(" ");
  }

  async function refetch(word) {
    return getForWord(word, { force: true });
  }

  // ---- Minh hoạ hình ảnh (Openverse — kho ảnh CC/miễn phí, không cần key) ----
  const IMAGE_STORE_KEY = "vocabImages";

  async function fetchOpenverseImage(query) {
    const res = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1`);
    if (!res.ok) throw new Error("Lỗi Openverse");
    const data = await res.json();
    const first = data.results && data.results[0];
    if (!first) return null;
    return {
      url: first.thumbnail || first.url,
      creator: first.creator || "Không rõ tác giả",
      license: (first.license || "").toUpperCase(),
      sourceUrl: first.foreign_landing_url || first.url,
    };
  }

  async function getImage(word) {
    const store = await window.Store.get(IMAGE_STORE_KEY, {});
    const cached = store[word.id];
    if (cached !== undefined) return cached;

    let result = null;
    try {
      // Ảnh kho lưu trữ (Openverse) chủ yếu gắn tag tiếng Anh, nên dịch từ
      // tiếng Pháp sang tiếng Anh trước để tìm ảnh liên quan chuẩn hơn.
      const englishQuery = await enqueue(() => translate(word.fr, "fr|en")).catch(() => null);
      result = await enqueue(() => fetchOpenverseImage(englishQuery || word.fr));
    } catch (e) {
      result = null;
    }
    await window.Store.mergeNested(IMAGE_STORE_KEY, word.id, result);
    return result;
  }

  return { getForWord, setUserMeaning, setUserExample, refetch, translateLong, getImage };
})();
