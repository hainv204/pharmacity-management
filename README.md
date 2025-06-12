# Pharmacity Management System

Hệ thống quản lý hiệu thuốc Pharmacity, được phát triển để quản lý hiệu quả các hoạt động kinh doanh bao gồm: quản lý thuốc, quản lý khách hàng, quản lý hoá đơn, quản lý nhà cung cấp và báo cáo thống kê.

## Thành phần chính

- 📊 Dashboard
- 💊 Quản lý thuốc
- 👥 Quản lý khách hàng
- 📝 Quản lý hoá đơn
- 🏢 Quản lý nhà cung cấp
- 📈 Báo cáo thống kê

## Cấu trúc thư mục

```
pharmacity-management/
│
├── index.html                   # Trang chủ
├── login.html                   # Trang đăng nhập
│
├── assets/                      # Thư mục chứa tài nguyên tĩnh
│   ├── css/
│   │   └── style.css            # File CSS chính
│   ├── images/
│   │   ├── favicon.svg          # Icon cho website
│   │   └── pharmacity-logo.svg
│   └── js/                      # JavaScript files
│
├── components/                  # Các thành phần có thể tái sử dụng
│   ├── footer.html              # Footer chung
│   ├── header.html              # Header chung
│   └── sidebar.html             # Sidebar điều hướng
│
├── pages/                       # Các trang chức năng
│   ├── dashboard.html           # Trang tổng quan
│   ├── customer-management.html # Quản lý khách hàng
│   ├── medicine-management.html # Quản lý thuốc
│   ├── invoice-management.html  # Quản lý đơn hàng
│   ├── supplier-management.html # Quản lý nhà cung cấp
│   └── statistical-report.html  # Báo cáo thống kê
│
└── utils/
    └── auth.js                  # Xử lý phân quyền
```

## Cài đặt

1. Clone repository về máy local:

```bash
git clone [repository-url]
```

2. Mở thư mục dự án:

```bash
cd pharmacity-management
```

3. Cài đặt extension Live Server

```bash
Extension -> Live Server
```

4. Khởi chạy

```bash
Truy cập vào file login và mở Go Live ở góc dưới màn hình
```

## Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome Icons
