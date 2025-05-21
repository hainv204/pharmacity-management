// Authentication utilities

const ROLES = {
    MANAGER: 'manager',
    INVENTORY: 'inventory',
    SALES: 'sales',
    CUSTOMER_SERVICE: 'customer-service'
};

const ACCESS_RIGHTS = {
    // Medicine Management - Inventory, Sales, Manager can access
    'manage-medicine': [ROLES.MANAGER, ROLES.INVENTORY, ROLES.SALES],
    'manage-order': [ROLES.MANAGER, ROLES.SALES], // Order Management - Sales and Manager
    'manage-customer': [ROLES.MANAGER, ROLES.SALES, ROLES.CUSTOMER_SERVICE], // Customer Management - Sales, Customer Service, Manager
    'manage-supplier': [ROLES.MANAGER, ROLES.INVENTORY], // Supplier Management - Inventory and Manager
    'report': [ROLES.MANAGER], // Reports - Manager only
    // Dashboard access is role-specific - each role sees their relevant data
    'dashboard': [ROLES.MANAGER, ROLES.INVENTORY, ROLES.SALES, ROLES.CUSTOMER_SERVICE]
};

// Sample user data (in production, this would come from a backend)
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
        // Store user info in sessionStorage
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

function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }

    // Check if user has permission to access current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (currentPage !== 'login' && currentPage !== '') {
        if (!hasAccessToPage(user.role, currentPage)) {
            // Redirect to dashboard if user doesn't have access
            alert('You do not have permission to access this page.');
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

    // Update user name in header
    const currentUserElement = document.getElementById('currentUser');
    if (currentUserElement) {
        currentUserElement.textContent = user.name;
    }

    // Show/hide navigation items based on user role and access rights
    const navItems = document.querySelectorAll('[data-role]');
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    navItems.forEach(item => {
        const allowedRoles = item.dataset.role.split(',');
        const link = item.querySelector('.nav-link');
        const page = link ? link.getAttribute('data-page') : null;

        // Check both role and access rights
        let hasAccess = allowedRoles.includes(user.role);
        if (hasAccess && page && ACCESS_RIGHTS[page]) {
            hasAccess = ACCESS_RIGHTS[page].includes(user.role);
        }

        if (!hasAccess) {
            item.style.display = 'none';
        } else if (link && page === currentPage) {
            link.classList.add('active');
        }
    });

    // Handle role-specific dashboard content
    if (currentPage === 'dashboard') {
        customizeDashboardForRole(user.role);
    }
}

function customizeDashboardForRole(role) {
    // This function customizes dashboard elements based on user role
    const dashboardElements = {
        [ROLES.MANAGER]: ['orders', 'revenue', 'products', 'customers', 'reports', 'all-activities'],
        [ROLES.SALES]: ['orders', 'customers', 'revenue', 'order-activities'],
        [ROLES.INVENTORY]: ['products', 'suppliers', 'inventory-activities'],
        [ROLES.CUSTOMER_SERVICE]: ['customers', 'customer-activities']
    };

    // Hide all optional dashboard sections first
    document.querySelectorAll('[data-section]').forEach(element => {
        const section = element.dataset.section;
        if (dashboardElements[role] && dashboardElements[role].includes(section)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
}