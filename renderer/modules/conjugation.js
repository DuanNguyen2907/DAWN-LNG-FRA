// Bộ máy chia động từ tiếng Pháp theo QUY TẮC NGỮ PHÁP (không phải API dịch)
// — vì đây là bài tập cần chấm đúng/sai chính xác 100%, và không có API chia
// động từ miễn phí nào đủ tin cậy để kiểm chứng được trong dự án này.
// Các động từ bất quy tắc dùng bảng chia thì hiện tại (sự thật ngữ pháp cố
// định, không phải "nghĩa dịch" nên không cần lấy qua API).
window.ConjugationEngine = (function () {
  const PRONOUNS = [
    { key: "je", label: "je" },
    { key: "tu", label: "tu" },
    { key: "il", label: "il / elle" },
    { key: "nous", label: "nous" },
    { key: "vous", label: "vous" },
    { key: "ils", label: "ils / elles" },
  ];

  const TENSES = [
    { key: "present", label: "Hiện tại (présent)" },
    { key: "imparfait", label: "Quá khứ chưa hoàn thành (imparfait)" },
    { key: "futur", label: "Tương lai đơn (futur simple)" },
  ];

  // Thì hiện tại của các động từ bất quy tắc thường dùng nhất (dữ liệu ngữ
  // pháp cố định, giống bảng cửu chương — không phải nội dung cần dịch).
  const IRREGULAR_PRESENT = {
    "être": ["suis", "es", "est", "sommes", "êtes", "sont"],
    "avoir": ["ai", "as", "a", "avons", "avez", "ont"],
    "aller": ["vais", "vas", "va", "allons", "allez", "vont"],
    "faire": ["fais", "fais", "fait", "faisons", "faites", "font"],
    "pouvoir": ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"],
    "vouloir": ["veux", "veux", "veut", "voulons", "voulez", "veulent"],
    "devoir": ["dois", "dois", "doit", "devons", "devez", "doivent"],
    "venir": ["viens", "viens", "vient", "venons", "venez", "viennent"],
    "voir": ["vois", "vois", "voit", "voyons", "voyez", "voient"],
    "savoir": ["sais", "sais", "sait", "savons", "savez", "savent"],
    "prendre": ["prends", "prends", "prend", "prenons", "prenez", "prennent"],
    "dire": ["dis", "dis", "dit", "disons", "dites", "disent"],
    "mettre": ["mets", "mets", "met", "mettons", "mettez", "mettent"],
    "partir": ["pars", "pars", "part", "partons", "partez", "partent"],
    "sortir": ["sors", "sors", "sort", "sortons", "sortez", "sortent"],
    "connaître": ["connais", "connais", "connaît", "connaissons", "connaissez", "connaissent"],
    "écrire": ["écris", "écris", "écrit", "écrivons", "écrivez", "écrivent"],
    "lire": ["lis", "lis", "lit", "lisons", "lisez", "lisent"],
    "boire": ["bois", "bois", "boit", "buvons", "buvez", "boivent"],
    "croire": ["crois", "crois", "croit", "croyons", "croyez", "croient"],
  };

  // Gốc của thì tương lai bất quy tắc (những động từ không dùng nguyên mẫu làm gốc)
  const IRREGULAR_FUTUR_STEM = {
    "être": "ser",
    "avoir": "aur",
    "aller": "ir",
    "faire": "fer",
    "pouvoir": "pourr",
    "vouloir": "voudr",
    "devoir": "devr",
    "venir": "viendr",
    "voir": "verr",
    "savoir": "saur",
  };

  // Gốc imparfait đặc biệt (être không theo quy tắc "bỏ -ons")
  const IMPARFAIT_STEM_OVERRIDE = { "être": "ét" };

  function getPresentForms(verb) {
    if (IRREGULAR_PRESENT[verb.infinitive]) return IRREGULAR_PRESENT[verb.infinitive];
    const inf = verb.infinitive;
    if (verb.group === "regular-er" || verb.group === "regular-er-ger") {
      const stem = inf.slice(0, -2);
      const forms = [stem + "e", stem + "es", stem + "e", stem + "ons", stem + "ez", stem + "ent"];
      if (verb.group === "regular-er-ger") forms[3] = stem + "eons"; // ex: mange + ons -> mangeons
      return forms;
    }
    if (verb.group === "regular-ir") {
      const stem = inf.slice(0, -2);
      return [stem + "is", stem + "is", stem + "it", stem + "issons", stem + "issez", stem + "issent"];
    }
    if (verb.group === "regular-re") {
      const stem = inf.slice(0, -2);
      return [stem + "s", stem + "s", stem, stem + "ons", stem + "ez", stem + "ent"];
    }
    return null;
  }

  function getImparfaitForms(verb) {
    if (verb.group === "regular-er-ger") {
      const baseStem = verb.infinitive.slice(0, -2); // "mang"
      return [baseStem + "eais", baseStem + "eais", baseStem + "eait", baseStem + "ions", baseStem + "iez", baseStem + "eaient"];
    }
    const present = getPresentForms(verb);
    if (!present) return null;
    const nousForm = present[3];
    const stem = IMPARFAIT_STEM_OVERRIDE[verb.infinitive] || nousForm.replace(/ons$/, "");
    return [stem + "ais", stem + "ais", stem + "ait", stem + "ions", stem + "iez", stem + "aient"];
  }

  function getFuturForms(verb) {
    let stem = IRREGULAR_FUTUR_STEM[verb.infinitive];
    if (!stem) {
      stem = verb.infinitive.endsWith("e") ? verb.infinitive.slice(0, -1) : verb.infinitive;
    }
    return [stem + "ai", stem + "as", stem + "a", stem + "ons", stem + "ez", stem + "ont"];
  }

  function getForms(verb, tenseKey) {
    if (tenseKey === "present") return getPresentForms(verb);
    if (tenseKey === "imparfait") return getImparfaitForms(verb);
    if (tenseKey === "futur") return getFuturForms(verb);
    return null;
  }

  // Ghép đại từ + động từ, xử lý nối âm je -> j' trước nguyên âm/h câm
  function formatWithPronoun(pronounKey, form) {
    if (pronounKey === "je" && /^[aeiouhéèêàâîïôùûAEIOUH]/.test(form)) {
      return "j'" + form;
    }
    const label = PRONOUNS.find((p) => p.key === pronounKey).label;
    return `${label} ${form}`;
  }

  function normalizeAnswer(text) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  }

  return { PRONOUNS, TENSES, getForms, formatWithPronoun, normalizeAnswer };
})();
