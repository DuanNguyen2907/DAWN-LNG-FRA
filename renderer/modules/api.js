// Gọi API từ điển miễn phí (Free Dictionary API) để lấy phiên âm/âm thanh
// và dùng Web Speech API (có sẵn trong Chromium/Electron) để phát âm khi API không có audio.
window.DictAPI = (function () {
  const CACHE = {};
  let cachedFrenchVoice = null;
  let voicesReady = false;

  // Bug fix: trước đây chỉ set utter.lang = "fr-FR" mà không chọn giọng đọc cụ
  // thể. Nhiều máy không có giọng tiếng Pháp cài sẵn nên trình duyệt tự động
  // dùng giọng mặc định (thường là tiếng Anh) để đọc, gây ra phát âm sai/nghe
  // như tiếng Anh dù có gắn nhãn ngôn ngữ Pháp. Giờ chủ động tìm giọng fr-FR
  // thật trong danh sách giọng đọc của hệ thống trước khi đọc.
  function pickFrenchVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    // Ưu tiên giọng "fr-FR", sau đó tới bất kỳ giọng "fr-*" nào khác (fr-CA, fr-BE...)
    return (
      voices.find((v) => v.lang === "fr-FR") ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("fr")) ||
      null
    );
  }

  function ensureVoicesLoaded() {
    return new Promise((resolve) => {
      const existing = window.speechSynthesis.getVoices();
      if (existing && existing.length > 0) {
        voicesReady = true;
        resolve();
        return;
      }
      // Chrome/Electron tải danh sách giọng bất đồng bộ ở lần đầu
      window.speechSynthesis.onvoiceschanged = () => {
        voicesReady = true;
        resolve();
      };
      // Phòng khi sự kiện không bắn (một số môi trường), vẫn resolve sau 500ms
      setTimeout(resolve, 500);
    });
  }

  async function lookup(word) {
    const key = word.toLowerCase().trim();
    if (CACHE[key]) return CACHE[key];
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/fr/${encodeURIComponent(key)}`
      );
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      const audio =
        entry?.phonetics?.find((p) => p.audio)?.audio || null;
      const phonetic = entry?.phonetic || entry?.phonetics?.[0]?.text || null;
      const result = { audio, phonetic };
      CACHE[key] = result;
      return result;
    } catch (e) {
      const result = { audio: null, phonetic: null };
      CACHE[key] = result;
      return result;
    }
  }

  async function speak(text) {
    try {
      if (!voicesReady) await ensureVoicesLoaded();
      if (!cachedFrenchVoice) cachedFrenchVoice = pickFrenchVoice();

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "fr-FR";
      utter.rate = 0.9;
      if (cachedFrenchVoice) {
        utter.voice = cachedFrenchVoice;
      } else {
        // Không tìm thấy giọng tiếng Pháp nào trên máy — báo cho người dùng
        // biết lý do phát âm không chuẩn, thay vì đọc sai lặng lẽ.
        console.warn(
          "Không tìm thấy giọng đọc tiếng Pháp trên máy này. Hãy cài thêm gói giọng đọc tiếng Pháp trong Cài đặt hệ điều hành để phát âm chuẩn hơn."
        );
      }
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("TTS không khả dụng:", e);
    }
  }

  async function pronounce(word) {
    const { audio } = await lookup(word);
    if (audio) {
      const player = new Audio(audio.startsWith("http") ? audio : `https:${audio}`);
      player.play().catch(() => speak(word));
    } else {
      speak(word);
    }
  }

  function hasFrenchVoice() {
    return !!cachedFrenchVoice;
  }

  return { lookup, speak, pronounce, hasFrenchVoice, pickFrenchVoice, ensureVoicesLoaded };
})();
