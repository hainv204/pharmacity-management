// Hàm thêm thuốc vào bảng, cho phép truyền id bảng (mặc định là 'medicineList')
function addMedicineToEditTable(id, name, price, quantity, targetListId = 'medicineList') {
    // Kiểm tra mã thuốc đã tồn tại chưa
    const existingRow = $('#' + targetListId).find(`tr#${id}`);
    if (existingRow.length > 0) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Mã thuốc đã tồn tại trong danh sách!', 'error');
        return false;
    }
    // Kiểm tra mã thuốc có tồn tại trong cơ sở dữ liệu không
    if (!id || id.length < 3) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc không tồn tại trong cơ sở dữ liệu', 'error');
        return false;
    }
    // Tính thành tiền
    const totalPrice = price * quantity;
    // Tạo HTML cho dòng mới
    const newRow = `
        <tr id="${id}">
            <td>${id}</td>
            <td>${name}</td>
            <td>${price.toLocaleString('vi-VN')} đ</td>
            <td>
                <input type="number" class="form-control form-control-sm quantity-input" 
                    value="${quantity}" min="1" style="width: 70px">
            </td>
            <td>${totalPrice.toLocaleString('vi-VN')} đ</td>
            <td>
            <button type="button" class="btn-action trash-can delMedicine" data-bs-toggle="tooltip" title="Xoá thuốc">
                <i class="fas fa-trash-alt"></i>
            </button>
            </td>
        </tr>
    `;
    // Thêm dòng mới vào bảng
    $('#' + targetListId).append(newRow);
    // Cập nhật tổng tiền
    if (targetListId === 'medicineList') {
        updateEditTotals();
    } else if (targetListId === 'editMedicineList') {
        updateEditInvoiceTotals();
    }
    // Hiển thị thông báo thành công
    showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã thêm thuốc vào hoá đơn thành công!');
}

// Cập nhật tổng tiền khi chỉnh sửa
function updateEditTotals() {
    let subtotal = 0;
    // Tính tổng phụ từ bảng thuốc trong modal lập hoá đơn
    $('#medicineList tr').each(function () {
        const priceText = $(this).find('td:eq(4)').text();
        const price = parseFloat(priceText.replace(/[^0-9]/g, ''));
        subtotal += price;
    });

    // Hiển thị tổng phụ
    // Tổng phụ: dòng đầu tiên của tfoot
    $('#medicineList').closest('table').find('tfoot tr:eq(0) td:last').text(subtotal.toLocaleString('vi-VN') + 'đ');

    // Lấy giá trị giảm giá
    const discount = $('#discountSelect').val();
    let discountAmount = 0;
    let discountText = '';
    if (discount === 'percent10') {
        discountAmount = subtotal * 0.1;
        discountText = '-' + discountAmount.toLocaleString('vi-VN') + 'đ (10%)';
    } else if (discount === 'amount20k') {
        discountAmount = 20000;
        discountText = '-' + discountAmount.toLocaleString('vi-VN') + 'đ';
    } else if (discount === 'freeship') {
        discountText = 'Miễn phí giao hàng';
    } else {
        discountText = '0đ';
    }

    // Hiển thị giảm giá
    $('#medicineList').closest('table').find('tfoot tr:eq(1) td:last').text(discountText);

    // Tính tổng thanh toán
    const finalTotal = subtotal - discountAmount;
    // Hiển thị tổng thanh toán
    $('#medicineList').closest('table').find('tfoot tr:eq(2) td:last').text(finalTotal.toLocaleString('vi-VN') + 'đ');
}

// Gắn sự kiện cho các phần tử trong bảng thuốc khi trang tải
// updateMedicineTotal();
// THÊM HÀM NÀY - Hàm cập nhật thành tiền khi thay đổi số lượng
function updateMedicineTotal(input) {
    // Xóa tất cả thông báo lỗi cũ
    $(input).removeClass('is-invalid');
    $(input).next('.invalid-feedback').remove();

    const row = $(input).closest('tr');
    const price = parseFloat(row.find('td:eq(2)').text().replace(/[^\d]/g, ''));
    const quantity = parseInt($(input).val()) || 0;

    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0) {
        $(input).val(1);
        addInvalidFeedback($(input), "Số lượng phải là số nguyên dương");
        return;
    }

    // Tính và cập nhật thành tiền
    const totalPrice = price * quantity;
    row.find('td:eq(4)').text(totalPrice.toLocaleString('vi-VN') + 'đ');

    // Cập nhật tổng tiền đơn hàng
    updateEditTotals();
}

// Chọn thuốc từ danh sách kết quả tìm kiếm
$(document).on('click', '.select-medicine', function () {
    const id = $(this).data('id');
    const name = $(this).data('name');
    const price = $(this).data('price');

    // Hiển thị thông tin thuốc đã chọn
    $('#selectedMedicineId').text(id);
    $('#selectedMedicineName').text(name);
    $('#selectedMedicinePrice').text((price).toLocaleString('vi-VN') + ' đ');
    $('#selectedMedicineQuantity').val(1);

    // Hiển thị phần thông tin thuốc, ẩn thông báo chưa chọn thuốc
    $('#noMedicineSelected').addClass('d-none');
    $('#medicineDetails').removeClass('d-none');
});

// Hàm xem chi tiết hoá đơn từ lịch sử giao dịch
window.viewInvoiceDetails = function (invoiceId) {
    // Đổi tab sang chi tiết hoá đơn
    $('#invoiceDetailTabs button[data-bs-target="#details"]').tab('show');

    // Cuộn lên đầu modal
    $('#invoiceDetailModal .modal-body').scrollTop(0);
};

