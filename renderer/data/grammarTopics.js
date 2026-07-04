// Nội dung Ngữ pháp — VIẾT TRỰC TIẾP (không lấy qua API nữa).
// Lý do đổi: bản trước lấy tóm tắt từ Wikipedia tiếng Pháp, nhưng nội dung
// mang tính bách khoa/hàn lâm, không có ví dụ thực hành, không phù hợp người
// học. Nội dung dưới đây được viết theo hướng sư phạm: giải thích ngắn gọn +
// quy tắc cụ thể + ví dụ + mẹo ghi nhớ. wikiTitle (nếu có) chỉ dùng làm link
// "đọc thêm", không fetch nội dung từ đó nữa.
window.GRAMMAR_TOPICS = [
  {
    slug: "articles", label: "Mạo từ (le, la, un, une...)", level: "A1", exerciseType: null,
    wikiTitle: "Déterminants et articles en français",
    intro: "Danh từ tiếng Pháp luôn đi kèm mạo từ, và mạo từ phải hợp giống (đực/cái) và hợp số (ít/nhiều) với danh từ.",
    rules: [
      "Mạo từ xác định (the): le (giống đực), la (giống cái), l' (trước nguyên âm/h câm), les (số nhiều).",
      "Mạo từ không xác định (a/an/some): un (giống đực), une (giống cái), des (số nhiều).",
      "le/la rút gọn thành l' trước từ bắt đầu bằng nguyên âm hoặc h câm: l'ami, l'école, l'homme.",
    ],
    examples: [
      { fr: "le livre", vi: "quyển sách (giống đực, xác định)" },
      { fr: "une pomme", vi: "một quả táo (giống cái, không xác định)" },
      { fr: "les enfants", vi: "những đứa trẻ (số nhiều, xác định)" },
    ],
    tip: "Không có quy tắc chắc chắn để đoán giống chỉ từ nghĩa — cách chắc ăn nhất là học từ mới CÙNG với mạo từ của nó, ví dụ học 'la maison' chứ không chỉ 'maison'.",
  },
  {
    slug: "genre", label: "Giống của danh từ (masculin/féminin)", level: "A1", exerciseType: null,
    wikiTitle: "Morphologie du nom en français",
    intro: "Mỗi danh từ tiếng Pháp có giống cố định: masculin (đực) hoặc féminin (cái) — ảnh hưởng tới mạo từ và tính từ đi kèm.",
    rules: [
      "Không có quy tắc tuyệt đối, nhưng có xu hướng: từ tận cùng -e thường giống cái (la table), tận cùng phụ âm thường giống đực (le stylo) — có rất nhiều ngoại lệ (le problème, la main).",
      "Danh từ chỉ người thường theo giới tính thật: le père/la mère, l'acteur/l'actrice.",
      "Đuôi gợi ý giống cái: -tion, -sion, -té, -ette (la nation, la beauté). Đuôi gợi ý giống đực: -age, -isme, -ment (le voyage, le mouvement) — trừ ngoại lệ như 'la page'.",
    ],
    examples: [
      { fr: "la voiture", vi: "chiếc xe hơi (giống cái)" },
      { fr: "le téléphone", vi: "điện thoại (giống đực)" },
      { fr: "la beauté", vi: "vẻ đẹp (đuôi -té → giống cái)" },
    ],
    tip: "Học từ vựng kèm mạo từ ngay từ đầu chắc ăn hơn nhiều so với cố nhớ quy tắc, vì quy tắc có quá nhiều ngoại lệ.",
  },
  {
    slug: "pluriel", label: "Số nhiều của danh từ", level: "A1", exerciseType: null,
    wikiTitle: null,
    intro: "Phần lớn danh từ tiếng Pháp thêm -s để thành số nhiều, nhưng có nhiều trường hợp đặc biệt cần nhớ.",
    rules: [
      "Quy tắc chung: thêm -s (le livre → les livres).",
      "Từ tận cùng -s, -x, -z: giữ nguyên, không đổi (le prix → les prix).",
      "Từ tận cùng -eau, -eu: thêm -x (le bateau → les bateaux, le jeu → les jeux).",
      "Từ tận cùng -al: đổi thành -aux (le cheval → les chevaux) — trừ vài ngoại lệ như le bal → les bals.",
    ],
    examples: [
      { fr: "un animal → des animaux", vi: "một con vật → những con vật" },
      { fr: "un chapeau → des chapeaux", vi: "một chiếc mũ → những chiếc mũ" },
      { fr: "un pays → des pays", vi: "một đất nước → những đất nước (không đổi)" },
    ],
    tip: "Chữ -s số nhiều thường CÂM khi nói — bạn nhận biết số nhiều chủ yếu qua mạo từ (le/un → les/des), không phải qua âm thanh.",
  },
  {
    slug: "pronom-personnel", label: "Đại từ nhân xưng chủ ngữ (je, tu, il...)", level: "A1", exerciseType: "present",
    wikiTitle: "Morphologie du pronom personnel en français",
    intro: "Đại từ chủ ngữ đứng trước động từ, cho biết ai đang thực hiện hành động.",
    rules: [
      "je (tôi), tu (bạn - thân mật), il/elle (anh ấy/cô ấy), nous (chúng tôi), vous (bạn - lịch sự hoặc số nhiều), ils/elles (họ).",
      "'tu' dùng với bạn bè, người thân, trẻ em. 'vous' dùng khi lịch sự, trang trọng, hoặc nói với nhiều người.",
      "'on' là đại từ không trang trọng, dùng thay 'nous' trong văn nói: 'On va au cinéma' = 'Chúng ta đi xem phim'.",
    ],
    examples: [
      { fr: "Je parle français.", vi: "Tôi nói tiếng Pháp." },
      { fr: "Vous êtes très gentil.", vi: "Anh/Chị rất tốt bụng. (lịch sự)" },
      { fr: "On mange ensemble ?", vi: "Chúng ta ăn cùng nhau nhé? (văn nói)" },
    ],
    tip: "'il'/'elle' dùng cho cả đồ vật theo giống ngữ pháp: 'la voiture, elle est belle' (chiếc xe, nó đẹp) — không chỉ dùng cho người.",
  },
  {
    slug: "nombres", label: "Số đếm trong tiếng Pháp", level: "A1", exerciseType: null,
    wikiTitle: null,
    intro: "Số đếm tiếng Pháp có vài quy tắc đặc biệt cần chú ý, nhất là từ 70 trở lên.",
    rules: [
      "0-16 mỗi số có tên riêng: zéro, un, deux, trois... quinze, seize.",
      "17-19: dix + số (dix-sept=17, dix-huit=18, dix-neuf=19).",
      "70 = soixante-dix (60+10), 80 = quatre-vingts (4×20), 90 = quatre-vingt-dix (4×20+10) — điểm khó nhất khi mới học!",
      "100 = cent, 1000 = mille.",
    ],
    examples: [
      { fr: "soixante-quinze", vi: "75 (60+15)" },
      { fr: "quatre-vingt-un", vi: "81 (4×20+1)" },
      { fr: "quatre-vingt-dix-neuf", vi: "99 (4×20+10+9)" },
    ],
    tip: "Cứ nghĩ 'quatre-vingt' = 4×20 = 80 như một phép tính, rồi cộng thêm phần lẻ phía sau.",
  },
  {
    slug: "adjectif-accord", label: "Tính từ - hợp giống, hợp số", level: "A2", exerciseType: null,
    wikiTitle: "Morphologie de l'adjectif en français",
    intro: "Tính từ tiếng Pháp phải hợp giống và hợp số với danh từ mà nó bổ nghĩa.",
    rules: [
      "Giống cái: thường thêm -e vào tính từ giống đực (grand → grande). Nếu đã tận cùng -e thì giữ nguyên (jeune → jeune).",
      "Số nhiều: thêm -s (grand → grands, grande → grandes).",
      "Một số tính từ đổi dạng đặc biệt: beau→belle, nouveau→nouvelle, blanc→blanche.",
    ],
    examples: [
      { fr: "un grand homme", vi: "một người đàn ông cao lớn" },
      { fr: "une grande femme", vi: "một người phụ nữ cao lớn" },
      { fr: "de belles fleurs", vi: "những bông hoa đẹp" },
    ],
    tip: "Một số tính từ ngắn, thông dụng đứng TRƯỚC danh từ thay vì sau: beau, bon, grand, petit, jeune, vieux, joli — 'une belle maison', không phải 'une maison belle'.",
  },
  {
    slug: "position-adjectif", label: "Vị trí tính từ trong câu", level: "A2", exerciseType: null,
    wikiTitle: null,
    intro: "Khác với tiếng Việt, đa số tính từ tiếng Pháp đứng SAU danh từ — nhưng có một nhóm ngoại lệ quan trọng.",
    rules: [
      "Quy tắc chung: danh từ + tính từ ('un livre intéressant' = một quyển sách thú vị).",
      "Nhóm tính từ ngắn, thông dụng đứng TRƯỚC danh từ (mẹo nhớ BAGS = Beauté-Âge-Grandeur-bon/mauvais): beau, joli, grand, petit, jeune, vieux, bon, mauvais, nouveau.",
      "Một số tính từ đổi nghĩa tuỳ vị trí: 'un ancien professeur' (một cựu giáo viên) khác 'un professeur ancien' (một giáo viên già/cổ xưa).",
    ],
    examples: [
      { fr: "une voiture rouge", vi: "một chiếc xe màu đỏ (sau danh từ)" },
      { fr: "un petit chat", vi: "một con mèo nhỏ (trước danh từ)" },
      { fr: "mon ancienne école", vi: "ngôi trường cũ của tôi (trước = 'trước đây')" },
    ],
  },
  {
    slug: "prepositions-lieu", label: "Giới từ chỉ nơi chốn (à, en, au...)", level: "A2", exerciseType: null,
    wikiTitle: null,
    intro: "Giới từ chỉ nơi chốn thay đổi tuỳ loại địa danh: thành phố, hay quốc gia giống đực/cái/số nhiều.",
    rules: [
      "à + thành phố: à Paris, à Hanoï.",
      "en + quốc gia giống cái (đa số quốc gia tận cùng -e): en France, en Chine.",
      "au + quốc gia giống đực: au Vietnam, au Japon.",
      "aux + quốc gia số nhiều: aux États-Unis, aux Pays-Bas.",
      "dans/sur/sous cho không gian cụ thể: dans la maison, sur la table, sous le lit.",
    ],
    examples: [
      { fr: "Je vis en France.", vi: "Tôi sống ở Pháp." },
      { fr: "Il va au Vietnam.", vi: "Anh ấy đi Việt Nam." },
      { fr: "Le chat est sous la table.", vi: "Con mèo ở dưới bàn." },
    ],
    tip: "Mẹo nhanh: quốc gia tận cùng -e (trừ vài ngoại lệ như 'le Mexique') thường giống cái → dùng 'en'; còn lại dùng 'au'.",
  },
  {
    slug: "passe-compose", label: "Passé composé - cách hình thành", level: "A2", exerciseType: null,
    wikiTitle: "Passé en français",
    intro: "Passé composé diễn tả một hành động đã xảy ra và hoàn thành trong quá khứ. Cấu trúc: trợ động từ (avoir/être) chia ở hiện tại + quá khứ phân từ.",
    rules: [
      "Đa số động từ dùng trợ động từ AVOIR: j'ai mangé, tu as fini, il a pris.",
      "Khoảng 17 động từ chuyển động/trạng thái (và động từ phản thân) dùng ÊTRE: aller, venir, partir, arriver, entrer, sortir, monter, descendre, naître, mourir, rester, tomber... Ví dụ: je suis allé(e).",
      "Với động từ dùng ÊTRE, quá khứ phân từ phải hợp giống/số với chủ ngữ: il est allé / elle est allée / ils sont allés.",
      "Quá khứ phân từ: -er→-é (mangé), -ir→-i (fini), -re→-u (vendu) — nhiều động từ bất quy tắc: fait, pris, dit, mis, été, eu, vu.",
    ],
    examples: [
      { fr: "J'ai mangé une pomme.", vi: "Tôi đã ăn một quả táo. (avoir)" },
      { fr: "Elle est partie tôt.", vi: "Cô ấy đã đi sớm. (être, hợp giống)" },
      { fr: "Nous avons fini le travail.", vi: "Chúng tôi đã hoàn thành công việc." },
    ],
    tip: "Chưa chắc động từ nào dùng être? Tra cứu câu thần chú 'DR & MRS VANDERTRAMP' (viết tắt các động từ dùng être) để học thuộc dễ hơn.",
  },
  {
    slug: "questions", label: "Cách đặt câu hỏi", level: "A2", exerciseType: null,
    wikiTitle: null,
    intro: "Tiếng Pháp có 3 cách đặt câu hỏi, từ thân mật đến trang trọng.",
    rules: [
      "Cách 1 (thân mật, văn nói): giữ nguyên trật tự câu, lên giọng cuối câu: 'Tu viens ?'",
      "Cách 2 (trung tính, thông dụng nhất): thêm 'Est-ce que' trước câu: 'Est-ce que tu viens ?'",
      "Cách 3 (trang trọng, đảo ngữ): đảo động từ và chủ ngữ, nối bằng gạch ngang: 'Viens-tu ?'",
      "Từ để hỏi: qui (ai), que/quoi (gì), où (đâu), quand (khi nào), comment (thế nào), pourquoi (tại sao), combien (bao nhiêu).",
    ],
    examples: [
      { fr: "Où habites-tu ?", vi: "Bạn sống ở đâu?" },
      { fr: "Est-ce que vous parlez anglais ?", vi: "Bạn có nói tiếng Anh không?" },
      { fr: "Pourquoi tu pleures ?", vi: "Sao bạn khóc vậy? (văn nói)" },
    ],
  },
  {
    slug: "negation", label: "Câu phủ định (ne...pas...)", level: "A2", exerciseType: "negation",
    wikiTitle: "Négation en français",
    intro: "Phủ định trong tiếng Pháp dùng cấu trúc 'ne...pas' bao quanh động từ, cùng nhiều biến thể diễn đạt sắc thái khác nhau.",
    rules: [
      "Cấu trúc cơ bản: chủ ngữ + ne + động từ + pas. Ví dụ: 'Je ne mange pas.'",
      "'ne' rút gọn thành 'n'' trước nguyên âm/h câm: 'Je n'aime pas.'",
      "Biến thể khác: ne...jamais (không bao giờ), ne...plus (không...nữa), ne...rien (không gì), ne...personne (không ai).",
      "Trong văn nói thân mật, người Pháp hay bỏ 'ne': 'Je sais pas' thay vì 'Je ne sais pas' — khi viết vẫn nên giữ đầy đủ.",
    ],
    examples: [
      { fr: "Il ne travaille pas aujourd'hui.", vi: "Hôm nay anh ấy không làm việc." },
      { fr: "Je ne mange jamais de viande.", vi: "Tôi không bao giờ ăn thịt." },
      { fr: "Elle n'a rien dit.", vi: "Cô ấy đã không nói gì." },
    ],
  },
  {
    slug: "imparfait-vs-passe-compose", label: "Imparfait vs Passé composé", level: "B1", exerciseType: "imparfait",
    wikiTitle: null,
    intro: "Đây là điểm gây nhầm lẫn nhất khi học thì quá khứ tiếng Pháp: cả hai đều là 'quá khứ' nhưng dùng cho mục đích khác nhau.",
    rules: [
      "PASSÉ COMPOSÉ: hành động/sự kiện có điểm bắt đầu-kết thúc rõ ràng, xảy ra một lần. Ví dụ: 'Hier, je suis allé au cinéma.'",
      "IMPARFAIT: mô tả bối cảnh, thói quen lặp lại, hoặc trạng thái kéo dài không rõ điểm kết thúc. Ví dụ: 'Quand j'étais petit, j'allais à l'école à pied.'",
      "Thường dùng CẢ HAI trong cùng một câu chuyện: Imparfait để mô tả bối cảnh, Passé composé để kể hành động chính xen vào. Ví dụ: 'Il pleuvait quand je suis sorti.'",
    ],
    examples: [
      { fr: "Je regardais la télé quand le téléphone a sonné.", vi: "Tôi đang xem TV thì điện thoại reo." },
      { fr: "Tous les étés, nous allions à la plage.", vi: "Mỗi mùa hè, chúng tôi thường đi biển. (thói quen)" },
      { fr: "Hier soir, nous sommes allés au restaurant.", vi: "Tối qua chúng tôi đã đi nhà hàng. (sự việc một lần)" },
    ],
    tip: "Mẹo nhớ: Imparfait = cái PHÔNG NỀN đang diễn ra, Passé composé = hành động CHÍNH xen vào giữa phông nền đó.",
  },
  {
    slug: "futur", label: "Thì tương lai (futur simple)", level: "B1", exerciseType: "futur",
    wikiTitle: "Futur en français",
    intro: "Futur simple diễn tả một hành động sẽ xảy ra trong tương lai, tương đương 'sẽ' trong tiếng Việt.",
    rules: [
      "Động từ đều (-er, -ir): gốc = chính nguyên mẫu, thêm đuôi -ai, -as, -a, -ons, -ez, -ont.",
      "Động từ -re: bỏ chữ 'e' cuối rồi mới thêm đuôi (vendre → vendr- → je vendrai).",
      "Nhiều động từ có gốc bất quy tắc (đuôi vẫn giữ nguyên): être→ser-, avoir→aur-, aller→ir-, faire→fer-, pouvoir→pourr-, vouloir→voudr-, venir→viendr-.",
    ],
    examples: [
      { fr: "Demain, je travaillerai.", vi: "Ngày mai tôi sẽ làm việc." },
      { fr: "Elle sera médecin.", vi: "Cô ấy sẽ là bác sĩ. (être bất quy tắc)" },
      { fr: "Nous irons en France l'année prochaine.", vi: "Năm sau chúng tôi sẽ đi Pháp. (aller bất quy tắc)" },
    ],
  },
  {
    slug: "pronoms-complements", label: "Đại từ bổ ngữ (le, la, lui, leur...)", level: "B1", exerciseType: null,
    wikiTitle: null,
    intro: "Đại từ bổ ngữ thay thế danh từ đã nhắc trước đó để tránh lặp từ, và đứng TRƯỚC động từ (khác trật tự tiếng Việt/Anh).",
    rules: [
      "Bổ ngữ trực tiếp (COD - thay người/vật không có giới từ): me, te, le/la, nous, vous, les.",
      "Bổ ngữ gián tiếp (COI - thay người có giới từ 'à'): me, te, lui, nous, vous, leur.",
      "Vị trí: đại từ đứng ngay TRƯỚC động từ chia: 'Je le vois' (Tôi thấy nó/anh ấy) — không phải 'Je vois le'.",
    ],
    examples: [
      { fr: "Tu vois Marie ? — Oui, je la vois.", vi: "Bạn thấy Marie không? — Có, tôi thấy cô ấy." },
      { fr: "Il parle à ses parents. → Il leur parle.", vi: "Anh ấy nói với bố mẹ. → Anh ấy nói với họ." },
      { fr: "Je te comprends.", vi: "Tôi hiểu bạn." },
    ],
  },
  {
    slug: "comparatif-superlatif", label: "So sánh hơn/kém/nhất", level: "B1", exerciseType: null,
    wikiTitle: null,
    intro: "So sánh hơn/kém/bằng trong tiếng Pháp dùng plus/moins/aussi kết hợp với 'que'.",
    rules: [
      "So sánh hơn: plus + tính từ + que ('Il est plus grand que moi' = Anh ấy cao hơn tôi).",
      "So sánh kém: moins + tính từ + que.",
      "So sánh bằng: aussi + tính từ + que.",
      "So sánh nhất: le/la/les plus (hoặc moins) + tính từ. Ví dụ: 'C'est le plus grand bâtiment'.",
      "Ngoại lệ quan trọng: bon (tốt) → so sánh hơn là 'meilleur', KHÔNG phải 'plus bon'.",
    ],
    examples: [
      { fr: "Elle est plus intelligente que lui.", vi: "Cô ấy thông minh hơn anh ấy." },
      { fr: "C'est le meilleur restaurant de la ville.", vi: "Đó là nhà hàng ngon nhất thành phố." },
      { fr: "Il court aussi vite que moi.", vi: "Anh ấy chạy nhanh bằng tôi." },
    ],
  },
  {
    slug: "pronoms-relatifs", label: "Đại từ quan hệ (qui, que, où)", level: "B1", exerciseType: null,
    wikiTitle: "Pronom relatif en français",
    intro: "Đại từ quan hệ nối 2 mệnh đề lại với nhau, tránh phải lặp lại danh từ.",
    rules: [
      "QUI: thay chủ ngữ (người/vật thực hiện hành động). Ví dụ: 'la fille QUI parle' (cô gái đang nói).",
      "QUE: thay tân ngữ trực tiếp (người/vật nhận hành động). Ví dụ: 'le livre QUE je lis' (quyển sách mà tôi đang đọc).",
      "OÙ: thay nơi chốn hoặc thời gian. Ví dụ: 'la ville OÙ j'habite' (thành phố nơi tôi sống).",
    ],
    examples: [
      { fr: "J'ai un ami qui habite à Paris.", vi: "Tôi có một người bạn sống ở Paris." },
      { fr: "Le film que j'ai vu était super.", vi: "Bộ phim mà tôi đã xem thật tuyệt." },
      { fr: "C'est la maison où je suis né.", vi: "Đó là ngôi nhà nơi tôi sinh ra." },
    ],
    tip: "Mẹo phân biệt qui/que: nếu ngay sau đại từ quan hệ là ĐỘNG TỪ → dùng QUI; nếu sau đó là CHỦ NGỮ KHÁC rồi mới tới động từ → dùng QUE.",
  },
  {
    slug: "subjonctif", label: "Thức giả định (subjonctif)", level: "B2", exerciseType: null,
    wikiTitle: "Subjonctif en français",
    intro: "Thức giả định (subjonctif) diễn tả mong muốn, cảm xúc, nghi ngờ, sự cần thiết — không phải một sự thật chắc chắn như thức trình bày (indicatif).",
    rules: [
      "Dùng sau các cụm: il faut que (cần phải), je veux que (tôi muốn), je suis content que (tôi vui vì), bien que (mặc dù), avant que (trước khi).",
      "Cách chia (đa số động từ): lấy gốc từ ngôi 'ils' ở hiện tại, bỏ -ent, thêm đuôi -e, -es, -e, -ions, -iez, -ent. Ví dụ: parler → ils parlENT → que je parlE.",
      "Một số động từ bất quy tắc hoàn toàn: être → que je sois, avoir → que j'aie, aller → que j'aille, faire → que je fasse.",
      "Chỉ dùng subjonctif khi có 2 chủ ngữ khác nhau và có 'que'; nếu cùng 1 chủ ngữ thì dùng động từ nguyên mẫu: 'Je veux partir' (không phải 'que je parte').",
    ],
    examples: [
      { fr: "Il faut que tu viennes.", vi: "Bạn cần phải đến." },
      { fr: "Je suis content que tu sois là.", vi: "Tôi vui vì bạn ở đây." },
      { fr: "Bien qu'il soit fatigué, il travaille.", vi: "Dù mệt, anh ấy vẫn làm việc." },
    ],
    tip: "Subjonctif là một trong những điểm khó nhất của ngữ pháp Pháp — đừng nản nếu chưa quen ngay, cứ nghe nhiều câu ví dụ thật để 'ngấm' dần.",
  },
  {
    slug: "conditionnel", label: "Điều kiện cách (conditionnel)", level: "B2", exerciseType: null,
    wikiTitle: null,
    intro: "Conditionnel diễn tả một điều kiện, mong muốn lịch sự, hoặc giả định không chắc chắn — tương đương 'sẽ/would' trong tiếng Anh.",
    rules: [
      "Cách chia: gốc giống hệt futur simple + đuôi của imparfait (-ais, -ais, -ait, -ions, -iez, -aient). Ví dụ: je parlerais, tu voudrais, il serait.",
      "Dùng để lịch sự hoá yêu cầu: 'Je voudrais un café' lịch sự hơn 'Je veux un café'.",
      "Dùng trong câu điều kiện loại 2 (giả định không có thật ở hiện tại): Si + imparfait, ... + conditionnel. Ví dụ: 'Si j'avais de l'argent, j'achèterais une maison.'",
    ],
    examples: [
      { fr: "Je voudrais réserver une table.", vi: "Tôi muốn đặt một bàn. (lịch sự)" },
      { fr: "Si tu étudiais plus, tu réussirais.", vi: "Nếu bạn học nhiều hơn, bạn sẽ thành công." },
      { fr: "Elle aimerait voyager plus souvent.", vi: "Cô ấy muốn đi du lịch thường xuyên hơn." },
    ],
  },
  {
    slug: "voix-passive", label: "Thể bị động (voix passive)", level: "B2", exerciseType: null,
    wikiTitle: null,
    intro: "Thể bị động nhấn mạnh đối tượng NHẬN hành động, thay vì người/vật thực hiện hành động.",
    rules: [
      "Cấu trúc: chủ ngữ mới (vốn là tân ngữ) + être (chia theo thì) + quá khứ phân từ + (par + tác nhân).",
      "Quá khứ phân từ phải hợp giống/số với chủ ngữ mới.",
      "Ví dụ chuyển chủ động → bị động: 'Le chat mange la souris' → 'La souris est mangée par le chat'.",
      "Chỉ động từ có tân ngữ trực tiếp mới chuyển được sang thể bị động.",
    ],
    examples: [
      { fr: "La lettre a été envoyée par Marie.", vi: "Lá thư đã được Marie gửi." },
      { fr: "Ce livre est lu par des millions de gens.", vi: "Cuốn sách này được hàng triệu người đọc." },
      { fr: "La maison sera vendue bientôt.", vi: "Ngôi nhà sẽ sớm được bán." },
    ],
  },
  {
    slug: "adverbe", label: "Trạng từ (adverbe)", level: "B2", exerciseType: null,
    wikiTitle: "Morphologie de l'adverbe en français",
    intro: "Trạng từ bổ nghĩa cho động từ, tính từ hoặc trạng từ khác, thường diễn tả cách thức, mức độ, thời gian.",
    rules: [
      "Cách tạo phổ biến nhất: tính từ giống cái + đuôi -ment. Ví dụ: lente (chậm, giống cái) → lentement.",
      "Nếu tính từ giống đực tận cùng nguyên âm, dùng luôn giống đực + -ment: vrai → vraiment, poli → poliment.",
      "Một số trạng từ hoàn toàn bất quy tắc: bon → bien (tốt), mauvais → mal (tệ).",
      "Vị trí: thường đứng sau động từ được chia (Il parle bien), hoặc trước tính từ/trạng từ khác (très intéressant).",
    ],
    examples: [
      { fr: "Elle parle couramment le français.", vi: "Cô ấy nói tiếng Pháp trôi chảy." },
      { fr: "Il conduit prudemment.", vi: "Anh ấy lái xe cẩn thận." },
      { fr: "Tu chantes très bien.", vi: "Bạn hát rất hay." },
    ],
  },
];
