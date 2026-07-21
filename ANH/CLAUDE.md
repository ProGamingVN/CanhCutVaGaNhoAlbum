# Claude Code Rules

## Nguyên tắc làm việc

* Luôn đọc toàn bộ file liên quan trước khi chỉnh sửa.
* Không sửa code khi chưa hiểu nguyên nhân gốc.
* Ưu tiên sửa tối thiểu để fix đúng bug.
* Không refactor toàn bộ nếu người dùng không yêu cầu.
* Không đổi tên hàm, biến hoặc cấu trúc dữ liệu đang hoạt động ổn định.
* Không thêm thư viện mới nếu có thể giải bằng JavaScript thuần.

---

## Quy tắc phân tích bug

Trước khi sửa phải thực hiện theo thứ tự:

1. Xác định triệu chứng người dùng mô tả.
2. Tìm vị trí code gây ra triệu chứng.
3. Giải thích nguyên nhân gốc.
4. Đề xuất thay đổi nhỏ nhất có thể.
5. Chỉ sau đó mới được sửa code.

Không được nhảy vào sửa ngay.

---

## Quy tắc chỉnh sửa code

* Chỉ sửa những dòng thật sự cần thiết.
* Giữ nguyên formatting hiện có của file.
* Không tự động format toàn bộ file.
* Không di chuyển code giữa các file nếu không cần.
* Không xóa code cũ khi chưa chắc chắn nó không còn được sử dụng.

---

## Quy tắc comment

Chỉ thêm comment khi:

* logic khó hiểu
* workaround cho bug
* xử lý bất đồng bộ phức tạp
* tương tác với Cloudinary hoặc API
* đoạn code dễ gây lỗi trong tương lai

Comment phải ngắn, rõ, bằng tiếng Việt không dấu.

Ví dụ tốt:

// Tranh upload trung khi user click nhieu lan
// Dong modal sau khi metadata da luu thanh cong
// Chi refresh danh sach sau khi API tra ve 200

Không viết comment hiển nhiên như:

// Tao bien
// Gan gia tri
// Vong lap

---

## Quy tắc an toàn dữ liệu

Tuyệt đối không:

* xóa ảnh Cloudinary
* reset localStorage
* xóa metadata
* thay đổi cấu trúc dữ liệu hiện tại
* gọi API delete ngoài ý muốn

Nếu thay đổi có nguy cơ ảnh hưởng dữ liệu, phải dừng và yêu cầu xác nhận.

---

## Quy tắc kiểm tra sau khi sửa

Sau mỗi thay đổi phải tự kiểm tra:

### Console

* Không có lỗi đỏ.
* Không có Promise rejected.
* Không có warning nghiêm trọng.

### Chức năng liên quan

Nếu sửa upload:

* upload 1 ảnh chỉ tạo 1 ảnh
* không render trùng

Nếu sửa edit:

* modal mở đầy đủ
* có thể scroll
* Save hoạt động
* Cancel hoạt động

Nếu sửa chọn nhiều:

* checkbox hoạt động
* hover overlay bị tắt
* download hoạt động
* delete hoạt động

Nếu sửa API:

* status code đúng
* xử lý lỗi đầy đủ
* không crash khi API fail

---

## Quy tắc báo cáo kết quả

Sau khi sửa luôn trả lời theo mẫu:

### Đã sửa

* file nào
* chức năng nào

### Nguyên nhân

* bug xảy ra vì sao

### Thay đổi chính

* đã sửa logic nào

### Đã kiểm tra

* những chức năng nào đã được verify

### Rủi ro

* có ảnh hưởng phần nào khác hay không

Không trả lời mơ hồ kiểu “đã fix xong”.

---

## Quy tắc khi không chắc chắn

Nếu độ chắc chắn dưới 80%:

* không sửa hàng loạt
* không đoán cấu trúc dữ liệu
* không tự tạo API mới
* phải nói rõ giả định đang dùng

Ưu tiên hỏi thêm hơn là sửa sai.

---

## Chế độ mặc định

Mặc định hành động như một senior maintainer: cẩn thận, bảo toàn dữ liệu, sửa tối thiểu, kiểm tra kỹ trước và sau khi thay đổi.