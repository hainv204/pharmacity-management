// Authentication utilities

const ROLES = {
    MANAGER: 'manager',
    INVENTORY: 'inventory',
    SALES: 'sales',
    CUSTOMER_SERVICE: 'customer-service'
};

// Định nghĩa quyền truy cập - nguồn dữ liệu chính cho việc kiểm tra quyền
const ACCESS_RIGHTS = {
    'manage-medicine': [ROLES.MANAGER, ROLES.INVENTORY, ROLES.SALES],
    'manage-order': [ROLES.MANAGER, ROLES.SALES],
    'manage-customer': [ROLES.MANAGER, ROLES.SALES, ROLES.CUSTOMER_SERVICE],
    'manage-supplier': [ROLES.MANAGER, ROLES.INVENTORY],
    'report': [ROLES.MANAGER],
    'dashboard': [ROLES.MANAGER, ROLES.INVENTORY, ROLES.SALES, ROLES.CUSTOMER_SERVICE],
    'add-medicine': [ROLES.MANAGER, ROLES.INVENTORY],
    'medicine-categories': [ROLES.MANAGER, ROLES.INVENTORY],
    'create-order': [ROLES.MANAGER, ROLES.SALES],
    'add-customer': [ROLES.MANAGER, ROLES.SALES, ROLES.CUSTOMER_SERVICE],
    'customer-groups': [ROLES.MANAGER, ROLES.SALES],
    'add-supplier': [ROLES.MANAGER, ROLES.INVENTORY],
    'sales-report': [ROLES.MANAGER],
    'inventory-report': [ROLES.MANAGER],
    'system-config': [ROLES.MANAGER]
};

// Dữ liệu người dùng mẫu (trong thực tế sẽ lấy từ backend)
const users = [
    { username: 'admin', password: 'admin123', role: ROLES.MANAGER, name: 'Quản lý' },
    { username: 'inventory', password: 'inv123', role: ROLES.INVENTORY, name: 'Nhân viên kho' },
    { username: 'sales', password: 'sales123', role: ROLES.SALES, name: 'Nhân viên bán hàng' },
    { username: 'customer', password: 'cust123', role: ROLES.CUSTOMER_SERVICE, name: 'Nhân viên CSKH' }
];

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Lưu thông tin người dùng
        const userData = {
            username: user.username,
            role: user.role,
            name: user.name
        };

        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }

        window.location.href = '/pages/dashboard.html';
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
    return false;
}

function getCurrentUser() {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    return JSON.parse(sessionUser || localUser || 'null');
}

function checkAuth() {
    // Luôn trả về user có quyền cao nhất để toàn quyền sử dụng hệ thống trên GitHub Pages
    return { username: 'admin', role: 'manager', name: 'Quản lý' };
}

function hasAccessToPage(role, page) {
    return ACCESS_RIGHTS[page] ? ACCESS_RIGHTS[page].includes(role) : true;
}