// popup thông báo hiển thị sau khi thanh toán
function completeInvoice(paymentMethod) {
    // Kiểm tra xem có phải đang thanh toán từ modal chỉnh sửa không
    const editInvoiceId = sessionStorage.getItem('currentEditInvoiceId');

    if (editInvoiceId) {
        // Đang thanh toán từ modal chỉnh sửa
        updateInvoiceStatusAfterPayment(editInvoiceId, paymentMethod);
        // Xóa ID hóa đơn đã lưu
        sessionStorage.removeItem('currentEditInvoiceId');
    } else {
        // Lưu thông tin hóa đơn vào cơ sở dữ liệu (trong thực tế)

        // Lấy dữ liệu từ form lập hoá đơn
        const invoiceId = 'HD' + (Math.floor(Math.random() * 900) + 100);
        // Lấy ngày lập từ input, chuyển định dạng
        const dateRaw = $('#invoiceDate').val();
        const date = formatDateTimeVN(dateRaw) || formatDateTimeVN(new Date().toISOString().slice(0, 16));
        const customer = $('#customerName').val() || 'Khách lẻ';
        // Lấy đúng tổng thanh toán từ dòng cuối cùng của tfoot
        const total = $('#createInvoiceModal table tfoot tr:last td:last').text().trim() || '0đ';
        const discount = $('#discountSelect option:selected').text() || 'Không có';
        let statusText = 'Đã thanh toán';
        let statusClass = 'text-success';
        if (paymentMethod === 'cash' || paymentMethod === 'card' || paymentMethod === 'transfer' || paymentMethod === 'momo') {
            statusText = 'Đã thanh toán';
            statusClass = 'text-success';
        }
        // Thêm dòng mới vào bảng hoá đơn
        const newRow = `
        <tr>
            <td>${invoiceId}</td>
            <td>${date}</td>
            <td>${customer}</td>
            <td>${total}</td>
            <td>${discount}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-action view" data-bs-toggle="tooltip" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-bs-toggle="tooltip" title="Chỉnh sửa" disabled>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action trash-can" data-bs-toggle="tooltip" title="Xoá đơn" disabled>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
        $('#invoiceTable tbody').prepend(newRow);

        // Hiển thị thông báo thành công
        const methodText = {
            'cash': 'tiền mặt',
            'card': 'thẻ ngân hàng',
            'transfer': 'chuyển khoản',
            'momo': 'ví MoMo'
        };
        setTimeout(function () {
            window.showToast(`<i class="fas fa-check-circle text-success me-2"></i> Lập hóa đơn thành công! Thanh toán bằng ${methodText[paymentMethod]}.`);
        }, 300);

        // Reset form lập hóa đơn cho lần sử dụng tiếp theo
        resetInvoiceForm();
    }
    // Đóng modal lập hóa đơn nếu đang mở
    $('#createInvoiceModal').modal('hide');
}

// Thêm hàm showToast toàn cục để có thể truy cập từ bất kỳ đâu
window.showToast = function (message, type = 'success') {
    // Tạo toast nếu chưa có
    if ($('#customToast').length === 0) {
        const toastHtml = `
        <div class="toast align-items-center border-0 bg-white" id="customToast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body"></div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
        $('.toast-container').append(toastHtml);
    }

    const toast = $('#customToast');

    // Cập nhật nội dung toast
    toast.find('.toast-body').html(message);

    // Cập nhật style dựa trên type
    if (type === 'error') {
        toast.removeClass('bg-success bg-white').addClass('bg-danger text-white');
    } else {
        toast.removeClass('bg-danger text-white').addClass('bg-white');
    }

    // Hiển thị toast
    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000
    });
    bsToast.show();
};
// Tải các thành phần chung
$('#header').load('/components/header.html');
$('#sidebar').load('/components/sidebar.html', function () {
    // Ẩn sidebar ngay khi trang bắt đầu tải
    $('#sidebar').css('visibility', 'hidden');

    // Đợi một chút để đảm bảo DOM được cập nhật đầy đủ
    setTimeout(function () {
        // Gọi hàm setupNavigation để xử lý phân quyền và submenu
        setupNavigation();

        // Hiển thị sidebar sau khi xử lý xong
        $('#sidebar').css('visibility', 'visible');
    }, 300); // Tăng thời gian chờ để đảm bảo xử lý hoàn tất
});
$('#footer').load('/components/footer.html');

// Hiển thị/ẩn nút sửa dựa trên trạng thái hóa đơn
function updateEditButtonStatus() {
    $('#invoiceTable tbody tr').each(function () {
        const status = $(this).find('.status-badge').attr('class');
        const editButton = $(this).find('.btn-action.edit');

        // Chỉ cho phép sửa các hóa đơn đang xử lý
        if (status.includes('status-processing')) {
            editButton.prop('disabled', false);
            editButton.attr('data-bs-toggle', 'tooltip');
            editButton.attr('title', 'Chỉnh sửa');
        } else {
            editButton.prop('disabled', true);
            editButton.attr('data-bs-toggle', 'tooltip');
            editButton.attr('title', 'Không thể chỉnh sửa hóa đơn đã thanh toán hoặc đã hủy');
        }
    });
}
// Cập nhật hiển thị trạng thái hoá đơn
function updateInvoiceStatusDisplay(row, status) {
    // Xoá tất cả class trạng thái cũ
    row.find('td:nth-child(6) span').removeClass('text-success text-warning text-danger');

    // Cập nhật text và class dựa vào trạng thái mới
    if (status === 'completed') {
        row.find('td:nth-child(6) span').text('Đã thanh toán').addClass('text-success');
    } else if (status === 'processing') {
        row.find('td:nth-child(6) span').text('Đang xử lý').addClass('text-warning');
    } else if (status === 'cancelled') {
        row.find('td:nth-child(6) span').text('Đã huỷ').addClass('text-danger');
    }

    // Cập nhật trạng thái của các nút
    updateEditButtonStatus();
}
// Gọi hàm này sau khi tải dữ liệu
$(document).ready(function () {
    // ...các code khởi tạo khác
    updateEditButtonStatus();
});

// Xử lý reset filter
$('#resetFilter').click(function () {
    $('#advancedFilterForm')[0].reset();
});
// Thêm vào script
function validateInvoiceForm() {
    let isValid = true;
    // Xóa tất cả thông báo lỗi cũ
    $('.invalid-feedback').remove();
    $('.is-invalid').removeClass('is-invalid');
    // Kiểm tra khách hàng
    const customerName = $('#customerName').val();
    if (!customerName) {
        // Phản hồi trực tiếp bên dưới trường
        addInvalidFeedback($('#customerName'), "Vui lòng nhập tên khách hàng để lập hóa đơn");
        isValid = false;
    } else if (customerName.length > 100) {
        // Phản hồi trực tiếp bên dưới trường
        addInvalidFeedback($('#customerName'), "Tên khách hàng không được vượt quá 100 ký tự");
        isValid = false;
    }

    // Kiểm tra số điện thoại nếu có nhập
    const customerPhone = $('#customerPhone').val();
    if (customerPhone && !/^0\d{9}$/.test(customerPhone)) {
        // Phản hồi trực tiếp bên dưới trường
        addInvalidFeedback($('#customerPhone'), "Số điện thoại phải chứa 10 chữ số và bắt đầu bằng số 0");
        isValid = false;
    }

    // Kiểm tra giới tính nếu là khách hàng mới
    if ($('#newCustomer').is(':checked')) {
        if (!$('#customerGender').val()) {
            // Phản hồi trực tiếp bên dưới trường
            addInvalidFeedback($('#customerGender'), "Vui lòng chọn giới tính");
            isValid = false;
        }
    }

    // Kiểm tra danh sách thuốc
    if ($('#medicineList tr').length === 0) {
        // Thông báo toast
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Hóa đơn phải có ít nhất một sản phẩm', 'error');
        isValid = false;
    }

    // Kiểm tra số lượng
    $('.quantity-input').each(function () {
        const value = $(this).val();
        if (!value || isNaN(value) || parseInt(value) <= 0) {
            // Phản hồi trực tiếp bên dưới trường
            addInvalidFeedback($(this), "Số lượng phải là số dương");
            isValid = false;
            return false; // break loop
        }
    });

    // Kiểm tra hình thức thanh toán
    if (!$('#paymentMethodSelect').val()) {
        // Phản hồi trực tiếp bên dưới trường
        addInvalidFeedback($('#paymentMethodSelect'), "Vui lòng chọn hình thức thanh toán");
        isValid = false;
    }

    return isValid;
}
// Hàm thêm phản hồi không hợp lệ cho một trường
function addInvalidFeedback(element, message) {
    element.addClass('is-invalid');
    element.after(`<div class="invalid-feedback">${message}</div>`);
}
// 6. Reset form khi đóng modal
$('#paymentModal, #cashPaymentModal, #transferPaymentModal, #momoPaymentModal').on('hidden.bs.modal', function () {
    resetPaymentForms();
});

// Format số thẻ tự động
$('#cardNumber').on('input', function () {
    // Lưu vị trí con trỏ
    const start = this.selectionStart;
    const end = this.selectionEnd;

    // Xóa tất cả các ký tự không phải số
    let value = $(this).val().replace(/[^\d]/g, '');

    // Format số thẻ với khoảng trắng sau mỗi 4 số
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }

    // Cập nhật giá trị
    $(this).val(formattedValue);

    // Điều chỉnh vị trí con trỏ sau khi format
    // Nếu vừa thêm khoảng trắng, tăng vị trí con trỏ lên 1
    const newLength = formattedValue.length;
    const oldLength = this.value.length;

    const diff = newLength - oldLength;
    this.selectionStart = start + diff;
    this.selectionEnd = end + diff;
});

