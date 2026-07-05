# Apprends Fou — Học tiếng Pháp điên dại 🔥🇫🇷

App desktop (Electron) để học từ vựng tiếng Pháp qua mini-game, có spaced repetition,
chế độ tập trung đếm giờ học, và từ điển tra cứu cơ bản → nâng cao (A1 → B2).

## Cập nhật sau khi người dùng thử nghiệm thực tế

Sau khi dùng thử, bạn góp ý 5 điểm — dưới đây là cách mình xử lý từng điểm:

1. **"Phát âm nghe như tiếng Anh"** → Bug thật: code trước chỉ gắn nhãn
   `lang="fr-FR"` cho giọng đọc tổng hợp (TTS) nhưng không chọn giọng cụ thể.
   Nếu máy không có giọng tiếng Pháp cài sẵn, trình duyệt tự dùng giọng mặc
   định (thường là tiếng Anh) để đọc. Đã sửa: giờ chủ động tìm giọng `fr-*`
   trong danh sách giọng đọc của hệ thống. **Nếu máy bạn vẫn chưa có giọng
   tiếng Pháp nào, cần cài thêm gói giọng đọc tiếng Pháp trong Cài đặt hệ điều
   hành (Windows: Settings → Time & Language → Speech; macOS: System Settings
   → Accessibility → Spoken Content) để nghe chuẩn nhất.** Âm thanh thật từ
   Free Dictionary API (khi có) vẫn được ưu tiên trước TTS.
2. **"Danh sách từ ít"** → Mở rộng từ 140 lên **285 từ**, thêm 13 chủ đề mới
   (Giao thông, Quần áo, Động vật, Thời tiết, Cơ thể, Nhà cửa, Công việc & Học
   tập, Công nghệ, Sức khỏe, Thể thao & Sở thích, Cảm xúc, Thiên nhiên, Mua sắm).
3. **"Bỏ ảnh trong Flashcard"** → Đã bỏ. (Vẫn giữ ảnh nhỏ trong mục Từ điển
   nếu bạn muốn bỏ luôn ở đó thì báo mình.)
4. **"Ngữ pháp ít và nội dung Wikipedia sơ sài"** → Đổi hướng hoàn toàn: bỏ
   lấy nội dung qua API Wikipedia (tóm tắt bách khoa, không có ví dụ thực
   hành, không phù hợp người học), thay bằng **20 chủ điểm viết tay theo
   hướng sư phạm** (từ 12 lên 20), mỗi bài có: giải thích ngắn gọn, quy tắc cụ
   thể, 3 ví dụ có phát âm, mẹo ghi nhớ. Vẫn giữ link "Đọc thêm trên
   Wikipedia" cho ai muốn đào sâu hơn. Bạn cũng có thể tự viết ghi chú riêng ở
   cuối mỗi bài.
5. **"Pomodoro bị restart khi chuyển tab"** → Bug thật, đã sửa: trước đây mỗi
   lần quay lại tab Tập trung, code tự động reset phiên đang chạy về từ đầu.
   Giờ chuyển qua tab khác rồi quay lại, phiên học/nghỉ vẫn tiếp tục đúng chỗ
   dở dang (kể cả thời gian đã tích lũy).

## Cài đặt & chạy

Cần cài **Node.js** (khuyên dùng bản 18 trở lên) trước.

```bash
cd apprends-fou
npm install
npm start
```

Lần đầu `npm install` sẽ tải Electron về máy (khoảng 100-200MB), có thể mất vài phút.

## Đóng gói thành file cài đặt (.exe / .dmg / .AppImage)

```bash
npm run dist
```

Lệnh này chỉ tạo được file cài đặt cho **hệ điều hành bạn đang chạy nó**.
Chạy trên Windows → chỉ ra file `.exe`. Đây không phải lỗi cấu hình — mà là
giới hạn thật của electron-builder: **không thể tạo file `.dmg` (cài đặt
macOS) từ máy Windows**, vì công cụ đóng gói của Apple chỉ chạy được trên
macOS thật.

### Cách lấy cả file Windows lẫn macOS khi bạn chỉ có máy Windows

Dự án đã có sẵn file `.github/workflows/build.yml` — dùng **GitHub Actions**
(máy ảo Windows + macOS miễn phí của GitHub) để build hộ cả hai:

