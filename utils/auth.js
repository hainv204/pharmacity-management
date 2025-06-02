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
    'dashboard': [ROLES.MANAGER, ROLES.INVENTORY, ROLES.SALES, ROLES.CUSTOMER_SERVICE]
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
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }

    // Kiểm tra quyền truy cập trang hiện tại
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    // Các trang không cần kiểm tra quyền
    const publicPages = ['login', '', 'index'];

    if (!publicPages.includes(currentPage)) {
        if (!hasAccessToPage(user.role, currentPage)) {
            alert('Bạn không có quyền truy cập trang này.');
            window.location.href = '/pages/dashboard.html';
            return null;
        }
    }
    return user;
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

    // Lấy trang hiện tại
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    // Xử lý tất cả các menu trong hệ thống (kể cả trong dashboard và sidebar)
    setupMenuVisibility(user);

    // Đánh dấu menu active
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        if (page === currentPage) {
            link.classList.add('active');
        }
    });

    // Xử lý nội dung dashboard riêng theo vai trò
    if (currentPage === 'dashboard' || currentPage === '') {
        customizeDashboardForRole(user.role);
    }
}

// Hàm mới để xử lý việc hiển thị/ẩn menu
function setupMenuVisibility(user) {
    // 1. Xử lý menu có thuộc tính data-role
    const navItemsWithRole = document.querySelectorAll('.nav-item[data-role]');
    navItemsWithRole.forEach(item => {
        const allowedRoles = item.dataset.role.split(',');
        if (!allowedRoles.includes(user.role)) {
            item.style.display = 'none';
        }
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
    const subMenus = document.querySelectorAll('.has-submenu');
    subMenus.forEach(menu => {
        // Lấy tất cả các liên kết trong submenu
        const submenuLinks = menu.querySelectorAll('.nav-link');
        let hasVisibleItem = false;

        // Kiểm tra xem có ít nhất một liên kết con nào hiển thị không
        submenuLinks.forEach(link => {
            const style = window.getComputedStyle(link);
            if (style.display !== 'none') {
                const linkParent = link.closest('.nav-item');
                if (!linkParent || window.getComputedStyle(linkParent).display !== 'none') {
                    hasVisibleItem = true;
                }
            }
        });

        // Nếu không có liên kết con nào hiển thị, ẩn cả menu cha
        if (!hasVisibleItem && submenuLinks.length > 0) {
            menu.style.display = 'none';
        }
    });
}

function customizeDashboardForRole(role) {
    // Các phần tử dashboard tương ứng với mỗi vai trò
    const dashboardElements = {
        [ROLES.MANAGER]: ['orders', 'revenue', 'products', 'customers', 'reports', 'all-activities'],
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