// Các hàm xử lý thanh toán
function processPayment() {
    showPaymentProcessing();

    // Mô phỏng gọi API thanh toán (trong thực tế)
    setTimeout(function () {
        // Giả định  90% thanh toán thành công
        const isSuccessful = Math.random() < 0.9;

        if (isSuccessful) {
            handlePaymentSuccess();
        } else {
            handlePaymentFailure();
        }
    }, 2500);
}

function handlePaymentSuccess() {
    // Thời gian xử lý 5 giây rồi tự động đóng modal và hoàn tất
    setTimeout(function () {
        // Ẩn overlay loading
        $('#paymentForm').find('.position-absolute').remove();

        // Reset form thanh toán
        resetPaymentForms();

        // Đóng modal thanh toán
        $('#paymentModal').modal('hide');

        // Hoàn tất hóa đơn
        completeInvoice('card');
    }, 3000);
}

function handlePaymentFailure() {
    // Ẩn overlay loading
    $('#paymentForm').find('.position-absolute').remove();

    // Hiển thị thông báo lỗi
    const errorAlert = $('<div class="alert alert-danger mt-3">' +
        '<div class="d-flex">' +
        '<div class="me-3">' +
        '<i class="fas fa-exclamation-circle fs-3"></i>' +
        '</div>' +
        '<div>' +
        '<h6 class="alert-heading mb-1">Thanh toán thất bại!</h6>' +
        '<p class="mb-0">Vui lòng kiểm tra lại thông tin thẻ hoặc liên hệ với ngân hàng của bạn.</p>' +

        '</div>' +
        '</div>' +
        '</div>');

    $('#paymentForm').append(errorAlert);
}

function resetInvoiceForm() {
    // Reset thông tin khách hàng
    $('#customerName').val('');
    $('#customerPhone').val('');
    $('#customerEmail').val('');
    $('#customerGender').val('');
    $('#newCustomer').prop('checked', false);
    $('#newCustomerInfo').addClass('d-none');

    // Reset danh sách thuốc
    // $('#medicineList').html(''); // Bỏ comment nếu muốn xóa danh sách thuốc

    // Reset thông tin thanh toán
    $('#invoiceDate').val(getCurrentDate());
    $('#paymentMethodSelect').val('cash').trigger('change');
    $('#discountSelect').val('');
    $('#autoDiscount').prop('checked', false);
    $('#invoiceNotes').val('');

    // Reset các tổng tiền
    // updateEditTotals(); // Bỏ comment nếu muốn reset tổng tiền
}

// Hàm kiểm tra thông tin thẻ
function validateCardInfo() {
    $('.invalid-feedback').remove();
    $('.is-invalid').removeClass('is-invalid');
    let isValid = true;

    const $bankName = $('#bankName');
    if (!$bankName.val()) {
        addInvalidFeedback($bankName, "Ngân hàng không được để trống");
        isValid = false;
    }

    const $cardType = $('#cardType');
    if (!$cardType.val()) {
        addInvalidFeedback($cardType, "Loại thẻ không được để trống");
        isValid = false;
    }

    const $cardNumber = $('#cardNumber');
    if (!$cardNumber.val()) {
        addInvalidFeedback($cardNumber, "Vui lòng nhập số thẻ!");
        isValid = false;
    } else if (!/^\d{16}$/.test($cardNumber.val().replace(/\s/g, ''))) {
        addInvalidFeedback($cardNumber, "Số thẻ phải chứa 16 chữ số");
        isValid = false;
    }

    const $cardHolderName = $('#cardHolderName');
    if (!$cardHolderName.val()) {
        addInvalidFeedback($cardHolderName, "Tên chủ thẻ phải là chữ hoa không dấu");
        isValid = false;
    }

    const $expiryDate = $('#expiryDate');
    if (!$expiryDate.val()) {
        addInvalidFeedback($expiryDate, "Vui lòng chọn ngày hết hạn!");
        isValid = false;
    }

    const $cvv = $('#cvv');
    if (!$cvv.val()) {
        addInvalidFeedback($cvv, "Vui lòng nhập mã CVV");
        isValid = false;
    } else if (!/^\d{3}$/.test($cvv.val())) {
        addInvalidFeedback($cvv, "Mã bảo mật phải chứa 3 chữ số");
        isValid = false;
    }

    const $phoneNumber = $('#phoneNumber');
    if (!$phoneNumber.val()) {
        addInvalidFeedback($phoneNumber, "Vui lòng nhập số điện thoại!");
        isValid = false;
    } else if (!/^0\d{9}$/.test($phoneNumber.val())) {
        addInvalidFeedback($phoneNumber, "Số điện thoại phải chứa 10 chữ số");
        isValid = false;
    }
    return isValid;
}

// Hàm tính tiền thối cho thanh toán tiền mặt
function calculateChange() {
    const totalAmount = parseFloat($('#cashPaymentTotalAmount').text().replace(/[^\d]/g, ''));
    const received = parseFloat($('#cashReceived').val().replace(/[^\d]/g, '')) || 0;

    const change = received - totalAmount;

    if (change >= 0) {
        $('#cashChange').val(change.toLocaleString('vi-VN') + ' đ');
    } else {
        $('#cashChange').val('0đ');
    }
}

// Xử lý thanh toán tiền mặt
function completeCashPayment() {
    // Xóa tất cả thông báo lỗi cũ
    $('.invalid-feedback').remove();
    $('.is-invalid').removeClass('is-invalid');

    const totalAmount = parseFloat($('#cashPaymentTotalAmount').text().replace(/[^\d]/g, ''));
    const cashReceived = $('#cashReceived');
    const received = parseFloat(cashReceived.val().replace(/[^\d]/g, '')) || 0;

    if (received < totalAmount) {
        // Phản hồi trực tiếp
        addInvalidFeedback(cashReceived, "Số tiền nhập vào phải lớn hơn hoặc bằng tổng thanh toán");
        return false;
    }

    // Reset form thanh toán
    resetPaymentForms();
    // Đóng modal thanh toán
    $('#cashPaymentModal').modal('hide');

    // Hoàn tất hóa đơn
    completeInvoice('cash');

    return true;
}

// Xử lý thanh toán chuyển khoản
function completeTransferPayment() {
    // Xóa thông báo lỗi cũ
    $('.invalid-feedback').remove();
    $('.is-invalid').removeClass('is-invalid');

    let hasError = false;

    // Kiểm tra mã giao dịch (bắt buộc nhập)
    const reference = $('#transferReference');
    if (!/^\d+$/.test(reference.val())) {
        addInvalidFeedback(reference, "Mã giao dịch phải là chữ số");
        hasError = true;
    }

    // Kiểm tra thời gian chuyển khoản (bắt buộc nhập)
    const transferTime = $('#transferTime');
    if (!transferTime.val()) {
        addInvalidFeedback(transferTime, "Vui lòng nhập thời gian chuyển khoản");
        hasError = true;
    }

    // Nếu có lỗi validate thì không thực hiện tiếp
    if (hasError) return;

    // Kiểm tra đã tick xác nhận hoàn tất chuyển khoản chưa
    if (!$('#transferCompleted').is(':checked')) {
        showToast('Vui lòng xác nhận tôi đã hoàn tất chuyển khoản!', 'error');
        return;
    }

    showTransferProcessing();

    setTimeout(function () {
        resetPaymentForms();
        $('#transferPaymentModal').modal('hide');
        completeInvoice('transfer');
    }, 2000);
}

// Xử lý thanh toán MoMo
function completeMomoPayment() {
    // Hiển thị loading
    showMomoProcessing();

    // Giả lập xử lý thanh toán trong 5 giây
    setTimeout(function () {
        // Reset form thanh toán
        resetPaymentForms();
        // Đóng modal thanh toán
        $('#momoPaymentModal').modal('hide');

        // Hoàn tất hóa đơn
        completeInvoice('momo');
    }, 5000);
}

