# Content Tiers — Extraction Lab (Release 1)

Nội dung 3 tầng cho từng biến số trong Extraction Lab MVP (`public/tools/extraction-lab.html`).
Cơ chế: **Discover** hiển thị mặc định → nút **"Đi sâu hơn"** mở **Understand** tại chỗ → tab
**"Ghi chú kỹ thuật / Nguồn"** chứa **Deep Dive**. Không cho phép biến tương quan thành nhân quả
tuyệt đối (xem CLAUDE.md — Tiêu chuẩn khoa học).

---

## Dose (Lượng cà phê)

**Discover** — Lượng cà phê xay cho vào phễu lọc trước khi chiết xuất. Nhiều hơn hay ít hơn đều
làm thay đổi vị đậm nhạt của tách cà phê.

**Understand** — Dose quyết định tổng lượng chất hòa tan có thể chiết ra. Cùng một Ratio và
Grind size, dose thấp hơn dễ chiết kiệt (dễ chua gắt/rỗng), dose cao hơn dễ bị nén chặt và cản
dòng nước nếu grind không điều chỉnh theo.

**Deep Dive** — Dose phổ biến cho espresso 1 shot: 18–20g (tùy phễu lọc). Đây là khoảng tham
khảo trong ngành, không phải chuẩn bắt buộc — máy, phễu lọc và giống cà phê khác nhau sẽ cho
khoảng tối ưu khác nhau. *Minh hoạ trong Lab là mô phỏng khái niệm, không phải phép đo trực tiếp.*

---

## Ratio (Tỉ lệ)

**Discover** — Tỉ lệ giữa lượng cà phê khô (dose) và lượng nước/cà phê lỏng thu được (yield).
Ratio thấp → đậm đặc hơn. Ratio cao → loãng và nhẹ hơn.

**Understand** — Ratio là biến số tổng hợp, không độc lập với Dose/Yield/Grind/Contact time. Thay
đổi Ratio mà giữ nguyên grind size và thời gian tiếp xúc sẽ làm thay đổi tốc độ dòng chảy — đây là
lý do Ratio luôn phải đọc cùng với Grind size và Contact time, không đọc riêng lẻ.

**Deep Dive** — Ratio 1:2 (vd. 18g vào, 36g ra) là điểm khởi đầu phổ biến cho espresso hiện đại;
1:1 tới 1:3 vẫn trong phạm vi được nhiều roaster/barista sử dụng tùy mục tiêu hương vị. Không có
một ratio "đúng tuyệt đối" cho mọi hạt — đây là điểm khởi đầu để điều chỉnh, không phải công thức
cố định.

---

## Grind size (Cỡ xay)

**Discover** — Độ mịn/thô của cà phê sau khi xay. Xay càng mịn, nước càng khó chảy qua; xay càng
thô, nước càng chảy nhanh.

**Understand** — Grind size kiểm soát diện tích tiếp xúc giữa nước và cà phê cũng như lực cản
dòng chảy. Quá thô → nước chảy nhanh, chiết thiếu (dưới chiết — chua gắt, mỏng). Quá mịn → nước
bị cản trở, chiết quá mức hoặc phân bố không đều (over-extraction, channeling — đắng, khô miệng).

**Deep Dive** — Không có một "cỡ xay đúng" áp dụng chung cho mọi máy/loại hạt/độ ẩm — grind size
tối ưu phụ thuộc thiết bị xay, độ chín, quy trình sơ chế và độ ẩm hạt tại thời điểm rang. Mô phỏng
kênh nước (channeling) trong Lab minh hoạ khái niệm phân bố không đều, không đại diện chính xác
hình dạng kênh nước thực tế trong mọi phễu lọc.

---

## Contact time (Thời gian tiếp xúc)

**Discover** — Khoảng thời gian nước tiếp xúc với cà phê trong quá trình chiết xuất.

**Understand** — Contact time là kết quả của Grind size, Dose và áp lực/lưu lượng nước — không
phải biến số chỉnh độc lập trong hầu hết thiết bị espresso. Thời gian dài hơn không tự động đồng
nghĩa với chiết xuất tốt hơn — phải đọc cùng Grind size và Ratio.

**Deep Dive** — Khoảng tham khảo cho espresso: 25–35 giây cho một shot chuẩn, nhưng con số này
thay đổi nhiều theo thiết bị (áp suất bơm, phễu lọc, nhiệt độ) — không dùng làm mục tiêu duy nhất
để đánh giá một shot ngon.

---

## Yield (Lượng cà phê lỏng thu được)

**Discover** — Khối lượng (gram) cà phê lỏng chảy ra sau khi chiết xuất — thường đo bằng cân, không
phải bằng thể tích (ml) vì crema làm sai lệch thể tích.

**Understand** — Yield cùng với Dose tạo ra Ratio. Đo yield bằng cân là cách kiểm soát chiết xuất
chính xác hơn ước lượng bằng mắt, vì nó tách biệt khỏi ảnh hưởng của bọt khí/crema.

**Deep Dive** — Yield không tự nó nói lên chất lượng tách cà phê — hai shot cùng yield có thể có
mức độ chiết xuất (extraction yield %) rất khác nhau tùy dose và grind. Đây là lý do Extraction
Lab luôn hiển thị Yield cùng Ratio và Grind size, không hiển thị riêng lẻ.