function logout() {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function setupNavigation() {
    const user = checkAuth();
    if (!user) return;

    // Cập nhật tên người dùng trong header
    const currentUserElement = document.getElementById('currentUser');
    if (currentUserElement) {
        currentUserElement.textContent = user.name;
    }

    // Đánh dấu active menu trước khi áp dụng phân quyền
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const activeLink = document.querySelector(`.nav-link[data-page="${currentPage}"]`);

    if (activeLink) {
        activeLink.classList.add('active');
        // Nếu nằm trong submenu, đánh dấu menu cha là active
        const parentSubmenu = activeLink.closest('.submenu');
        if (parentSubmenu) {
            const parentLink = parentSubmenu.previousElementSibling;
            if (parentLink) parentLink.classList.add('active');
        }
    }

    // Xử lý phân quyền các menu
    setupMenuVisibility(user);

    // Thiết lập chức năng dropdown cho submenu
    setupDropdowns();

    // Cập nhật nội dung dashboard nếu đang ở trang dashboard
    if (currentPage === 'dashboard' || currentPage === '') {
        customizeDashboardForRole(user.role);
    }
}

// Chỉnh sửa hàm setupDropdowns() để xử lý dropdown sidebar đúng cách
function setupDropdowns() {
    console.log('Setting up dropdown menus...');

    // Chờ sidebar được tải hoàn toàn
    setTimeout(function () {
        // Xóa các event handler cũ để tránh gọi nhiều lần
        $('.has-submenu > .nav-link').off('click');

        // XÓA HẾT ACTIVE TRƯỚC KHI SET MỚI
        document.querySelectorAll('.nav-link.active').forEach(link => link.classList.remove('active'));

        // Thêm event handler mới - xử lý click vào item menu có submenu
        $('.has-submenu > .nav-link').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // XÓA HẾT ACTIVE TRƯỚC KHI SET MỚI (khi click menu cha)
            $('.nav-link.active').removeClass('active');
            // Lấy submenu kế tiếp của nav-link này
            const submenu = $(this).next('.submenu');

            // Đóng tất cả submenu khác trước khi mở cái này
            if (!submenu.hasClass('show')) {
                $('.has-submenu > .nav-link').not(this).removeClass('active');
                $('.submenu.show').not(submenu).removeClass('show');
            }

            // Toggle class show để hiển thị/ẩn submenu và thêm hiệu ứng xoay cho icon
            submenu.toggleClass('show');
            $(this).toggleClass('active');

            console.log('Submenu clicked:', submenu.attr('class'));
        });

        // Mở sẵn submenu cho trang đang active
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
        console.log('Current page:', currentPage);

        // Tìm link tương ứng với trang hiện tại
        const activeLink = $(`.nav-link[data-page="${currentPage}"]`);

        if (activeLink.length > 0) {
            console.log('Active link found:', activeLink.text());

            // Đánh dấu link hiện tại là active
            activeLink.addClass('active');

            // Nếu link nằm trong submenu, mở submenu đó
            const parentSubmenu = activeLink.closest('.submenu');
            if (parentSubmenu.length > 0) {
                parentSubmenu.addClass('show');
                parentSubmenu.prev('.nav-link').addClass('active');

                console.log('Opened parent submenu');
            }
        } else {
            console.log('Active link not found for page:', currentPage);
        }
    }, 300); // Tăng thời gian chờ để đảm bảo DOM đã được tải
}

function setupMenuVisibility(user) {
    // Ẩn tất cả menu và submenu trước
    document.querySelectorAll('.nav-item').forEach(item => {
        item.style.display = 'none';
    });

    // Sau đó mới hiển thị các menu có quyền truy cập
    const navItemsWithRole = document.querySelectorAll('.nav-item[data-role]');
    navItemsWithRole.forEach(item => {
        const allowedRoles = item.dataset.role.split(',');
        if (allowedRoles.includes(user.role)) {
            item.style.display = '';
        }
    });

    // Xử lý các menu không có data-role (menu mặc định)
    const navItemsWithoutRole = document.querySelectorAll('.nav-item:not([data-role])');
    navItemsWithoutRole.forEach(item => {
        item.style.display = '';
    });

    // 2. Xử lý tất cả các menu có thuộc tính data-page, kiểm tra theo ACCESS_RIGHTS
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        if (page && !hasAccessToPage(user.role, page)) {
            // Ẩn cả nav-item cha nếu có
            const parentItem = link.closest('.nav-item');
            if (parentItem) {
                parentItem.style.display = 'none';
            } else {
                link.style.display = 'none';
            }
        }
    });

    // 3. Xử lý các submenu (có cả trong dashboard)
    setTimeout(function () {
        const subMenus = document.querySelectorAll('.has-submenu');
        subMenus.forEach(menu => {
            // Kiểm tra xem submenu còn item nào hiển thị không
            let hasVisibleItems = false;
            const submenuItems = menu.querySelectorAll('.submenu .nav-item');

            submenuItems.forEach(item => {
                if (window.getComputedStyle(item).display !== 'none') {
                    hasVisibleItems = true;
                }
            });

            // Nếu không còn item nào hiển thị, ẩn cả menu cha
            if (!hasVisibleItems && submenuItems.length > 0) {
                menu.style.display = 'none';
            }
        });
    }, 100);
}

function customizeDashboardForRole(role) {
    // Các phần tử dashboard tương ứng với mỗi vai trò
    const dashboardElements = {
        [ROLES.MANAGER]: ['products', 'revenue', 'customers', 'suppliers', 'reports', 'all-activities'],
        [ROLES.SALES]: ['orders', 'customers', 'revenue', 'order-activities'],
        [ROLES.INVENTORY]: ['products', 'suppliers', 'inventory-activities'],
        [ROLES.CUSTOMER_SERVICE]: ['customers', 'customer-activities']
    };

    // Ẩn/hiện các phần tử dashboard dựa trên vai trò
    document.querySelectorAll('[data-section]').forEach(element => {
        const section = element.dataset.section;
        const visibleSections = dashboardElements[role] || [];

        if (visibleSections.includes(section)) {
            element.style.display = ''; // Hiển thị phần tử
        } else {
            element.style.display = 'none'; // Ẩn phần tử
        }
    });
}