function resetPaymentForms() {
    // console.log("Đang reset form thanh toán...");

    // Xóa dữ liệu form thanh toán thẻ ngân hàng
    $('#bankName').val('');
    $('#cardType').val('');
    $('#cardNumber').val('');
    $('#cardHolderName').val('');
    $('#expiryDate').val('');
    $('#cvv').val('');
    $('#phoneNumber').val('');
    $('#saveCardInfo').prop('checked', false);

    // Xóa tất cả các thông báo và overlay
    $('#paymentForm .alert, #paymentForm .position-absolute').remove();
    $('#transferPaymentForm .alert, #transferPaymentForm .position-absolute').remove();
    $('#momoPaymentForm .alert, #momoPaymentForm .position-absolute').remove();
    $('#transferPaymentModal .modal-body .position-absolute').remove();
    $('#momoPaymentModal .modal-body .position-absolute').remove();

    // Reset form tiền mặt
    $('#cashReceived').val('');
    $('#cashChange').val('');
    $('#printReceipt').prop('checked', true);

    // Reset form chuyển khoản
    $('#transferReference').val('');
    $('#transferTime').val('');
    $('#transferCompleted').prop('checked', false);

    // Reset form MoMo
    $('#momoCompleted').prop('checked', false);
}

// Hiển thị hiệu ứng loading khi xử lý thanh toán chuyển khoản
function showTransferProcessing() {
    // Xóa overlay cũ nếu có
    $('#transferPaymentForm').find('.position-absolute').remove();

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-primary mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh giao dịch...</p>' +
        '</div>' +
        '</div>');

    $('#transferPaymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}

// Hiển thị hiệu ứng loading khi xử lý thanh toán MoMo
function showMomoProcessing() {

    // Xóa overlay cũ nếu có
    $('#momoPaymentForm').find('.position-absolute').remove();

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-primary mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh thanh toán MoMo...</p>' +
        '</div>' +
        '</div>');

    $('#momoPaymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}
// Hàm in hóa đơn
function printInvoice() {
    // Lấy thông tin hóa đơn từ modal chi tiết
    const invoiceId = $('#detailInvoiceId').text().trim();
    const customerName = $('#detailCustomer').text().trim();
    const customerPhone = $('#detailPhone').text().trim();
    const invoiceDate = $('#detailDate').text().trim();
    const discount = $('#invoiceDetailModal #details table tfoot tr:nth-child(2) td:last-child').text().trim();
    const statusText = $('#detailStatus').text().trim();
    const statusClass = $('#detailStatus').attr('class') || '';

    // Lấy hình thức thanh toán (giả lập theo ưu đãi hoặc trạng thái nếu không có cột riêng)
    let paymentMethod = 'Tiền mặt';
    if (discount.toLowerCase().includes('momo')) paymentMethod = 'Ví MoMo';
    else if (discount.toLowerCase().includes('chuyển khoản')) paymentMethod = 'Chuyển khoản';
    else if (discount.toLowerCase().includes('thẻ')) paymentMethod = 'Thẻ ngân hàng';

    // Tạo PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Thêm font hỗ trợ tiếng Việt
    doc.addFont('ArialUnicodeMS', 'Arial', 'normal');
    doc.setFont('Arial');

    // Thêm thông tin cửa hàng
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HIỆU THUỐC PHARMACITY', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Địa chỉ: 175 Tây Sơn, Đống Đa, Hà Nội', 105, 25, { align: 'center' });
    doc.text('SĐT: 028 1234 5678', 105, 30, { align: 'center' });

    // Thêm đường kẻ ngăn cách
    doc.line(20, 35, 190, 35);

    // Thêm tiêu đề hóa đơn
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HÓA ĐƠN BÁN HÀNG', 105, 45, { align: 'center' });

    // Thêm thông tin hóa đơn
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mã hóa đơn: ${invoiceId}`, 20, 55);
    doc.text(`Ngày lập: ${invoiceDate}`, 150, 55);
    doc.text(`Khách hàng: ${customerName}`, 20, 62);
    doc.text(`Số điện thoại: ${customerPhone}`, 20, 69);
    doc.text(`Hình thức thanh toán: ${paymentMethod}`, 150, 69);

    // Thêm đường kẻ ngăn cách
    doc.line(20, 75, 190, 75);

    // Thêm header bảng danh sách thuốc
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STT', 20, 82);
    doc.text('Tên thuốc', 35, 82);
    doc.text('Đơn giá', 115, 82);
    doc.text('Số lượng', 140, 82);
    doc.text('Thành tiền', 170, 82);

    // Thêm đường kẻ ngăn cách
    doc.line(20, 85, 190, 85);

    // Lấy danh sách thuốc từ modal
    const items = [];
    $('#invoiceDetailModal #details table tbody tr').each(function (index) {
        const item = {
            name: $(this).find('td:nth-child(2)').text().trim(),
            price: $(this).find('td:nth-child(3)').text().trim(),
            quantity: $(this).find('td:nth-child(4)').text().trim(),
            total: $(this).find('td:nth-child(5)').text().trim()
        };
        items.push(item);
    });

    // Thêm danh sách thuốc vào PDF
    let y = 92;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    items.forEach((item, index) => {
        doc.text((index + 1).toString(), 20, y);

        // Xử lý tên thuốc dài bằng cách ngắt dòng
        const nameLines = doc.splitTextToSize(item.name, 75);
        doc.text(nameLines, 35, y);

        // Điều chỉnh vị trí y nếu tên thuốc có nhiều dòng
        const lineHeight = nameLines.length > 1 ? nameLines.length * 5 : 0;

        doc.text(item.price, 115, y);
        doc.text(item.quantity, 140, y);
        doc.text(item.total, 170, y);

        y += 7 + lineHeight;

        // Thêm đường chấm ngăn cách giữa các sản phẩm
        if (index < items.length - 1) {
            doc.setLineDashPattern([1, 1], 0);
            doc.line(20, y - 3, 190, y - 3);
            doc.setLineDashPattern([0], 0); // Reset về đường liền
        }
    });

    // Thêm đường kẻ ngăn cách
    doc.line(20, y, 190, y);
    y += 7;

    // Lấy thông tin tổng tiền từ modal
    const subtotal = $('#invoiceDetailModal tfoot tr:nth-child(1) td:last-child').text().trim();
    const discountText = $('#invoiceDetailModal tfoot tr:nth-child(2) td:last-child').text().trim();
    const total = $('#invoiceDetailModal tfoot tr:nth-child(3) td:last-child').text().trim();

    // Thêm phần tổng tiền
    doc.setFontSize(10);
    doc.text('Tổng phụ:', 140, y);
    doc.text(subtotal, 170, y);
    y += 7;

    doc.text('Giảm giá:', 140, y);
    doc.text(discountText, 170, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Tổng thanh toán:', 140, y);
    doc.text(total, 170, y);
    y += 15;

    // Thêm phần ghi chú nếu có
    const note = $('#invoiceDetailModal .card-body:contains("Ghi chú") p.mb-0').text().trim();
    if (note) {
        doc.setFont('helvetica', 'normal');
        doc.text('Ghi chú:', 20, y);
        y += 7;

        const noteLines = doc.splitTextToSize(note, 170);
        doc.text(noteLines, 20, y);
        y += noteLines.length * 5 + 10;
    } else {
        y += 10;
    }

    // Thêm phần chữ ký
    doc.text('Người bán', 40, y, { align: 'center' });
    doc.text('Khách hàng', 160, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8);
    doc.text('(Ký, ghi rõ họ tên)', 40, y, { align: 'center' });
    doc.text('(Ký, ghi rõ họ tên)', 160, y, { align: 'center' });

    // Thêm footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!', 105, 287, { align: 'center' });

    // Mở file PDF trong tab mới (không hiển thị modal)
    try {
        window.open(URL.createObjectURL(doc.output('blob')), '_blank');
        showToast('<i class="fas fa-check-circle text-success me-2"></i> In hoá đơn thành công!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Có lỗi xảy ra khi in hoá đơn!', 'error');
    }
}


// Thêm hàm này vào cuối file invoice.js
function initializeInvoiceEvents() {
    // Xử lý khi click vào nút Thanh toán trong modal chỉnh sửa
    $(document).on('click', '#proceedToPaymentBtn', function () {
        processEditInvoicePayment();
    });
    // console.log("Đang khởi tạo các sự kiện cho quản lý hóa đơn...");

    // Khởi tạo tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Khởi tạo date picker
    flatpickr('.datepicker', {
        locale: 'vn',
        dateFormat: "d/m/Y",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true
    });

    // Date range picker
    flatpickr('.datepicker-range', {
        locale: 'vn',
        mode: "range",
        dateFormat: "d/m/Y",
        defaultDate: ["01/05/2025", "02/06/2025"],
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true
    });

    $(document).on('click', '.btn-action.view', function () {
        const row = $(this).closest('tr');
        const invoiceId = row.find('td:eq(0)').text().replace('#', '').trim();
        const date = row.find('td:eq(1)').text().trim();
        const customer = row.find('td:eq(2)').text().trim();
        const discount = row.find('td:eq(4)').text().trim();
        const statusText = row.find('td:eq(5)').text().trim();
        let paymentMethod = 'Tiền mặt';
        if (discount.toLowerCase().includes('momo')) paymentMethod = 'Ví MoMo';
        else if (discount.toLowerCase().includes('chuyển khoản')) paymentMethod = 'Chuyển khoản';
        else if (discount.toLowerCase().includes('thẻ')) paymentMethod = 'Thẻ ngân hàng';

        // --- BẮT ĐẦU: Render lại danh sách thuốc và tổng tiền demo ---
        // Demo: lấy dữ liệu mẫu cho từng hóa đơn (bạn nên thay bằng dữ liệu thực tế nếu có)
        let medicines = [];
        if (invoiceId === 'HD001') {
            medicines = [
                { id: 'MED001', name: 'Paracetamol 500mg', price: 2000, quantity: 50, total: 100000 },
                { id: 'MED010', name: 'Amoxicillin 500mg', price: 3000, quantity: 30, total: 90000 },
                { id: 'MED022', name: 'Vitamin C 1000mg', price: 15000, quantity: 4, total: 60000 }
            ];
        } else if (invoiceId === 'HD002') {
            medicines = [
                { id: 'MED015', name: 'Vitamin C 500mg', price: 15000, quantity: 30, total: 450000 }
            ];
        } else if (invoiceId === 'HD003') {
            medicines = [
                { id: 'MED005', name: 'Efferalgan 500mg', price: 9000, quantity: 20, total: 180000 }
            ];
        } else if (invoiceId === 'HD004') {
            medicines = [
                { id: 'MED007', name: 'Panadol Extra', price: 22000, quantity: 10, total: 220000 }
            ];
        } else if (invoiceId === 'HD005') {
            medicines = [
                { id: 'MED009', name: 'Decolgen', price: 15000, quantity: 10, total: 150000 }
            ];
        } else {
            medicines = [
                { id: 'MED001', name: 'Paracetamol 500mg', price: 2000, quantity: 5, total: 10000 }
            ];
        }
        // Tính lại tổng phụ, giảm giá, tổng thanh toán
        let subtotal = medicines.reduce((sum, m) => sum + m.total, 0);
        let discountText = discount;
        let total = subtotal;
        if (discount.toLowerCase().includes('10%')) {
            discountText = '-' + (subtotal * 0.1).toLocaleString('vi-VN') + 'đ (10%)';
            total = subtotal - subtotal * 0.1;
        } else if (discount.toLowerCase().includes('20.000')) {
            discountText = '-20.000đ';
            total = subtotal - 20000;
        } else if (discount.toLowerCase().includes('miễn phí')) {
            discountText = 'Miễn phí giao hàng';
        } else if (discount.toLowerCase().includes('không có')) {
            discountText = '0đ';
        }
        // Render lại tbody
        let tbodyHtml = medicines.map(m => `
            <tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td class="text-end">${m.price.toLocaleString('vi-VN')}đ</td>
                <td class="text-center">${m.quantity}</td>
                <td class="text-end">${m.total.toLocaleString('vi-VN')}đ</td>
            </tr>
        `).join('');
        $('#invoiceDetailModal #details table tbody').html(tbodyHtml);
        // Render lại tfoot
        $('#invoiceDetailModal #details table tfoot tr:nth-child(1) td:last-child').text(subtotal.toLocaleString('vi-VN') + 'đ');
        $('#invoiceDetailModal #details table tfoot tr:nth-child(2) td:last-child').text(discountText);
        $('#invoiceDetailModal #details table tfoot tr:nth-child(3) td:last-child').text(total.toLocaleString('vi-VN') + 'đ');
        // --- KẾT THÚC: Render lại danh sách thuốc và tổng tiền ---

        // Set dữ liệu động cho modal xem chi tiết
        $('#detailInvoiceId').text(invoiceId);
        $('#detailCustomer').text(customer);
        $('#detailPhone').text(''); // Nếu có cột số điện thoại thì lấy, nếu không để trống
        $('#detailDate').text(date);
        $('#detailPayment').text(paymentMethod);
        $('#detailStatus').removeClass('text-success text-warning text-danger');
        if (statusText.toLowerCase().includes('xử lý')) {
            $('#detailStatus').addClass('text-warning');
        } else if (statusText.toLowerCase().includes('hủy')) {
            $('#detailStatus').addClass('text-danger');
        } else {
            $('#detailStatus').addClass('text-success');
        }
        $('#detailStatus').text(statusText);

        $('#invoiceDetailModal').modal('show');
    });

    // Gắn sự kiện cho nút chỉnh sửa
    $(document).on('click', '.btn-action.edit', function () {
        const row = $(this).closest('tr');
        const invoiceId = row.find('td:eq(0)').text().replace('#', '').trim();
        const date = row.find('td:eq(1)').text().trim();
        const customer = row.find('td:eq(2)').text().trim();
        const total = row.find('td:eq(3)').text().trim();
        const discount = row.find('td:eq(4)').text().trim();
        const statusText = row.find('td:eq(5)').text().trim();
        // Lấy hình thức thanh toán (giả lập theo ưu đãi hoặc trạng thái nếu không có cột riêng)
        let paymentMethod = 'Tiền mặt';
        if (discount.toLowerCase().includes('momo')) paymentMethod = 'Ví MoMo';
        else if (discount.toLowerCase().includes('chuyển khoản')) paymentMethod = 'Chuyển khoản';
        else if (discount.toLowerCase().includes('thẻ')) paymentMethod = 'Thẻ ngân hàng';
        // Fill vào modal chỉnh sửa
        $('#editInvoiceModalLabel').text('Chỉnh sửa hoá đơn ' + invoiceId);
        $('#editInvoiceModal .section-content p:contains("Mã hóa đơn")').html('<strong>Mã hóa đơn:</strong> #' + invoiceId);
        $('#editInvoiceModal .section-content p:contains("Khách hàng")').html('<strong>Khách hàng:</strong> ' + customer);
        $('#editInvoiceModal .section-content p:contains("Ngày lập")').html('<strong>Ngày lập:</strong> ' + date);
        $('#editInvoiceModal .section-content p:contains("Trạng thái")').html('<strong>Trạng thái:</strong> ' + statusText);
        $('#editInvoiceModal .section-content p:contains("Hình thức")').html('<strong>Hình thức:</strong> ' + paymentMethod);
        // Tổng tiền, ưu đãi
        $('#editInvoiceModal tfoot tr:nth-child(1) td:last-child').text(total);
        $('#editInvoiceModal tfoot tr:nth-child(2) td:last-child').text(discount);
        $('#editInvoiceModal tfoot tr:nth-child(3) td:last-child').text(total);
        $('#editInvoiceModal').modal('show');
    });

    // Gắn sự kiện cho nút xoá
    $(document).on('click', '.btn-action.trash-can.delInvoice', function () {
        if (!$(this).prop('disabled')) {
            const row = $(this).closest('tr');
            const invoiceId = row.find('td:eq(0)').text().replace('#', '').trim();
            const customer = row.find('td:eq(2)').text().trim();
            const total = row.find('td:eq(3)').text().trim();
            // Fill vào modal xác nhận xoá
            $('#deleteInvoiceId').text(invoiceId);
            // Có thể fill thêm thông tin nếu muốn
            // Thêm hiệu ứng highlight cho dòng được chọn
            $('.table-secondary').removeClass('table-secondary');
            row.addClass('table-secondary');
            // Lưu thông tin để sử dụng khi xác nhận xoá
            $('#confirmDeleteInvoiceBtn').data('invoice-id', invoiceId).data('row', row);
            // Hiển thị modal xác nhận xoá
            $('#deleteInvoiceConfirmModal').modal('show');
            // Khi modal bị đóng (bất kỳ lý do gì), bỏ highlight nếu chưa xoá
            $('#deleteInvoiceConfirmModal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
                row.removeClass('table-secondary');
            });
        }
    });
    // Xử lý xác nhận xoá hoá đơn
    $(document).on('click', '#confirmDeleteInvoiceBtn', function () {
        const row = $(this).data('row');
        const invoiceId = $(this).data('invoice-id');
        if (row) {
            row.fadeOut(200, function () {
                $(this).remove();
                $('#deleteInvoiceConfirmModal').modal('hide');
                showToast(`<i class="fas fa-check-circle text-success me-2"></i> Đã xoá hoá đơn <b>${invoiceId}</b> thành công!`);
            });
        } else {
            $('#deleteInvoiceConfirmModal').modal('hide');
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Không tìm thấy dòng để xoá!', 'error');
        }
    });
    // Xử lý khi thay đổi phương thức thanh toán
    $(document).on('change', '#paymentMethodSelect', function () {
        const selectedOption = $(this).find('option:selected');
        const iconClass = selectedOption.data('icon');
        const textColor = selectedOption.data('color');

        // Cập nhật icon và màu
        $('#paymentMethodIcon').removeClass().addClass(`fas ${iconClass} ${textColor}`);
    });

    // Xử lý nút Lưu hóa đơn
    $(document).on('click', '#saveInvoiceBtn', function () {
        // Kiểm tra thông tin cơ bản của hóa đơn
        if (!validateInvoiceForm()) {
            return;
        }

        const paymentMethod = $('#paymentMethodSelect').val();

        // Nếu thanh toán bằng thẻ ngân hàng, mở modal thanh toán
        if (paymentMethod === 'card') {
            // Hiển thị thông tin tổng tiền trong modal thanh toán
            const totalAmount = $('.fw-bold.fs-5.text-primary').text();
            $('#paymentTotalAmount').text(totalAmount);

            // Mở modal thanh toán
            $('#createInvoiceModal').modal('hide');
            $('#paymentModal').modal('show');
        } else if (paymentMethod === 'cash') {
            // Thanh toán tiền mặt
            $('#createInvoiceModal').modal('hide');
            $('#cashPaymentModal').modal('show');
        } else if (paymentMethod === 'transfer') {
            // Thanh toán chuyển khoản
            $('#createInvoiceModal').modal('hide');
            $('#transferPaymentModal').modal('show');
        } else if (paymentMethod === 'momo') {
            // Thanh toán MoMo
            $('#createInvoiceModal').modal('hide');
            $('#momoPaymentModal').modal('show');
        }
    });

    // Xử lý khi click vào nút xác nhận thanh toán
    $(document).on('click', '#confirmPaymentBtn', function () {
        if (!validateCardInfo()) {
            return;
        }
        processPayment();
    });

    // Xử lý khi click vào nút xác nhận thanh toán tiền mặt
    $(document).on('click', '#confirmCashPaymentBtn', function () {
        completeCashPayment();
    });

    // Xử lý khi click vào nút xác nhận thanh toán chuyển khoản
    $(document).off('click', '#confirmTransferPaymentBtn').on('click', '#confirmTransferPaymentBtn', function () {
        // Xóa thông báo lỗi cũ
        $('.invalid-feedback').remove();
        $('.is-invalid').removeClass('is-invalid');

        let hasError = false;

        // Kiểm tra mã giao dịch (bắt buộc nhập)
        const reference = $('#transferReference');
        if (!reference.val()) {
            addInvalidFeedback(reference, "Vui lòng nhập mã giao dịch");
            hasError = true;
        } else if (!/^\d+$/.test(reference.val())) {
            addInvalidFeedback(reference, "Mã giao dịch phải là chữ số");
            hasError = true;
        }

        // Kiểm tra thời gian chuyển khoản (bắt buộc nhập)
        const transferTime = $('#transferTime');
        if (!transferTime.val()) {
            addInvalidFeedback(transferTime, "Vui lòng nhập thời gian chuyển khoản");
            hasError = true;
        }

        // Nếu có lỗi validate thì không thực hiện tiếp
        if (hasError) return;

        // Kiểm tra đã tick xác nhận hoàn tất chuyển khoản chưa
        if (!$('#transferCompleted').is(':checked')) {
            showToast('Vui lòng xác nhận tôi đã hoàn tất chuyển khoản!', 'error');
            return;
        }

        completeTransferPayment();
    });

    // Xử lý khi click vào nút xác nhận thanh toán MoMo
    $(document).on('click', '#confirmMomoPaymentBtn', function () {
        // Kiểm tra đã tick xác nhận hoàn tất thanh toán MoMo chưa
        if (!$('#momoCompleted').is(':checked')) {
            showToast('Vui lòng xác nhận đã hoàn tất thanh toán qua MoMo!', 'error');
            return;
        }
        completeMomoPayment();
    });

    // Tính tiền thối khi nhập tiền khách đưa
    $(document).on('input', '#cashReceived', function () {
        calculateChange();
    });

    // Xử lý thêm thuốc vào bảng
    $(document).on('click', '#addMedicineBtn', function () {
        // Lấy giá trị từ ô tìm kiếm
        const searchValue = $('#medicineSearch').val().trim();

        if (!searchValue) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập mã hoặc tên thuốc!', 'error');
            return;
        }

        // Giả lập kiểm tra thuốc có tồn tại trong hệ thống không
        const isMedicineExist = searchValue.length > 2;

        if (!isMedicineExist) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc không tồn tại trong hệ thống!', 'error');
            return;
        }

        // Giả lập tìm kiếm thuốc từ API
        const medicineId = searchValue.toUpperCase().includes('MED') ? searchValue : 'MED' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const medicineName = searchValue.toUpperCase().includes('MED') ? 'Thuốc ' + Math.floor(Math.random() * 100) : searchValue;
        const price = Math.floor(Math.random() * 20 + 1) * 1000;

        // Kiểm tra thuốc đã tồn tại trong đơn hàng chưa
        const existingRow = $('#medicineList').find(`tr[id="${medicineId}"]`);

        if (existingRow.length > 0) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc này đã có trong đơn hàng!', 'error');
            return;
        }

        // Thêm thuốc vào bảng
        addMedicineToEditTable(medicineId, medicineName, price, 1);

        // Xóa nội dung ô tìm kiếm
        $('#medicineSearch').val('');

        // Cập nhật tổng tiền
        updateEditTotals();

        // Hiển thị thông báo
        showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã thêm thuốc vào đơn hàng!');
    });

    // Xử lý khi thay đổi số lượng thuốc
    $(document).on('change', '.quantity-input', function () {
        updateMedicineTotal(this);
    });
    // Xử lý khi thay đổi ưu đãi áp dụng trong lập hoá đơn
    $(document).on('change', '#discountSelect', function () {
        // Nếu chọn tự động áp dụng ưu đãi tốt nhất
        if ($('#autoDiscount').is(':checked')) {
            // Hiển thị trạng thái đang xử lý
            $(this).prop('disabled', true);
            setTimeout(() => {
                // Giả lập tìm thấy ưu đãi tốt nhất là giảm 10%
                $(this).val('percent10');
                $(this).prop('disabled', false);

                // Tính lại tổng tiền
                updateEditTotals();
                showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã áp dụng ưu đãi tốt nhất cho khách hàng!');
            }, 800);
        } else {
            // Tính lại tổng tiền
            updateEditTotals();
        }
    });

    // Xử lý khách hàng mới
    $(document).on('change', '#newCustomer', function () {
        if ($(this).is(':checked')) {
            $('#newCustomerInfo').removeClass('d-none');
        } else {
            $('#newCustomerInfo').addClass('d-none');
        }
    });

    // Xử lý checkbox áp dụng ưu đãi tự động
    $(document).on('change', '#autoDiscount', function () {
        if ($(this).is(':checked')) {
            $('#discountSelect').prop('disabled', true);
            setTimeout(() => {
                $('#discountSelect').val('percent10');
                $('#discountSelect').prop('disabled', false);
                updateEditTotals();
                showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã áp dụng ưu đãi tốt nhất cho khách hàng!');
            }, 800);
        }
    });

    // Gắn sự kiện cho nút In hóa đơn
    $(document).on('click', '#printInvoiceBtn', function () {
        printInvoice();
    });

    // Nút "Quay lại" trong các modal thanh toán
    $(document).on('click', '#paymentModal .btn-light, #cashPaymentModal .btn-light, #transferPaymentModal .btn-light, #momoPaymentModal .btn-light', function (e) {
        e.preventDefault();
        const modalId = $(this).closest('.modal').attr('id');
        $(`#${modalId}`).modal('hide');
        $('#createInvoiceModal').modal('show');
    });

    console.log("Khởi tạo sự kiện thành công!");
    $(document).off('change', '#editPaymentMethodSelect').on('change', '#editPaymentMethodSelect', function () {
        const selectedOption = $(this).find('option:selected');
        const iconClass = selectedOption.data('icon');
        const textColor = selectedOption.data('color');

        // Cập nhật icon và màu
        $('#editPaymentMethodIcon').removeClass().addClass(`fas ${iconClass} ${textColor}`);
    });
    // Xử lý khi nhấn nút áp dụng bộ lọc
    $('#applyFilter').click(function () {
        // Xóa tất cả thông báo lỗi cũ
        $('.invalid-feedback').remove();
        $('.is-invalid').removeClass('is-invalid');

        // Kiểm tra điều kiện lọc
        const startDate = new Date($('#startDate').val());
        const endDate = new Date($('#endDate').val());

        // Kiểm tra ngày bắt đầu không lớn hơn ngày kết thúc
        if ($('#startDate').val() && $('#endDate').val() && startDate > endDate) {
            // Phản hồi trực tiếp
            addInvalidFeedback($('#startDate'), "Thời gian bắt đầu không được lớn hơn thời gian kết thúc");
            return;
        }

        // Giả lập áp dụng bộ lọc
        $('#filterModal').modal('hide');

        // Hiển thị thông báo thành công
        showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã áp dụng bộ lọc thành công!');

        // Giả lập không tìm thấy hóa đơn phù hợp
        if (Math.random() < 0.2) { // 20% khả năng không tìm thấy kết quả
            setTimeout(() => {
                showToast('<i class="fas fa-exclamation-circle text-warning me-2"></i> Thông tin hoá đơn không tồn tại', 'error');
            }, 1000);
        }
    });
    // Xử lý thêm thuốc trong modal chỉnh sửa
    $(document).on('click', '#editAddMedicineBtn', function () {
        // Lấy giá trị từ ô tìm kiếm thuốc trong modal chỉnh sửa
        const searchValue = $('#editMedicineSearch').val().trim();
        if (!searchValue) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập mã hoặc tên thuốc!', 'error');
            return;
        }
        // Giả lập kiểm tra thuốc có tồn tại trong hệ thống không
        const isMedicineExist = searchValue.length > 2;
        if (!isMedicineExist) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc không tồn tại trong hệ thống!', 'error');
            return;
        }
        // Giả lập tìm kiếm thuốc từ API
        const medicineId = searchValue.toUpperCase().includes('MED') ? searchValue : 'MED' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const medicineName = searchValue.toUpperCase().includes('MED') ? 'Thuốc ' + Math.floor(Math.random() * 100) : searchValue;
        const price = Math.floor(Math.random() * 20 + 1) * 1000;
        // Kiểm tra thuốc đã tồn tại trong đơn hàng chưa
        const existingRow = $('#editMedicineList').find(`tr[id="${medicineId}"]`);
        if (existingRow.length > 0) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc này đã có trong đơn hàng!', 'error');
            return;
        }
        // Thêm thuốc vào bảng chỉnh sửa
        addMedicineToEditTable(medicineId, medicineName, price, 1, 'editMedicineList');
        // Xóa nội dung ô tìm kiếm
        $('#editMedicineSearch').val('');
        // Hiển thị thông báo
        // showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã thêm thuốc vào hoá đơn thành công!');
    });
    // Xử lý sự kiện xóa thuốc cho nút mới
    $(document).on('click', '.btn-action.trash-can.delMedicine', function () {
        const row = $(this).closest('tr');

        // Kiểm tra số lượng thuốc còn lại
        if ($('#medicineList tr').length <= 1) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Hóa đơn phải có ít nhất một sản phẩm', 'error');
            return;
        }

        // Xóa dòng
        row.remove();

        // Cập nhật tổng tiền
        updateEditTotals();

        // Hiển thị thông báo
        showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã xóa thuốc khỏi đơn hàng!');
    });
    $('#cardNumber').on('input', function () {
        // Chỉ cho nhập số
        let value = $(this).val().replace(/[^\d]/g, '');

        // Tự động cách ra sau mỗi 4 số
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += value[i];
        }
        $(this).val(formatted);
    });
    $('#cardHolderName').on('input', function () {
        // Tự động chuyển thành chữ hoa, bỏ dấu
        let upper = $(this).val().toUpperCase();
        $(this).val(upper);
    });
}
function showPaymentProcessing() {
    // Xóa overlay cũ nếu có
    $('#paymentForm').find('.position-absolute').remove();

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-primary mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xử lý thanh toán...</p>' +
        '</div>' +
        '</div>');

    $('#paymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}

// Hàm cập nhật tổng tiền cho modal chỉnh sửa hoá đơn
function updateEditInvoiceTotals() {
    let subtotal = 0;
    // Tính tổng phụ từ bảng thuốc trong modal chỉnh sửa
    $('#editMedicineList tr').each(function () {
        const priceText = $(this).find('td:eq(4)').text();
        const price = parseFloat(priceText.replace(/[^0-9]/g, ''));
        subtotal += price;
    });
    // Hiển thị tổng phụ
    $('#editMedicineList').closest('table').find('tfoot tr:eq(0) td:last').text(subtotal.toLocaleString('vi-VN') + 'đ');

    // Lấy giá trị giảm giá
    const discount = $('#editInvoiceModal #discountSelect').val();
    let discountAmount = 0;
    let discountText = '';
    if (discount === 'percent10') {
        discountAmount = subtotal * 0.1;
        discountText = '-' + discountAmount.toLocaleString('vi-VN') + 'đ (10%)';
    } else if (discount === 'amount20k') {
        discountAmount = 20000;
        discountText = '-' + discountAmount.toLocaleString('vi-VN') + 'đ';
    } else if (discount === 'freeship') {
        discountText = 'Miễn phí giao hàng';
    } else {
        discountText = '0đ';
    }
    // Hiển thị giảm giá
    $('#editMedicineList').closest('table').find('tfoot tr:eq(1) td:last').text(discountText);

    // Tính tổng thanh toán
    const finalTotal = subtotal - discountAmount;
    // Hiển thị tổng thanh toán
    $('#editMedicineList').closest('table').find('tfoot tr:eq(2) td:last').text(finalTotal.toLocaleString('vi-VN') + 'đ');
}

// Xoá thuốc trong modal chỉnh sửa
$(document).on('click', '#editMedicineList .delMedicine', function () {
    const row = $(this).closest('tr');
    if ($('#editMedicineList tr').length <= 1) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Hóa đơn phải có ít nhất một sản phẩm', 'error');
        return;
    }
    row.remove();
    updateEditInvoiceTotals(); // Cập nhật tổng tiền
    showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã xóa thuốc khỏi hoá đơn!');
});

