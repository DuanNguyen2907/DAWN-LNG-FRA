// Dữ liệu bổ sung CHỈ để phục vụ bài tập hợp giống/mạo từ — không phải danh
// sách từ vựng chính (đã có ở vocabulary.js). Giống ngữ pháp (đực/cái) là sự
// thật cố định của từ, không phải nội dung dịch, nên khai báo trực tiếp ở
// đây tương tự cách bảng chia động từ bất quy tắc đã làm.
window.GENDERED_NOUNS = [
  { fr: "chat", vi: "con mèo", gender: "m" },
  { fr: "chien", vi: "con chó", gender: "m" },
  { fr: "table", vi: "cái bàn", gender: "f" },
  { fr: "maison", vi: "ngôi nhà", gender: "f" },
  { fr: "voiture", vi: "chiếc xe hơi", gender: "f" },
  { fr: "livre", vi: "quyển sách", gender: "m" },
  { fr: "fille", vi: "cô gái", gender: "f" },
  { fr: "garçon", vi: "cậu bé", gender: "m" },
  { fr: "ville", vi: "thành phố", gender: "f" },
  { fr: "pays", vi: "đất nước", gender: "m" },
  { fr: "fleur", vi: "bông hoa", gender: "f" },
  { fr: "arbre", vi: "cái cây", gender: "m" },
  { fr: "porte", vi: "cánh cửa", gender: "f" },
  { fr: "stylo", vi: "cây bút", gender: "m" },
  { fr: "chambre", vi: "phòng ngủ", gender: "f" },
  { fr: "café", vi: "quán cà phê", gender: "m" },
  { fr: "pomme", vi: "quả táo", gender: "f" },
  { fr: "film", vi: "bộ phim", gender: "m" },
];

// Tính từ: dạng gốc (đực số ít) + biến thể hợp giống/số. Đây là quy tắc ngữ
// pháp cố định (giống bảng chia động từ), không phải nội dung cần dịch.
window.AGREEMENT_ADJECTIVES = [
  { base: "grand", fem: "grande", vi: "to lớn / cao" },
  { base: "petit", fem: "petite", vi: "nhỏ" },
  { base: "joli", fem: "jolie", vi: "xinh đẹp" },
  { base: "intelligent", fem: "intelligente", vi: "thông minh" },
  { base: "content", fem: "contente", vi: "vui vẻ" },
  { base: "fatigué", fem: "fatiguée", vi: "mệt mỏi" },
  { base: "intéressant", fem: "intéressante", vi: "thú vị" },
  { base: "amusant", fem: "amusante", vi: "vui nhộn" },
];

// Mạo từ xác định/không xác định theo giống — dùng cho bài "chọn mạo từ đúng"
window.ARTICLE_RULES = {
  definite: { m: "le", f: "la" },
  indefinite: { m: "un", f: "une" },
};
