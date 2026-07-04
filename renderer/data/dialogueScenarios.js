// Kịch bản hội thoại phân nhánh — nội dung viết tay (không qua API) để đảm
// bảo tiếng Pháp tự nhiên và đúng ngữ pháp. Mỗi kịch bản là một tình huống
// thực tế thường gặp, người học chọn câu trả lời để dẫn dắt hội thoại.
window.DIALOGUE_SCENARIOS = [
  {
    slug: "cafe",
    title: "☕ Gọi món ở quán cà phê",
    level: "A1",
    startNode: "start",
    nodes: {
      start: {
        speaker: "Serveur",
        text: "Bonjour ! Qu'est-ce que je vous sers ?",
        translation: "Xin chào! Anh/chị dùng gì ạ?",
        choices: [
          { text: "Je voudrais un café, s'il vous plaît.", translation: "Tôi muốn một ly cà phê, làm ơn.", next: "coffee" },
          { text: "Un thé, s'il vous plaît.", translation: "Một tách trà, làm ơn.", next: "tea" },
          { text: "Qu'est-ce que vous recommandez ?", translation: "Anh/chị gợi ý gì cho tôi?", next: "recommend" },
        ],
      },
      coffee: {
        speaker: "Serveur",
        text: "Très bien, un café. Autre chose ?",
        translation: "Được rồi, một cà phê. Còn gì nữa không ạ?",
        choices: [
          { text: "Non merci, c'est tout.", translation: "Không, cảm ơn, vậy thôi.", next: "end_good" },
          { text: "Oui, un croissant aussi.", translation: "Vâng, thêm một cái croissant nữa.", next: "end_great" },
        ],
      },
      tea: {
        speaker: "Serveur",
        text: "Un thé, très bien. Vert ou noir ?",
        translation: "Một tách trà, được ạ. Trà xanh hay trà đen?",
        choices: [
          { text: "Vert, s'il vous plaît.", translation: "Trà xanh, làm ơn.", next: "end_good" },
          { text: "Noir, merci.", translation: "Trà đen, cảm ơn.", next: "end_good" },
        ],
      },
      recommend: {
        speaker: "Serveur",
        text: "Le café crème est très populaire ici.",
        translation: "Cà phê sữa ở đây rất được ưa chuộng.",
        choices: [
          { text: "D'accord, je le prends !", translation: "Được, tôi lấy món đó!", next: "end_great" },
          { text: "Non merci, un café normal.", translation: "Không, cảm ơn, cho tôi cà phê thường thôi.", next: "end_good" },
        ],
      },
      end_good: {
        speaker: "Serveur",
        text: "Très bien, ça arrive tout de suite !",
        translation: "Được rồi, sẽ có ngay ạ!",
        end: true,
        ending: "🎉 Bạn đã gọi món thành công!",
      },
      end_great: {
        speaker: "Serveur",
        text: "Excellent choix ! Ça arrive tout de suite.",
        translation: "Lựa chọn tuyệt vời! Sẽ có ngay ạ.",
        end: true,
        ending: "🌟 Rất tự nhiên — bạn còn gọi thêm đồ ăn nữa!",
      },
    },
  },
  {
    slug: "directions",
    title: "🧭 Hỏi đường",
    level: "A2",
    startNode: "start",
    nodes: {
      start: {
        speaker: "Bối cảnh",
        text: "Bạn cần tìm nhà ga. Bạn hỏi một người qua đường.",
        translation: "",
        choices: [
          { text: "Excusez-moi, où est la gare ?", translation: "Xin lỗi, nhà ga ở đâu ạ?", next: "directions" },
          { text: "Pardon, pouvez-vous m'aider ?", translation: "Xin lỗi, anh/chị giúp tôi được không?", next: "helpful" },
        ],
      },
      helpful: {
        speaker: "Passant",
        text: "Bien sûr, qu'est-ce que vous cherchez ?",
        translation: "Tất nhiên rồi, bạn đang tìm gì?",
        choices: [{ text: "La gare, s'il vous plaît.", translation: "Nhà ga, làm ơn.", next: "directions" }],
      },
      directions: {
        speaker: "Passant",
        text: "C'est tout droit, puis à gauche.",
        translation: "Đi thẳng, rồi rẽ trái.",
        choices: [
          { text: "Merci beaucoup !", translation: "Cảm ơn nhiều ạ!", next: "end_good" },
          { text: "C'est loin ?", translation: "Có xa không ạ?", next: "far" },
        ],
      },
      far: {
        speaker: "Passant",
        text: "Non, à cinq minutes à pied.",
        translation: "Không, đi bộ khoảng 5 phút thôi.",
        choices: [{ text: "Parfait, merci !", translation: "Tuyệt, cảm ơn!", next: "end_good" }],
      },
      end_good: {
        speaker: "Passant",
        text: "Je vous en prie ! Bonne journée.",
        translation: "Không có gì! Chúc bạn một ngày tốt lành.",
        end: true,
        ending: "🎉 Bạn đã hỏi đường thành công!",
      },
    },
  },
  {
    slug: "meeting",
    title: "👋 Làm quen với người mới",
    level: "A2",
    startNode: "start",
    nodes: {
      start: {
        speaker: "Claire",
        text: "Bonjour, je m'appelle Claire. Et vous ?",
        translation: "Xin chào, tôi tên là Claire. Còn bạn?",
        choices: [
          { text: "Je m'appelle Alex. Enchanté(e).", translation: "Tôi tên Alex. Rất vui được gặp.", next: "nice" },
          { text: "Salut ! Moi, c'est Alex.", translation: "Chào! Mình là Alex.", next: "casual" },
        ],
      },
      nice: {
        speaker: "Claire",
        text: "Enchantée ! Vous êtes d'où ?",
        translation: "Rất vui được biết bạn! Bạn đến từ đâu?",
        choices: [
          { text: "Je suis vietnamien(ne).", translation: "Tôi là người Việt Nam.", next: "end_great" },
          { text: "Je viens de loin !", translation: "Tôi đến từ rất xa!", next: "end_good" },
        ],
      },
      casual: {
        speaker: "Claire",
        text: "Sympa ! Tu fais quoi dans la vie ?",
        translation: "Hay đấy! Bạn làm nghề gì?",
        choices: [
          { text: "Je suis étudiant(e).", translation: "Mình là sinh viên.", next: "end_good" },
          { text: "Je travaille dans l'informatique.", translation: "Mình làm trong ngành công nghệ thông tin.", next: "end_great" },
        ],
      },
      end_good: {
        speaker: "Claire",
        text: "Super, ravie de discuter avec vous !",
        translation: "Tuyệt, rất vui được trò chuyện với bạn!",
        end: true,
        ending: "🎉 Bạn đã làm quen thành công!",
      },
      end_great: {
        speaker: "Claire",
        text: "Ah, c'est passionnant ! On devrait se revoir.",
        translation: "Ồ, thú vị đấy! Chúng ta nên gặp lại nhau.",
        end: true,
        ending: "🌟 Cuộc trò chuyện rất tự nhiên và cuốn hút!",
      },
    },
  },
];