// Thay đổi số lượng trong modal chỉnh sửa
$(document).on('change', '#editMedicineList .quantity-input', function () {
    const row = $(this).closest('tr');
    const price = parseFloat(row.find('td:eq(2)').text().replace(/[^0-9]/g, ''));
    const quantity = parseInt($(this).val()) || 0;
    if (quantity <= 0) {
        $(this).val(1);
        addInvalidFeedback($(this), 'Số lượng phải là số nguyên dương');
        return;
    }
    const totalPrice = price * quantity;
    row.find('td:eq(4)').text(totalPrice.toLocaleString('vi-VN') + 'đ');
    updateEditInvoiceTotals(); // Cập nhật tổng tiền
});

// Thay đổi ưu đãi trong modal chỉnh sửa
$(document).on('change', '#editInvoiceModal #discountSelect', function () {
    updateEditInvoiceTotals();
});

// Lấy đúng tổng thanh toán từ modal lập hoá đơn
function getFinalTotalFromCreateInvoiceModal() {
    // Lấy dòng cuối cùng của tfoot (tổng thanh toán)
    return $('#createInvoiceModal table tfoot tr:last td:last').text().trim() || '0đ';
}

// Khi mở modal thanh toán thẻ ngân hàng
$(document).on('show.bs.modal', '#paymentModal', function () {
    const total = getFinalTotalFromCreateInvoiceModal();
    $('#paymentTotalAmount').text(total);
});
// Khi mở modal thanh toán tiền mặt
$(document).on('show.bs.modal', '#cashPaymentModal', function () {
    const total = getFinalTotalFromCreateInvoiceModal();
    $('#cashPaymentTotalAmount').text(total);
});
// Khi mở modal thanh toán chuyển khoản
$(document).on('show.bs.modal', '#transferPaymentModal', function () {
    const total = getFinalTotalFromCreateInvoiceModal();
    $('#transferPaymentTotalAmount').text(total);
});
// Khi mở modal thanh toán MoMo
$(document).on('show.bs.modal', '#momoPaymentModal', function () {
    const total = getFinalTotalFromCreateInvoiceModal();
    $('#momoPaymentTotalAmount').text(total);
});

