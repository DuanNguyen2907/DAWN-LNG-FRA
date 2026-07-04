// Danh sách ĐỘNG TỪ để luyện chia (chỉ tên động từ + cấp độ + nhóm chia +
// trợ động từ dùng cho passé composé sau này). Bản thân CÁCH CHIA không nằm ở
// đây — được TÍNH TOÁN bằng quy tắc ngữ pháp trong conjugation.js, để đảm bảo
// luôn đúng 100% khi chấm điểm (không phụ thuộc API bên thứ ba chưa kiểm chứng được).
window.CONJUGATION_VERBS = [
  { infinitive: "parler", level: "A1", group: "regular-er" },
  { infinitive: "aimer", level: "A1", group: "regular-er" },
  { infinitive: "manger", level: "A1", group: "regular-er-ger" },
  { infinitive: "regarder", level: "A1", group: "regular-er" },
  { infinitive: "être", level: "A1", group: "irregular" },
  { infinitive: "avoir", level: "A1", group: "irregular" },
  { infinitive: "aller", level: "A1", group: "irregular" },
  { infinitive: "faire", level: "A1", group: "irregular" },

  { infinitive: "finir", level: "A2", group: "regular-ir" },
  { infinitive: "choisir", level: "A2", group: "regular-ir" },
  { infinitive: "vendre", level: "A2", group: "regular-re" },
  { infinitive: "attendre", level: "A2", group: "regular-re" },
  { infinitive: "pouvoir", level: "A2", group: "irregular" },
  { infinitive: "vouloir", level: "A2", group: "irregular" },
  { infinitive: "devoir", level: "A2", group: "irregular" },
  { infinitive: "venir", level: "A2", group: "irregular" },
  { infinitive: "voir", level: "A2", group: "irregular" },
  { infinitive: "savoir", level: "A2", group: "irregular" },

  { infinitive: "prendre", level: "B1", group: "irregular" },
  { infinitive: "dire", level: "B1", group: "irregular" },
  { infinitive: "mettre", level: "B1", group: "irregular" },
  { infinitive: "partir", level: "B1", group: "irregular" },
  { infinitive: "sortir", level: "B1", group: "irregular" },
  { infinitive: "connaître", level: "B1", group: "irregular" },

  { infinitive: "écrire", level: "B2", group: "irregular" },
  { infinitive: "lire", level: "B2", group: "irregular" },
  { infinitive: "boire", level: "B2", group: "irregular" },
  { infinitive: "croire", level: "B2", group: "irregular" },
];
