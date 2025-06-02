$(document).ready(function () {
    // Ẩn sidebar ngay khi trang bắt đầu tải
    $('#sidebar').css('visibility', 'hidden');
    $('#header').load('/components/header.html');
    // Tải sidebar và xử lý phân quyền
    $('#sidebar').load('/components/sidebar.html', function () {
        setTimeout(function () {
            // Gọi hàm setupNavigation để xử lý phân quyền và submenu
            setupNavigation();
            // Cập nhật tên người dùng trong greeting
            // và hiển thị thời gian hiện tại theo định dạng tiếng Việt
            updateDateTime();
            // Hiển thị sidebar sau khi xử lý xong
            $('#sidebar').css('visibility', 'visible');
        }, 300); // Tăng thời gian chờ để đảm bảo xử lý hoàn tất
    });
    $('#footer').load('/components/footer.html');
    // Initialize tooltips
    tippy('[data-tippy-content]', {
        placement: 'top',
        arrow: true,
        theme: 'light',
        animation: 'scale'
    });
    // Add hover effects to action buttons
    $('.btn-action').hover(
        function () { $(this).addClass('shadow-sm'); },
        function () { $(this).removeClass('shadow-sm'); }
    );
    // Cập nhật thời gian hiện tại theo định dạng tiếng Việt
    function updateDateTime() {
        const now = new Date();
        const options = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const timeString = now.toLocaleDateString('vi-VN', options).replace(',', ' ·');
        // Xác định lời chào theo thời gian
        let greeting = "Chào buổi sáng";
        const hour = now.getHours();
        if (hour >= 12 && hour < 18)
            greeting = "Chào buổi chiều";
        else if (hour >= 18)
            greeting = "Chào buổi tối";
        // Cập nhật lời chào và thời gian
        const user = getCurrentUser();
        if (user) {
            const greetingText = document.querySelector('.greeting-text h1');
            const timeText = document.querySelector('.greeting-text p');

            if (greetingText)
                greetingText.textContent = `${greeting}, ${user.name}`;
            if (timeText)
                timeText.textContent = timeString;
        }
    }
    // Cập nhật thời gian mỗi giây
    setInterval(updateDateTime, 1000);
});