// Hàm chuyển đổi định dạng ngày từ yyyy-MM-ddTHH:mm sang dd/MM/yyyy HH:mm
function formatDateTimeVN(datetimeStr) {
    if (!datetimeStr) return '';
    const d = new Date(datetimeStr);
    if (isNaN(d.getTime())) return datetimeStr;
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Khi mở modal lập hoá đơn, set mặc định ngày lập là thời gian hiện tại
$(document).on('show.bs.modal', '#createInvoiceModal', function () {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    $('#invoiceDate').val(local);
});
// Khi mở modal chỉnh sửa hoá đơn, cũng set ngày lập hiện tại (hoặc lấy từ dữ liệu nếu có)
$(document).on('show.bs.modal', '#editInvoiceModal', function () {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    $('#editInvoiceDate').val(local);
});


// Chỉnh sửa chi tiết hoá đơn
function processEditInvoicePayment() {
    // Lấy thông tin cần thiết từ modal chỉnh sửa
    const invoiceId = $('#editInvoiceId').text().trim();
    const paymentMethod = $('#paymentMethodSelect').val();

    // Đóng modal chỉnh sửa
    $('#editInvoiceModal').modal('hide');

    // Hiển thị modal thanh toán tương ứng với phương thức thanh toán
    if (paymentMethod === 'card') {
        // Cập nhật số tiền cần thanh toán
        const totalAmount = $('#editInvoiceModal .fs-5.text-primary').text();
        $('#paymentTotalAmount').text(totalAmount);
        $('#paymentModal').modal('show');
    } else if (paymentMethod === 'cash') {
        const totalAmount = $('#editInvoiceModal .fs-5.text-primary').text();
        $('#cashPaymentTotalAmount').text(totalAmount);
        $('#cashPaymentModal').modal('show');
    } else if (paymentMethod === 'transfer') {
        const totalAmount = $('#editInvoiceModal .fs-5.text-primary').text();
        $('#transferPaymentTotalAmount').text(totalAmount);
        $('#transferPaymentModal').modal('show');
    } else if (paymentMethod === 'momo') {
        const totalAmount = $('#editInvoiceModal .fs-5.text-primary').text();
        $('#momoPaymentTotalAmount').text(totalAmount);
        $('#momoPaymentModal').modal('show');
    }

    // Lưu ID hóa đơn đang được thanh toán để sử dụng sau khi thanh toán
    sessionStorage.setItem('currentEditInvoiceId', invoiceId);
}

// Hàm cập nhật trạng thái hóa đơn sau khi thanh toán
function updateInvoiceStatusAfterPayment(invoiceId, paymentMethod) {
    // Tìm hàng trong bảng có mã hóa đơn tương ứng
    const row = $('#invoiceTable tbody tr').filter(function () {
        return $(this).find('td:first-child').text().trim() === invoiceId;
    });

    if (row.length > 0) {
        // Cập nhật trạng thái thành "Đã thanh toán"
        row.find('td:contains("Đang xử lý")').html('<span class="text-success">Đã thanh toán</span>');

        // Vô hiệu hóa nút sửa và xóa
        row.find('.btn-action.edit').prop('disabled', true)
            .attr('data-bs-toggle', 'tooltip')
            .attr('title', 'Không thể chỉnh sửa hóa đơn đã thanh toán');

        row.find('.btn-action.trash-can').prop('disabled', true)
            .attr('data-bs-toggle', 'tooltip')
            .attr('title', 'Không thể xóa hóa đơn đã thanh toán');

        // Hiển thị thông báo thành công
        const methodText = {
            'cash': 'tiền mặt',
            'card': 'thẻ ngân hàng',
            'transfer': 'chuyển khoản',
            'momo': 'ví MoMo'
        };

        showToast(`<i class="fas fa-check-circle text-success me-2"></i> Thanh toán hóa đơn ${invoiceId} thành công bằng ${methodText[paymentMethod]}!`);
    }
}
