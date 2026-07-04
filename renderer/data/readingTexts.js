// Danh sách bài đọc — chỉ là KHUNG (tiêu đề bài Wikipedia + cấp độ ước
// lượng). Nội dung thật lấy động qua Wikipedia REST/API (văn xuôi bách khoa,
// không dùng thơ/văn vần để tránh tái tạo lại tác phẩm nghệ thuật dưới mọi
// hình thức). Cấp độ chỉ là ước lượng theo độ quen thuộc chủ đề, không phải
// phân loại CEFR chính thức.
window.READING_TEXTS = [
  { slug: "chat", title: "Le chat (Con mèo)", level: "A2", pageTitle: "Chat" },
  { slug: "croissant", title: "Le croissant (Bánh croissant)", level: "A2", pageTitle: "Croissant (viennoiserie)" },
  { slug: "tour-eiffel", title: "La tour Eiffel", level: "A2", pageTitle: "Tour Eiffel" },
  { slug: "paris", title: "Paris", level: "B1", pageTitle: "Paris" },
  { slug: "fromage", title: "Le fromage (Phô mai Pháp)", level: "B1", pageTitle: "Fromage" },
  { slug: "cafe-boisson", title: "Le café (Cà phê)", level: "B1", pageTitle: "Café" },
  { slug: "impressionnisme", title: "L'impressionnisme", level: "B2", pageTitle: "Impressionnisme" },
  { slug: "la-fontaine-bio", title: "Jean de La Fontaine (tiểu sử)", level: "B2", pageTitle: "Jean de La Fontaine" },
];
