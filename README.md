# Ứng dụng Quản lý Khóa học (Course Management App)

## 1. Giới thiệu đề tài
- **Đề tài:** Xây dựng ứng dụng Quản lý khóa học trực tuyến (Course Management)
- **Nền tảng phát triển:** React Native (Expo)
- **Backend:** MockAPI.io (REST API)

---

## 2. Video thuyết trình & Demo ứng dụng
- **Link Video thuyết trình (Google Drive):** [👉LINK_VIDEO_THUYẾT_TRÌNH](https://drive.google.com/file/d/1-gMprimw3vpmOg_M8O4xm7lPXzufrp8e/view?usp=sharing)

---

## 3. Đường dẫn Project / REST API MockAPI
- **Base URL:** `https://6ad5ba9e48476c0785d9a1d2.mockapi.io`
- **Resource Danh mục (`categories`):** `https://6ad5ba9e48476c0785d9a1d2.mockapi.io/categories`
- **Resource Khóa học (`courses`):** `https://6ad5ba9e48476c0785d9a1d2.mockapi.io/courses`

| Method | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/categories` | Lấy danh sách danh mục |
| `POST` | `/categories` | Thêm danh mục mới |
| `PUT` | `/categories/{id}` | Cập nhật thông tin danh mục |
| `DELETE` | `/categories/{id}` | Xóa danh mục (kiểm tra ràng buộc không có khóa học) |
| `GET` | `/courses` | Lấy danh sách khóa học |
| `GET` | `/courses/{id}` | Xem chi tiết khóa học |
| `POST` | `/courses` | Thêm khóa học mới |
| `PUT` | `/courses/{id}` | Cập nhật thông tin khóa học |
| `DELETE` | `/courses/{id}` | Xóa khóa học |

---

## 4. Các chức năng đã hoàn thành
1. **Màn hình Danh sách khóa học (`CourseListScreen`):**
   - Hiển thị danh sách khóa học từ MockAPI kèm ảnh bìa, tên khóa học, giảng viên, tên danh mục (ánh xạ động qua `categoryId`) và học phí.
   - Tìm kiếm khóa học theo tên và lọc khóa học theo từng danh mục.
   - Xử lý đầy đủ trạng thái đang tải (`ActivityIndicator`), lỗi kết nối mạng và danh sách trống.
2. **Màn hình Chi tiết khóa học (`CourseDetailScreen`):**
   - Hiển thị đầy đủ thông tin khóa học và tên danh mục tương ứng.
   - Tích hợp khung xem Video Trailer MP4, nút Sửa và nút Xóa khóa học (có hộp thoại `Alert` xác nhận trước khi xóa).
3. **Màn hình Thêm / Sửa khóa học (`CourseFormScreen`):**
   - Chọn danh mục khóa học từ Dropdown (`Picker`) lấy dữ liệu trực tiếp qua API `categories`.
   - Hỗ trợ xem trước ảnh bìa (Image Preview) ngay khi nhập URL.
   - Kiểm tra hợp lệ dữ liệu (các trường bắt buộc, học phí không âm, thời lượng > 0, `categoryId` hợp lệ) trước khi gửi `POST` / `PUT`.
4. **Màn hình Quản lý danh mục (`CategoryScreen`):**
   - Hiển thị danh sách danh mục kèm số lượng khóa học đang thuộc danh mục đó.
   - Thêm mới, chỉnh sửa và xóa danh mục.
   - Kiểm tra ràng buộc khóa ngoại phía ứng dụng: Không cho phép xóa danh mục đang có khóa học.

---

## 5. Hướng dẫn cài đặt và chạy ứng dụng

1. **Clone project từ GitHub:**
   ```bash
   git clone https://github.com/xuanbien06/baitapbuoi5.git
   cd CourseManagementApp
2. **Cài đặt các gói thư viện:**
   ```bash
   npm install
3. **Khởi chạy Expo Development Server:**
   ```bash
   npx expo start -c
4. **Chạy trên máy ảo Android (Android Studio):**
   ```bash
   Mở máy ảo trong Android Studio.
   Nhấn phím a trên cửa sổ Terminal để mở ứng dụng trên Android Emulator.