# Pharmacity Management System

Hệ thống quản lý chuỗi nhà thuốc Pharmacity, được phát triển để quản lý hiệu quả các hoạt động kinh doanh bao gồm: quản lý thuốc, khách hàng, nhà cung cấp và đơn hàng.

## Tính năng chính

- 🔐 Hệ thống đăng nhập bảo mật
- 📊 Dashboard tổng quan
- 💊 Quản lý thuốc
- 👥 Quản lý khách hàng
- 🏢 Quản lý nhà cung cấp
- 📝 Quản lý đơn hàng
- 📈 Báo cáo thống kê

## Cấu trúc thư mục

```
pharmacity-management/
│
├── index.html                 # Trang chủ
├── login.html                 # Trang đăng nhập
│
├── assets/                    # Thư mục chứa tài nguyên tĩnh
│   ├── css/
│   │   └── style.css         # File CSS chính
│   ├── images/
│   │   ├── favicon.svg       # Icon cho website
│   │   └── pharmacity-logo.svg
│   └── js/                   # JavaScript files
│
├── components/               # Các thành phần có thể tái sử dụng
│   ├── footer.html          # Footer chung
│   ├── header.html          # Header chung
│   └── sidebar.html         # Sidebar điều hướng
│
├── pages/                   # Các trang chức năng
│   ├── dashboard.html       # Trang tổng quan
│   ├── manage-customer.html # Quản lý khách hàng
│   ├── manage-medicine.html # Quản lý thuốc
│   ├── manage-order.html    # Quản lý đơn hàng
│   ├── manage-supplier.html # Quản lý nhà cung cấp
│   └── report.html         # Báo cáo thống kê
│
└── utils/                   # Tiện ích
    └── auth.js             # Xử lý xác thực người dùng
```

## Yêu cầu hệ thống

- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- JavaScript được bật
- Độ phân giải màn hình tối thiểu 1024x768

## Cài đặt

1. Clone repository về máy local:

```bash
git clone [repository-url]
```

2. Mở thư mục dự án:

```bash
cd pharmacity-management
```

3. Cài đặt dependencies (nếu có):

```bash
npm install
```

4. Khởi chạy server local:

```bash
npm start
```

## Sử dụng

1. Truy cập vào đường dẫn local: `http://localhost:3000`
2. Đăng nhập với tài khoản được cung cấp
3. Truy cập vào các chức năng thông qua sidebar

## Tính năng bảo mật

- Xác thực người dùng
- Phân quyền truy cập
- Mã hóa mật khẩu
- Quản lý phiên đăng nhập
- Chống tấn công XSS và CSRF

## Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome Icons

## Đóng góp

Nếu bạn muốn đóng góp vào dự án, vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## Tác giả

- Developed by [hainv204]
- Contact: [hainv07204@gmail.com]

## Giấy phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE.md](LICENSE.md) để biết thêm chi tiết.

## Hỗ trợ

Nếu bạn gặp bất kỳ vấn đề nào, vui lòng tạo issue trong repository hoặc liên hệ trực tiếp với team phát triển.

## Tài liệu chi tiết

Để biết thêm thông tin chi tiết về từng thành phần và chức năng của hệ thống, vui lòng tham khảo tài liệu chi tiết được đính kèm trong thư mục `docs/`. Tài liệu bao gồm:

- Hướng dẫn sử dụng cho người dùng cuối
- Hướng dẫn phát triển cho lập trình viên
- Thông tin API (nếu có)
- Các tài liệu liên quan khác

## Lịch sử thay đổi

### Phiên bản 1.0.0

- Khởi tạo dự án
- Triển khai các tính năng cơ bản
- Thiết lập cấu trúc thư mục

### Phiên bản 1.1.0

- Thêm tính năng báo cáo thống kê
- Cải thiện giao diện người dùng
- Tối ưu hóa hiệu suất

### Phiên bản 1.2.0

- Cập nhật tài liệu chi tiết
- Sửa lỗi và cải thiện bảo mật
- Nâng cấp các thư viện và công nghệ sử dụng

Vui lòng xem file [CHANGELOG.md](CHANGELOG.md) để biết thêm chi tiết về lịch sử thay đổi của dự án.
