# Pharmacity Management System

Hệ thống quản lý hiệu thuốc Pharmacity, được phát triển để quản lý hiệu quả các chức năng bao gồm: quản lý thuốc, quản lý hoá đơn, quản lý khách hàng, quản lý nhà cung cấp và báo cáo thống kê.

## Thành phần chính

- 📊 Dashboard
- 💊 Quản lý thuốc
- 👥 Quản lý khách hàng
- 📝 Quản lý hoá đơn
- 🏢 Quản lý nhà cung cấp
- 📈 Báo cáo thống kê

## Cấu trúc thư mục

```
Pharmacity-management
|   index.html
|   login.html
|   README.md
|
+---assets
|   +---css
|   |       dashboard.css
|   |       invoice.css
|   |       sodonhang.css
|   |       style.css
|   |
|   +---images
|   |       bank-qr-code.jpg
|   |       favicon.svg
|   |       momo-qr-code.jpg
|   |       pharmacity-logo.svg
|   |
|   \---js
|           dashboard.js
|           invoice.js
|           supplier-management.js
|
+---components
|   |   footer.html
|   |   header.html
|   |   sidebar.html
|   |
|   \---invoice
|       |   cancel-changes-modals.html
|       |   cancel-invoice-modals.html
|       |   create-invoice-modal.html
|       |   delete-confirm-modal.html
|       |   edit-invoice-modal.html
|       |   filter-modal.html
|       |   invoice-detail-modal.html
|       |   invoice-table.html
|       |   pagination.html
|       |   search-bar.html
|       |   toast-notifications.html
|       |   top-bar.html
|       |
|       \---payment
|               card-payment-modal.html
|               cash-payment-modal.html
|               momo-payment-modal.html
|               transfer-payment-modal.html
|
+---pages
|   |   customer_management.html
|   |   dashboard.html
|   |   invoice-management.html
|   |   statistical-report.html
|   |   supplier-management.html
|   |
|   +---manage-medicine
|   |       medicine-alerts.html
|   |       medicine-lists.html
|   |
|   +---manage-warehouse
|   |       manage-stock.html
|   |       stock-in.html
|   |       stock-out.html
|   |
|   \---report
|           doanhthu.html
|           khachhang.html
|           loinhuan.html
|           sodonhang.html
|
\---utils
        auth.js
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