1. Tạo một repository trên [GitHub](https://github.com) (miễn phí), đẩy toàn
   bộ code của thư mục `apprends-fou` lên đó:
   ```bash
   git init
   git add .
   git commit -m "Apprends Fou"
   git branch -M main
   git remote add origin https://github.com/<tên-bạn>/<tên-repo>.git
   git push -u origin main
   ```
2. Vào repo trên GitHub → tab **Actions** → chọn workflow **"Build desktop
   installers (Windows + macOS)"** → bấm **"Run workflow"**.
3. Chờ khoảng 5-10 phút. Chạy xong, cuộn xuống cuối trang chạy đó, mục
   **Artifacts** sẽ có 2 file để tải: `windows-installer` (.exe) và
   `mac-installer` (.dmg + .zip) — không cần đụng tới máy Mac thật.

Workflow cũng tự chạy mỗi khi bạn đẩy một tag dạng `v1.0.0`:
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Lưu ý về bản macOS**: vì chưa có Apple Developer certificate (trả phí
99 USD/năm) để ký code, khi người dùng Mac mở app lần đầu, macOS sẽ cảnh báo
"không xác định được nhà phát triển" — họ cần chuột phải vào app → **Open**
để xác nhận mở (chỉ cần làm 1 lần). Đây là hành vi bình thường với app chưa
ký, không phải lỗi.

**Lựa chọn khác** nếu không muốn dùng GitHub Actions: thuê máy Mac từ xa
(MacinCloud, MacStadium) rồi chạy `npm run dist` trực tiếp trên đó.

**Nếu gặp lỗi "GitHub Personal Access Token is not set"**: electron-builder
mặc định cố tạo GitHub Release khi phát hiện đang chạy trong CI. Cấu hình
`"publish": null` trong `package.json` đã tắt việc này — bạn chỉ cần tải file
ở mục Artifacts như hướng dẫn trên, không cần token gì cả. Nếu sau này muốn
tự động đăng release lên GitHub kèm file cài đặt, mới cần tạo secret
`GH_TOKEN` trong repo Settings → Secrets.

### Thêm icon riêng cho app (tuỳ chọn)

Hiện app dùng icon mặc định của Electron. Muốn đổi: tạo thư mục `build/` ở
gốc dự án, thêm `build/icon.ico` (Windows, 256×256) và `build/icon.icns`
(macOS) — electron-builder tự nhận diện theo đúng quy ước tên file này, không
cần sửa `package.json`.

## Kiến trúc mới: Khám phá không giới hạn qua API nguồn mở (cập nhật mới nhất)

Bạn góp ý: 285 từ + 20 chủ điểm ngữ pháp vẫn chưa đủ để học hết các cấp độ, và
muốn nội dung lấy từ các trang học uy tín qua API, có cơ chế "tải thêm" và
lưu lại trên máy để tối ưu hiệu năng. Sau khi tìm hiểu, các trang học nổi
tiếng (FrenchLearner, Kwiziq, LawlessFrench...) đều là **nội dung có bản
quyền** — không có API công khai và việc lấy nội dung từ đó sẽ vi phạm bản
quyền/điều khoản sử dụng của họ, nên mình không thể làm việc đó. Thay vào đó,
mình dùng 2 nguồn **mở, uy tín, miễn phí, không cần key**:

| Nguồn | Dùng cho | Cơ chế tải thêm |
|---|---|---|
| [Wiktionnaire](https://fr.wiktionary.org) (từ điển mở lớn nhất) | Mục **🔭 Khám phá** — từ vựng theo chủ đề, không giới hạn số lượng | Phân trang thật qua API (`cmcontinue`), bấm "Tải thêm từ" để lấy tiếp |
| [Wikibooks French Course](https://en.wikibooks.org/wiki/French) (giáo trình mở, viết theo hướng sư phạm — có bài tập, ví dụ, giải thích từng bước, khác hẳn tóm tắt Wikipedia) | Mục **Ngữ pháp → Bài học theo chủ đề** | Bấm "Tải thêm bài học" để hiện thêm bài từ danh sách 20 bài đã xác minh |

**Cách hoạt động của việc lưu cache:** mỗi khi tải một chủ đề/bài học mới,
danh sách từ hoặc nội dung được lưu vào file JSON trên máy (`Store`). Lần sau
mở lại chủ đề đó, app đọc từ file trên máy trước — **không gọi lại
Wiktionnaire/Wikibooks nữa**, chỉ khi bạn chủ động bấm "Tải thêm" mới gọi API
để lấy phần mới. Nghĩa/ví dụ của từng từ khám phá được cũng tái sử dụng toàn
bộ hạ tầng dịch (MyMemory) + audio (Free Dictionary API) đã có, cache y hệt
từ vựng cốt lõi.

**Vì sao vẫn giữ 285 từ + 20 chủ điểm cũ thay vì thay hẳn bằng nguồn động?**
Vì Wiktionnaire không gắn nhãn cấp độ A1-B2 cho từ (chỉ có chủ đề), nên không
thể dùng để xây lộ trình học có cấp độ rõ ràng. Bộ 285 từ + 20 chủ điểm cũ vẫn
là "lõi" để học có định hướng (Thẻ từ, Đố vui, Nối từ, Gõ nhanh, Chia động từ
đều dùng bộ này); mục Khám phá là để mở rộng thêm khi bạn đã học hết phần lõi
hoặc muốn tìm từ theo chủ đề cụ thể không có sẵn.

## Đợt nâng cấp lớn: 9 cải tiến mới (Ôn tập thông minh, Dictée, Hội thoại...)

**Tính năng học tập mới:**
- **🎯 Ôn tập thông minh**: gộp từ đến hạn ôn (SRS) + từ hay sai ở Đố vui/Nối từ/Gõ nhanh + vài từ mới thành MỘT phiên ôn ưu tiên duy nhất mỗi ngày, thay vì phải tự chọn từng game riêng lẻ.
- **🎧 Dictée (nghe chép chính tả)**: nghe câu tiếng Pháp thật, gõ lại, chấm theo từng từ — kỹ năng nghe thật sự, khác với "nghe rồi chọn đáp án" ở Đố vui.
- **💬 Hội thoại tình huống**: 3 kịch bản phân nhánh (gọi món ở quán cà phê, hỏi đường, làm quen) — nội dung viết tay để đảm bảo tiếng Pháp tự nhiên, không lấy qua API.
- **🔬 Phân tích câu** *(phạm vi có giới hạn CÓ CHỦ ĐÍCH)*: nhận diện chủ ngữ/động từ (kèm thì + ngôi)/mạo từ/danh từ/tính từ trong câu — nhưng CHỈ với từ có trong dữ liệu đã kiểm chứng của app. Mình không xây một bộ phân tích ngữ pháp tiếng Pháp tổng quát vì đó là bài toán NLP khó, không thể đảm bảo đúng nếu tự viết — thà giới hạn phạm vi rõ ràng còn hơn đưa ra phân tích sai mà không biết.
- **📰 Đọc hiểu**: trích đoạn văn xuôi thật từ Wikipedia tiếng Pháp (không dùng thơ/ngụ ngôn dù public domain, vì nguyên tắc không tái tạo tác phẩm nghệ thuật dưới mọi hình thức), bấm vào từng từ để tra nghĩa ngay khi đọc, kèm bản dịch tự động.
- **Mở rộng bài tập ngữ pháp**: thêm bài hợp giống/số tính từ và chọn mạo từ đúng (cần bổ sung dữ liệu giống đực/cái cho một số danh từ — xem `adjectiveAgreementData.js`).

**Hạ tầng & trải nghiệm:**
- **Hiệu năng**: main process trước đây đọc/ghi đĩa đồng bộ ở MỌI thao tác lưu trữ — có thể gây giật nhẹ khi nhiều từ được dịch liên tiếp. Giờ giữ dữ liệu trong bộ nhớ, ghi đĩa gộp lại (debounce 400ms), không mất dữ liệu khi thoát app.
- **Giao diện Sáng/Tối + cỡ chữ tuỳ chỉnh**: đổi trong Cài đặt, áp dụng ngay lập tức.
- **Command Palette (Ctrl+K)**: tìm kiếm xuyên suốt toàn app — mục điều hướng, từ vựng, chủ điểm ngữ pháp, động từ, chủ đề khám phá.

## Ngữ pháp — overhaul trực quan hoá (tham khảo Duolingo, Kwiziq, Babbel)

Sau khi tìm hiểu cách các app lớn dạy ngữ pháp, mình làm lại toàn bộ mục Ngữ pháp:

- **Tô màu vai trò ngữ pháp xuyên suốt app** (kiểu Duolingo): chủ ngữ/động từ/mạo từ/danh từ/tính từ/phủ định luôn cùng 1 màu ở mọi nơi — Ngữ pháp, Phân tích câu, bài tập. Nhìn màu quen dần thay vì phải nhớ quy tắc.
- **Huy hiệu giống đực/cái nhất quán**: ♂ xanh dương / ♀ hồng, xuất hiện ở Phân tích câu và bài tập mạo từ/tính từ.
- **Dòng thời gian trực quan cho các thì**: sơ đồ ngang cho Passé composé / Imparfait / Futur so với "hiện tại" — giải quyết trực tiếp điểm hay nhầm nhất (imparfait vs passé composé).
- **Kéo-thả sắp xếp câu** (bài tập đặc trưng của Duolingo): xáo trộn từ trong 1 câu ví dụ, kéo hoặc bấm chọn để ghép lại đúng thứ tự.
- **Nội dung mỗi chủ điểm mở rộng đầy đủ**: Công thức, Nghĩa, Giải thích + Lưu ý, **4 ví dụ** (tăng từ 3), **Chủ điểm liên quan** (≈ tương đồng / ⇄ đối lập, bấm để nhảy qua), và **phần luyện viết 4 câu** (có thể bỏ qua, không chấm điểm tự động vì không có cách kiểm tra ngữ pháp tự do đáng tin cậy — đây là chỗ để tự luyện diễn đạt).
- **Sắp xếp lại theo chủ đề** thay vì chỉ theo cấp độ: Danh từ & Mạo từ · Đại từ · Tính từ & Trạng từ · Động từ & Thì · Câu & Giới từ — mỗi chủ điểm vẫn có nhãn cấp độ A1-B2 riêng.

## Widget Pomodoro nổi (mới)

Khi bấm "Bắt đầu" ở Tập trung rồi chuyển sang mục khác, một widget nhỏ hiện
ở góc phải trên màn hình, hiển thị thời gian đang đếm — không cần quay lại
tab Tập trung để biết còn bao lâu:
- **Icon đồng hồ cà chua** khi đang trong phiên học, **icon đồng hồ có
  trăng lưỡi liềm** (biểu tượng nghỉ ngơi) khi đang giờ nghỉ.
- **Kéo thả được** để tránh đè lên nội dung khác — vị trí được nhớ lại cho
  lần sau.
- Bấm vào widget để nhảy thẳng về trang Tập trung.
- Chỉ hiện sau khi đã bấm "Bắt đầu" ít nhất 1 lần.

## Tính năng

**Học từ vựng:**
- **Thẻ từ (Flashcards)**: lật thẻ + spaced repetition, kèm ảnh minh hoạ tự động cho mỗi từ.
- **Đố vui (Quiz)**: trắc nghiệm 4 đáp án — nhìn chữ hoặc nghe đoán nghĩa.
- **Nối từ (Matching)**: kéo-thả nối tiếng Pháp với nghĩa tiếng Việt.
- **Gõ nhanh** *(mới)*: cho nghĩa tiếng Việt, gõ đúng từ tiếng Pháp trong 60 giây — chiều ngược Flashcards, luyện phản xạ.
- **Từ điển**: duyệt ~140 từ theo cấp độ/chủ đề, có ảnh minh hoạ, phát âm, sửa nghĩa tay.
- **Khám phá** *(mới)*: duyệt từ vựng không giới hạn theo 25 chủ đề qua Wiktionnaire, tải thêm liên tục, lưu cache trên máy.
- **Đã học** *(mới)*: xem lại toàn bộ từ đã ôn qua Thẻ từ, biết từ nào thành thạo/sắp quên, ôn nhanh ngay tại chỗ mà không cần chơi lại từ đầu.

**Ngữ pháp:**
- **Chia động từ**: luyện 28 động từ × 3 thì, chấm điểm bằng bộ máy quy tắc (không qua API dịch, luôn đúng).
- **Ngữ pháp**: 20 chủ điểm A1-B2 với nội dung viết tay theo hướng sư phạm (quy tắc + ví dụ + mẹo), kèm **bài tập điền từ** tự sinh cho các chủ điểm liên quan đến thì động từ và câu phủ định, cho phép ghi chú riêng. **Mới**: thêm 20 bài học đầy đủ từ Wikibooks (tải thêm dần), dịch tự động.

**Khác:**
- **Tập trung (Pomodoro)** *(nâng cấp)*: học/nghỉ xen kẽ tự động chuyển giai đoạn, đếm số phiên hoàn thành mỗi ngày, thời lượng chỉnh được trong Cài đặt.
- **Cấp độ & XP** *(mới)*: thanh kinh nghiệm tổng thể ở Bảng tin, cộng dồn từ mọi hoạt động học, có tước hiệu vui theo cấp.
- **Hiệu ứng âm thanh** *(mới)*: tiếng "ting" khi đúng, tiếng trầm khi sai, tiếng chuông khi lên cấp — tự tạo bằng Web Audio, không cần file âm thanh.
- **Cài đặt** *(mới)*: mục tiêu học/ngày, thời lượng Pomodoro, bật/tắt âm thanh, xuất/nhập file sao lưu toàn bộ tiến trình, xoá dữ liệu.
- **Màn hình chào mừng** *(mới)*: giới thiệu nhanh các tính năng ở lần mở app đầu tiên.

## Nguồn dữ liệu — 100% lấy qua API, không khai báo tay

Ứng dụng chỉ giữ **khung** dữ liệu tĩnh (danh sách ~140 từ theo cấp độ/chủ đề
trong `vocabulary.js`, và danh sách 12 chủ điểm ngữ pháp trong
`grammarTopics.js`) — vì việc phân cấp độ A1-B2 cần curator, không có API nào
làm việc đó chuẩn. **Toàn bộ nội dung** (nghĩa, ví dụ, phát âm, giải thích ngữ
pháp) được lấy động từ các API miễn phí sau, ngay khi bạn mở đến từ/chủ điểm đó:

| Nội dung | Nguồn | Ghi chú |
|---|---|---|
| Nghĩa tiếng Việt của từ | [MyMemory Translation API](https://mymemory.translated.net/) | Dịch máy, có giới hạn lượt gọi/ngày (ẩn danh) |
| Câu ví dụ tiếng Pháp thật | [Tatoeba API](https://tatoeba.org/) | Không phải từ nào cũng có câu ví dụ |
| Phiên âm & audio phát âm | [Free Dictionary API](https://dictionaryapi.dev/) | Nếu không có audio, dùng giọng đọc tổng hợp (Web Speech API) |
| Ảnh minh hoạ từ vựng (Từ điển) | [Openverse API](https://openverse.org/) | Ảnh CC/miễn phí, dịch từ sang tiếng Anh trước để tìm ảnh liên quan hơn |

Riêng nội dung **Ngữ pháp** không còn lấy qua API nữa — xem mục "Cập nhật sau khi người dùng thử nghiệm thực tế" ở trên để biết lý do.

**Về tính năng video/podcast bạn yêu cầu:** mình **chưa** đưa vào bản này.
Nhúng video cần chọn kỹ một danh sách kênh YouTube học tiếng Pháp uy tín
(để tránh nhúng nội dung không phù hợp), còn podcast cần parse RSS feed thật —
cả hai đều làm được không cần API key, nhưng đủ lớn để cần một lượt riêng cho
chắc chắn về chất lượng nội dung. Báo mình khi bạn muốn làm tiếp phần này.

**Sửa tay khi dịch sai**: mọi nghĩa/ví dụ/giải thích đều có nút ✏️ để bạn tự
viết lại. Phần đã sửa tay được lưu riêng và **sẽ không bao giờ bị API ghi đè**
ở những lần mở lại sau, kể cả khi bạn bấm "Thử tải lại".

**Lưu ý về giới hạn API miễn phí**: MyMemory giới hạn khoảng 1000-5000 từ/ngày
cho người dùng ẩn danh. Vì kết quả được cache vĩnh viễn trên máy sau lần lấy
đầu tiên, việc học hàng ngày với cùng bộ từ sẽ không tốn thêm lượt gọi. Nếu
một ngày bạn học rất nhiều từ mới và bị API từ chối tạm thời, cứ bấm nút 🔄
"Thử lại" sau ít phút, hoặc tự nhập nghĩa tay trong lúc chờ.

**Vì sao "Chia động từ" KHÔNG dùng API?** Mình đã tìm các API chia động từ
tiếng Pháp miễn phí, nhưng chỉ thấy: (1) dịch vụ cần trả phí/đăng ký API key
(RapidAPI, Verbix), hoặc (2) dự án cá nhân nhỏ, không rõ độ ổn định và mình
không kiểm chứng được cấu trúc dữ liệu trả về trong môi trường này. Vì đây là
bài tập **chấm đúng/sai**, dùng một API chưa kiểm chứng có nguy cơ chấm sai
cho người học — nên mình xây một bộ máy chia theo đúng quy tắc ngữ pháp tiếng
Pháp (`renderer/modules/conjugation.js`), đã kiểm tra tay toàn bộ 28 động từ
× 3 thì (84 bảng chia) khớp chuẩn ngữ pháp. Đây là quy tắc/thuật toán, không
phải "khai báo đáp án" — tương tự việc code một bảng cửu chương thay vì gọi
API cho phép tính 2×2.

- Toàn bộ tiến trình học + dữ liệu đã cache/sửa tay được lưu cục bộ trên máy
  (không cần tài khoản). Cần internet để lấy nghĩa/ví dụ/giải thích lần đầu;
  sau đó xem lại không cần mạng. Riêng phần Chia động từ hoạt động hoàn toàn
  offline vì không phụ thuộc API.

## Cấu trúc thư mục

```
apprends-fou/
├── main.js              # Tiến trình chính Electron + lưu trữ dữ liệu (JSON)
├── preload.js            # Cầu nối an toàn giữa main và renderer
├── package.json
└── renderer/
    ├── index.html
    ├── styles.css
    ├── app.js             # Điều hướng + Bảng tin tổng quan
    ├── data/
    │   ├── vocabulary.js       # Khung ~140 từ: chỉ id/từ/cấp độ/chủ đề
    │   ├── grammarTopics.js    # 20 chủ điểm ngữ pháp viết sẵn (không qua API)
    │   └── conjugationVerbs.js # Khung 28 động từ luyện chia + cấp độ + nhóm
    └── modules/
        ├── srs.js         # Spaced repetition
        ├── store.js       # Lưu trữ tiến trình + cache API
        ├── api.js         # Phát âm (Free Dictionary API + Web Speech)
        ├── enrichment.js  # Gọi API dịch (MyMemory) + ví dụ (Tatoeba), cache + sửa tay
        ├── conjugation.js     # Bộ máy chia động từ theo quy tắc ngữ pháp
        ├── conjugationGame.js # Giao diện luyện chia động từ
        ├── flashcards.js
        ├── quiz.js
        ├── matching.js
        ├── focus.js
        ├── vocabBrowser.js
        ├── learnedWords.js  # Xem lại từ đã học qua Thẻ từ (SRS), ôn nhanh tại chỗ
        └── grammar.js     # Hiển thị nội dung ngữ pháp viết sẵn + bài tập
```

## Mở rộng thêm

- Thêm từ vựng: sửa file `renderer/data/vocabulary.js`, thêm object mới
  `{ id, fr, level, category }` — nghĩa/ví dụ sẽ tự lấy qua API khi bạn mở đến.
- Thêm chủ điểm ngữ pháp: sửa `renderer/data/grammarTopics.js`, thêm
  `{ slug, label, level, wikiTitle }` — `wikiTitle` phải khớp đúng tên bài
  trên `fr.wikipedia.org` (kiểm tra bằng cách mở thử URL trước khi thêm).
- Thêm động từ để luyện chia: sửa `renderer/data/conjugationVerbs.js`. Nếu
  động từ đều (theo nhóm `regular-er`, `regular-ir`, `regular-re`), chỉ cần
  thêm `{ infinitive, level, group }` là đủ, bộ máy sẽ tự tính. Nếu là động từ
  bất quy tắc, cần thêm bảng chia thì hiện tại vào `IRREGULAR_PRESENT` trong
  `renderer/modules/conjugation.js` (và gốc futur vào `IRREGULAR_FUTUR_STEM`
  nếu gốc không theo quy tắc).
- Ngưỡng "đã thuộc lòng" hiện tại là `repetition >= 3` lần đúng liên tiếp —
  chỉnh trong `renderer/app.js` nếu muốn đổi độ khó.
