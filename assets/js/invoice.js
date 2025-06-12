$(document).ready(function () {
    // Xử lý thêm thuốc khi chỉnh sửa hoá đơn - sửa lại để không mở modal thêm thuốc
    $('#editAddMedicineBtn').off('click').on('click', function () {
        // Lấy giá trị từ ô tìm kiếm
        const searchValue = $('#editMedicineSearch').val().trim();

        if (!searchValue) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập mã hoặc tên thuốc!', 'error');
            return;
        }

        // Giả lập kiểm tra thuốc có tồn tại trong hệ thống không
        // Trong thực tế sẽ gọi API để kiểm tra
        const isMedicineExist = searchValue.length > 2; // Giả sử thuốc tồn tại nếu chuỗi tìm kiếm > 2 ký tự

        if (!isMedicineExist) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc không tồn tại trong hệ thống!', 'error');
            return;
        }

        // Giả lập tìm kiếm thuốc từ API (trong thực tế)
        // Giả sử tìm được thuốc
        const medicineId = searchValue.toUpperCase().includes('MED') ? searchValue : 'MED' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const medicineName = searchValue.toUpperCase().includes('MED') ? 'Thuốc ' + Math.floor(Math.random() * 100) : searchValue;
        const price = Math.floor(Math.random() * 20 + 1) * 1000; // Giá từ 1.000đ đến 20.000đ

        // Kiểm tra thuốc đã tồn tại trong đơn hàng chưa
        const existingRow = $('#editInvoiceItems').find(`tr[id="medicine-${medicineId}"]`);

        if (existingRow.length > 0) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc này đã có trong đơn hàng!', 'error');
            return;
        }

        // Thêm thuốc vào bảng
        addMedicineToEditTable(medicineId, medicineName, price, 1);

        // Xóa nội dung ô tìm kiếm
        $('#editMedicineSearch').val('');

        // Cập nhật tổng tiền
        updateEditTotals();

        // Hiển thị thông báo
        showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã thêm thuốc vào đơn hàng!');
    });

    // Hàm thêm thuốc vào bảng khi chỉnh sửa
    function addMedicineToEditTable(id, name, price, quantity) {
        // Tính thành tiền
        const totalPrice = price * quantity;

        // Tạo HTML cho dòng mới
        const newRow = `
            <tr id="medicine-${id}">
                <td>${id}</td>
                <td>${name}</td>
                <td>${price.toLocaleString('vi-VN')} đ</td>
                <td>
                    <input type="number" class="form-control form-control-sm edit-quantity-input" 
                        value="${quantity}" min="1" style="width: 70px">
                </td>
                <td>${totalPrice.toLocaleString('vi-VN')} đ</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger edit-remove-medicine">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;

        // Thêm dòng mới vào bảng
        $('#editInvoiceItems').append(newRow);

        // Cập nhật tổng tiền
        updateEditTotals();

        // Gắn sự kiện cho nút xóa và input số lượng
        setupEditMedicineEvents();
    }
    // Xử lý sự kiện cho các phần tử trong bảng thuốc
    function setupEditMedicineEvents() {
        // Xử lý thay đổi số lượng thuốc
        $('.edit-quantity-input').off('input').on('input', function () {
            const row = $(this).closest('tr');
            const quantity = parseInt($(this).val()) || 0;

            // Kiểm tra số lượng hợp lệ
            if (quantity <= 0) {
                $(this).val(1);
                showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số lượng phải lớn hơn 0!', 'error');
                return;
            }

            // Tính lại thành tiền
            const price = parseFloat(row.find('td:eq(2)').text().replace(/[^\d]/g, ''));
            const amount = price * quantity;
            row.find('td:eq(4)').text(amount.toLocaleString('vi-VN') + ' đ');

            // Cập nhật tổng tiền
            updateEditTotals();
        });

        // Xử lý xóa thuốc
        $('.edit-remove-medicine').off('click').on('click', function () {
            const row = $(this).closest('tr');

            // Xóa thuốc
            row.remove();

            // Cập nhật tổng tiền
            updateEditTotals();

            showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã xóa thuốc khỏi đơn hàng!');
        });
    }
    // Xử lý xóa thuốc trong phần lập hóa đơn
    $(document).on('click', '.btn-danger', function () {
        const row = $(this).closest('tr');

        // Xóa thuốc
        row.remove();

        // Cập nhật tổng tiền
        updateTotals();

        showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã xóa thuốc khỏi đơn hàng!');
    });
    // Cập nhật tổng tiền khi chỉnh sửa
    function updateEditTotals() {
        let subtotal = 0;

        // Tính tổng phụ
        $('#editInvoiceItems tr').each(function () {
            const priceText = $(this).find('td:eq(4)').text();
            const price = parseFloat(priceText.replace(/[^\d]/g, ''));
            subtotal += price;
        });

        // Hiển thị tổng phụ
        $('#editInvoiceModal tfoot tr:eq(0) td:last').text(subtotal.toLocaleString('vi-VN') + 'đ');

        // Áp dụng giảm giá (nếu có)
        const discount = $('#editDiscountSelect').val();
        let discountAmount = 0;
        let discountText = "";

        if (discount === 'percent10') {
            discountAmount = subtotal * 0.1;
            discountText = "-" + discountAmount.toLocaleString('vi-VN') + "đ (10%)";
        } else if (discount === 'amount20k') {
            discountAmount = 20000;
            discountText = "-" + discountAmount.toLocaleString('vi-VN') + "đ";
        } else if (discount === 'freeship') {
            discountText = "Miễn phí giao hàng";
        } else {
            discountText = "0đ";
        }

        // Hiển thị giảm giá
        $('#editInvoiceModal tfoot tr:eq(1) td:last').text(discountText);

        // Tính tổng thanh toán
        const finalTotal = subtotal - discountAmount;

        // Hiển thị tổng thanh toán
        $('#editInvoiceModal tfoot tr:eq(2) td:last').text(finalTotal.toLocaleString('vi-VN') + 'đ');
    }

    // Xử lý khi thay đổi ưu đãi áp dụng
    $('#editDiscountSelect').change(function () {
        // Nếu chọn tự động áp dụng ưu đãi tốt nhất
        if ($('#autoDiscountEdit').is(':checked')) {
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

    // Xử lý checkbox áp dụng ưu đãi tự động
    $('#autoDiscountEdit').change(function () {
        if ($(this).is(':checked')) {
            $('#editDiscountSelect').prop('disabled', true);
            setTimeout(() => {
                $('#editDiscountSelect').val('percent10');
                $('#editDiscountSelect').prop('disabled', false);
                updateEditTotals();
            }, 800);
        }
    });

    // Gắn sự kiện cho các phần tử trong bảng thuốc khi trang tải
    setupEditMedicineEvents();

    // Đăng ký sự kiện cho nút xoá hoá đơn
    $(document).on('click', '.btn-action.trash-can, .btn-action.cancel', function () {
        if (!$(this).prop('disabled')) {
            const row = $(this).closest('tr');
            const invoiceId = row.find('td:first').text();
            const customerName = row.find('td:eq(2)').text();
            const totalAmount = row.find('td:eq(3)').text();
            // Thêm hiệu ứng highlight cho dòng được chọn - sử dụng màu xám thay vì đỏ
            $('.table-secondary').removeClass('table-secondary');
            row.addClass('table-secondary');

            // Hiển thị modal xác nhận xoá với animation
            $('#deleteInvoiceConfirmModal').modal('show');

            // Lưu ID hóa đơn vào nút xác nhận
            $('#confirmDeleteInvoiceBtn').data('invoice-id', invoiceId).data('row', row);
        }
    });

    // Xử lý xác nhận xoá hoá đơn
    $(document).on('click', '#confirmDeleteInvoiceBtn', function () {
        const invoiceId = $(this).data('invoice-id');
        const row = $(this).data('row');
        // Giả lập gọi API xoá hoá đơn (trong thực tế sẽ gọi API)
        // Thêm hiệu ứng fade-out trước khi xoá dòng
        row.fadeOut(200, function () {
            // Xoá dòng hoá đơn sau khi hiệu ứng hoàn tất
            $(this).remove();

            // Đóng modal
            $('#deleteInvoiceConfirmModal').modal('hide');

            // Hiển thị thông báo thành công
            showToast(`<i class="fas fa-check-circle text-success me-2"></i> Đã xoá hoá đơn <b>${invoiceId}</b> thành công!`);
        });
    });
    $('#addMedicineBtn').off('click').on('click', function () {
        // Lấy giá trị từ ô tìm kiếm
        const searchValue = $('#medicineSearch').val().trim();

        if (!searchValue) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập mã hoặc tên thuốc!', 'error');
            return;
        }

        // Giả lập kiểm tra thuốc có tồn tại trong hệ thống không
        // Trong thực tế sẽ gọi API để kiểm tra
        const isMedicineExist = searchValue.length > 2; // Giả sử thuốc tồn tại nếu chuỗi tìm kiếm > 2 ký tự

        if (!isMedicineExist) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc không tồn tại trong hệ thống!', 'error');
            return;
        }
        // Giả lập tìm kiếm thuốc từ API (trong thực tế)
        // Giả sử tìm được thuốc
        const medicineId = searchValue.toUpperCase().includes('MED') ? searchValue : 'MED' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const medicineName = searchValue.toUpperCase().includes('MED') ? 'Thuốc ' + Math.floor(Math.random() * 100) : searchValue;
        const price = Math.floor(Math.random() * 20 + 1) * 1000; // Giá từ 1.000đ đến 20.000đ
        // Kiểm tra thuốc đã tồn tại trong đơn hàng chưa
        const existingRow = $('#medicineList').find(`tr[data-id="${medicineId}"]`);

        if (existingRow.length > 0) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Thuốc này đã có trong đơn hàng!', 'error');
            return;
        }
        // Thêm thuốc vào bảng
        addMedicineToEditTable(medicineId, medicineName, price, 1);

        // Xóa nội dung ô tìm kiếm
        $('#medicineSearch').val('');

        // Cập nhật tổng tiền
        updateTotals();

        // Hiển thị thông báo
        showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã thêm thuốc vào đơn hàng!');
    });
    // THÊM HÀM NÀY - cập nhật tổng tiền
    function updateTotals() {
        let subtotal = 0;

        // Tính tổng phụ
        $('#medicineList tr').each(function () {
            const priceText = $(this).find('td:eq(4)').text();
            const price = parseFloat(priceText.replace(/[^\d]/g, ''));
            subtotal += price;
        });

        // Hiển thị tổng phụ
        $('tfoot tr:eq(0) td:last').text(subtotal.toLocaleString('vi-VN') + 'đ');

        // Áp dụng giảm giá (nếu có)
        const discount = $('#discountSelect').val();
        let discountAmount = 0;
        let discountText = "";

        if (discount === 'percent10') {
            discountAmount = subtotal * 0.1;
            discountText = "-" + discountAmount.toLocaleString('vi-VN') + "đ (10%)";
        } else if (discount === 'amount20k') {
            discountAmount = 20000;
            discountText = "-" + discountAmount.toLocaleString('vi-VN') + "đ";
        } else if (discount === 'freeship') {
            discountText = "Miễn phí giao hàng";
        } else {
            discountText = "0đ";
        }

        // Hiển thị giảm giá
        $('tfoot tr:eq(1) td:last').text(discountText);

        // Tính tổng thanh toán
        const finalTotal = subtotal - discountAmount;

        // Hiển thị tổng thanh toán
        $('tfoot tr:eq(2) td:last').text(finalTotal.toLocaleString('vi-VN') + 'đ');
    }
    // THÊM HÀM NÀY - Hàm cập nhật thành tiền khi thay đổi số lượng
    function updateMedicineTotal(input) {
        const row = $(input).closest('tr');
        const price = parseFloat(row.find('td:eq(2)').text().replace(/[^\d]/g, ''));
        const quantity = parseInt($(input).val()) || 0;

        // Kiểm tra số lượng hợp lệ
        if (quantity <= 0) {
            $(input).val(1);
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số lượng phải lớn hơn 0!', 'error');
            return;
        }

        // Tính và cập nhật thành tiền
        const totalPrice = price * quantity;
        row.find('td:eq(4)').text(totalPrice.toLocaleString('vi-VN') + 'đ');

        // Cập nhật tổng tiền đơn hàng
        updateTotals();
    }

    // THÊM HÀM NÀY - Hàm xóa thuốc khỏi đơn hàng
    function removeMedicine(button) {
        const row = $(button).closest('tr');
        row.remove();

        // Cập nhật tổng tiền đơn hàng
        updateTotals();
    }
    // THÊM ĐOẠN NÀY - xử lý sự kiện nút xoá thuốc
    $(document).ready(function () {
        // Gắn sự kiện cho các nút xóa đã có sẵn trong bảng
        $('.btn-danger').click(function () {
            $(this).closest('tr').remove();
            updateTotals();
        });

        // Xử lý thay đổi số lượng trực tiếp
        $('.quantity-input').change(function () {
            updateMedicineTotal(this);
        });
    });
    // Xử lý khi thay đổi ưu đãi áp dụng
    $('#editDiscountSelect').change(function () {
        // Nếu chọn tự động áp dụng ưu đãi tốt nhất
        if ($('#autoDiscountEdit').is(':checked')) {
            // Hiển thị trạng thái đang xử lý
            $(this).prop('disabled', true);
            setTimeout(() => {
                // Giả lập tìm thấy ưu đãi tốt nhất là giảm 10%
                $(this).val('percent10');
                $(this).prop('disabled', false);

                // Tính lại tổng tiền
                calculateInvoiceTotal();
                showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã áp dụng ưu đãi tốt nhất cho khách hàng!');
            }, 800);
        } else {
            // Tính lại tổng tiền
            calculateInvoiceTotal();
        }

    });
    // Xử lý nút Thanh toán lại
    $('#proceedToPaymentBtn').click(function () {
        // Kiểm tra dữ liệu
        let isValid = true;
        let errorMessage = '';

        $('.medicine-quantity').each(function () {
            const value = $(this).val();
            if (!value || isNaN(value) || parseInt(value) <= 0) {
                isValid = false;
                errorMessage = 'Số lượng thuốc phải là số dương';
                return false;
            }
        });

        if (!isValid) {
            showToast(errorMessage, 'error');
            return;
        }

        // Lấy phương thức thanh toán hiện tại
        const paymentMethod = 'transfer'; // Giả sử là chuyển khoản, trong thực tế lấy từ dữ liệu hoá đơn

        // Hiện thị trạng thái đang xử lý
        $(this).prop('disabled', true);
        $(this).html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý...');

        // Giả lập lưu thay đổi
        setTimeout(() => {
            // Đóng modal chỉnh sửa
            $('#editInvoiceModal').modal('hide');

            // Hiển thị modal thanh toán tương ứng
            if (paymentMethod === 'cash') {
                $('#cashPaymentModal').modal('show');
            } else if (paymentMethod === 'card') {
                $('#paymentModal').modal('show');
            } else if (paymentMethod === 'transfer') {
                $('#transferPaymentModal').modal('show');
            } else if (paymentMethod === 'momo') {
                $('#momoPaymentModal').modal('show');
            }

            // Reset nút
            $(this).prop('disabled', false);
            $(this).html('<i class="fas fa-money-bill-wave me-1"></i> Thanh toán lại');
        }, 1000);
    });
    // Xử lý nút chỉnh sửa trong danh sách hóa đơn
    $('.btn-action.edit').click(function () {
        // Đóng modal chi tiết nếu đang mở
        $('#invoiceDetailModal').modal('hide');

        // Mở modal chỉnh sửa
        $('#editInvoiceModal').modal('show');
    });
    // ===== 1. Xử lý chỉnh sửa hóa đơn =====

    // Khi thay đổi số lượng thuốc, hiển thị nút lưu
    $(document).on('input', '.medicine-quantity', function () {
        const row = $(this).closest('tr');
        const btnSave = row.find('.btn-save-item');
        const originalValue = $(this).data('original');
        const currentValue = parseInt($(this).val());

        // Chỉ hiện nút lưu khi số lượng thay đổi và hợp lệ
        if (currentValue !== originalValue && currentValue > 0) {
            btnSave.prop('disabled', false);
        } else {
            btnSave.prop('disabled', true);
        }
    });

    // Xử lý lưu thay đổi số lượng thuốc
    $(document).on('click', '.btn-save-item', function () {
        const row = $(this).closest('tr');
        const quantityInput = row.find('.medicine-quantity');
        const newQuantity = parseInt(quantityInput.val());

        if (newQuantity > 0) {
            // Cập nhật giá trị gốc
            quantityInput.data('original', newQuantity);

            // Tính lại thành tiền
            const price = parseFloat(row.find('td:eq(2)').text().replace(/[^\d]/g, ''));
            const amount = price * newQuantity;
            row.find('td:eq(4)').text(amount.toLocaleString('vi-VN') + ' đ');

            // Tính lại tổng tiền và hiển thị
            calculateInvoiceTotal();

            // Disable nút lưu
            $(this).prop('disabled', true);

            // Hiển thị thông báo
            showToast('Đã cập nhật số lượng thành công!');
        }
    });

    // Xử lý xoá một sản phẩm khỏi hoá đơn
    $(document).on('click', '.btn-delete-item', function () {
        const row = $(this).closest('tr');
        const itemId = row.attr('id').split('-')[1];
        const itemName = row.find('td:eq(1)').text();

        // Hiển thị tên sản phẩm trong modal xác nhận
        $('#deleteItemName').text(itemName);
        $('#confirmDeleteItemBtn').data('item-id', itemId);

        // Hiển thị modal xác nhận xoá
        $('#deleteItemConfirmModal').modal('show');
    });

    // Xử lý xác nhận xoá sản phẩm
    $('#confirmDeleteItemBtn').click(function () {
        const itemId = $(this).data('item-id');

        // Đếm số sản phẩm còn lại trong hoá đơn
        const remainingItems = $('#editInvoiceItems tr').length;

        if (remainingItems <= 1) {
            // Hiển thị thông báo lỗi nếu chỉ còn 1 sản phẩm theo luồng ngoại lệ E-2.3.4.3.2
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Hóa đơn phải có ít nhất một sản phẩm', 'error');
            $('#deleteItemConfirmModal').modal('hide');
            return;
        }

        // Hiệu ứng loading
        $(this).prop('disabled', true);
        $(this).html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý');

        // Giả lập xóa dữ liệu
        setTimeout(() => {
            // Xoá sản phẩm khỏi bảng
            $(`#medicine-${itemId}`).remove();

            // Tính lại tổng tiền
            calculateInvoiceTotal();

            // Đóng modal và hiển thị thông báo
            $('#deleteItemConfirmModal').modal('hide');
            showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã xoá sản phẩm khỏi hoá đơn!');

            // Reset nút
            $(this).prop('disabled', false);
            $(this).html('<i class="fas fa-trash-alt me-1"></i> Xoá sản phẩm');
        }, 800);
    });

    // Thêm thuốc mới vào hoá đơn
    $('#addMedicineToInvoice').click(function () {
        // Reset dữ liệu trong modal thêm thuốc
        $('#medicineSearchInput').val('');
        $('#selectedMedicineQuantity').val(1);

        // Hiển thị modal thêm thuốc
        $('#addMedicineModal').modal('show');
        $('#editInvoiceModal').modal('hide');
    });

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

    // Thêm thuốc đã chọn vào hoá đơn
    // Thêm thuốc đã chọn vào hoá đơn - Cập nhật lại phần xử lý
    $('#addSelectedMedicineBtn').click(function () {
        const id = $('#selectedMedicineId').text();
        const name = $('#selectedMedicineName').text();
        const price = parseFloat($('#selectedMedicinePrice').text().replace(/[^\d]/g, ''));
        const quantity = parseInt($('#selectedMedicineQuantity').val());

        // Kiểm tra thuốc đã tồn tại trong hoá đơn chưa theo luồng ngoại lệ E-1.4.10
        if ($(`#medicine-${id}`).length > 0) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Mã thuốc đã tồn tại trong danh sách', 'error');
            return;
        }

        // Kiểm tra số lượng hợp lệ theo luồng ngoại lệ E-1.4.5
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số lượng phải là số nguyên dương', 'error');
            return;
        }

        // Hiệu ứng loading
        $(this).prop('disabled', true);
        $(this).html('<i class="fas fa-spinner fa-spin me-1"></i> Đang thêm');

        // Tính thành tiền
        const amount = price * quantity;

        // Giả lập thêm dữ liệu
        setTimeout(() => {
            // Tạo HTML cho hàng mới
            const newRow = `
        <tr id="medicine-${id}">
            <td>${id}</td>
            <td>${name}</td>
            <td>${price.toLocaleString('vi-VN')} đ</td>
            <td>
                <input type="number" class="form-control form-control-sm medicine-quantity" 
                    value="${quantity}" min="1" style="width: 70px" data-original="${quantity}">
            </td>
            <td>${amount.toLocaleString('vi-VN')} đ</td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-save-item" disabled data-bs-toggle="tooltip"
                        title="Lưu thay đổi">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-action btn-delete-item" data-bs-toggle="tooltip"
                        title="Xoá sản phẩm">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;

            // Thêm hàng mới vào bảng
            $('#editInvoiceItems').append(newRow);

            // Tính lại tổng tiền
            calculateInvoiceTotal();

            // Đóng modal và hiển thị thông báo
            $('#addMedicineModal').modal('hide');
            $('#editInvoiceModal').modal('show');
            showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã thêm thuốc vào hoá đơn!');

            // Reset nút
            $(this).prop('disabled', false);
            $(this).html('<i class="fas fa-plus me-1"></i> Thêm vào hoá đơn');

            // Khởi tạo lại tooltip
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }, 800);
    });

    // ===== 2. Xử lý lịch sử giao dịch =====

    // Khởi tạo date picker cho bộ lọc lịch sử
    flatpickr('#historyDateFilter', {
        mode: "range",
        dateFormat: "d/m/Y",
        locale: "vn",
        placeholder: "Từ ngày - Đến ngày"
    });

    // Hàm xem chi tiết hoá đơn từ lịch sử giao dịch
    window.viewInvoiceDetails = function (invoiceId) {
        // Đổi tab sang chi tiết hoá đơn
        $('#invoiceDetailTabs button[data-bs-target="#details"]').tab('show');

        // Cuộn lên đầu modal
        $('#invoiceDetailModal .modal-body').scrollTop(0);
    };

    // ===== 3. Các hàm tiện ích =====

    // Tính tổng tiền hoá đơn
    function calculateInvoiceTotal() {
        let total = 0;

        // Tính tổng phụ
        $('#editInvoiceItems tr').each(function () {
            const amount = parseFloat($(this).find('td:eq(4)').text().replace(/[^\d]/g, ''));
            total += amount;
        });

        // Hiển thị tổng phụ
        $('tfoot tr:eq(0) td:last').text(total.toLocaleString('vi-VN') + 'đ');

        // Áp dụng giảm giá (nếu có)
        const discount = $('#editDiscountSelect').val();
        let discountAmount = 0;
        let discountText = "";

        if (discount === 'percent10') {
            discountAmount = total * 0.1;
            discountText = "-" + discountAmount.toLocaleString('vi-VN') + "đ (10%)";
        } else if (discount === 'amount20k') {
            discountAmount = 20000;
            discountText = "-" + discountAmount.toLocaleString('vi-VN') + "đ";
        } else if (discount === 'freeship') {
            discountText = "Miễn phí giao hàng";
        } else {
            discountText = "0đ";
        }

        // Hiển thị giảm giá
        $('tfoot tr:eq(1) td:last').text(discountText);

        // Tính tổng thanh toán
        const finalTotal = total - discountAmount;

        // Hiển thị tổng thanh toán
        $('tfoot tr:eq(2) td:last').text(finalTotal.toLocaleString('vi-VN') + 'đ');
    }
    // Nút "Quay lại" trong modal thanh toán thẻ
    $('#paymentModal .btn-light').click(function (e) {
        e.preventDefault(); // Ngăn hành vi mặc định
        $('#paymentModal').modal('hide');
        // Đợi modal thanh toán đóng hoàn toàn rồi mới mở modal lập hóa đơn
        $('#createInvoiceModal').modal('show');
    });

    // Nút "Quay lại" trong modal thanh toán tiền mặt
    $('#cashPaymentModal .btn-light').click(function (e) {
        e.preventDefault();
        $('#cashPaymentModal').modal('hide');
        $('#createInvoiceModal').modal('show');
    });

    // Nút "Quay lại" trong modal thanh toán chuyển khoản
    $('#transferPaymentModal .btn-light').click(function (e) {
        e.preventDefault();
        $('#transferPaymentModal').modal('hide');
        $('#createInvoiceModal').modal('show');
    });

    // Nút "Quay lại" trong modal thanh toán MoMo
    $('#momoPaymentModal .btn-light').click(function (e) {
        e.preventDefault();
        $('#momoPaymentModal').modal('hide');
        $('#createInvoiceModal').modal('show');
    });
    // Sửa hàm completeInvoice để đảm bảo popup thông báo hiển thị sau khi thanh toán
    function completeInvoice(paymentMethod) {
        // Lưu thông tin hóa đơn vào cơ sở dữ liệu (trong thực tế)

        // Hiển thị thông báo thành công
        const methodText = {
            'cash': 'tiền mặt',
            'card': 'thẻ ngân hàng',
            'transfer': 'chuyển khoản',
            'momo': 'ví MoMo'
        };

        const methodIcon = {
            'cash': 'fa-money-bill-wave',
            'card': 'fa-credit-card',
            'transfer': 'fa-university',
            'momo': 'fa-mobile-alt'
        };

        // Thêm timeout nhỏ để đảm bảo modal đã đóng hoàn toàn trước khi hiển thị toast
        setTimeout(function () {
            // Sử dụng hàm showToast toàn cục
            window.showToast(`<i class="fas fa-check-circle text-success me-2"></i> Lập hóa đơn thành công! Thanh toán bằng <i class="fas ${methodIcon[paymentMethod]} ms-1 me-1"></i> ${methodText[paymentMethod]}.`);
        }, 300);

        // Reset form lập hóa đơn cho lần sử dụng tiếp theo
        resetInvoiceForm();

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
    // Xử lý khi thay đổi phương thức thanh toán
    $('#paymentMethodSelect').change(function () {
        const selectedOption = $(this).find('option:selected');
        const icon = selectedOption.data('icon');
        const color = selectedOption.data('color');

        // Cập nhật icon và màu sắc
        $('#paymentMethodIcon').attr('class', 'fas ' + icon + ' ' + color);
    });
    // Xử lý khách hàng mới
    $('#newCustomer').change(function () {
        if ($(this).is(':checked')) {
            $('#newCustomerInfo').removeClass('d-none');
        } else {
            $('#newCustomerInfo').addClass('d-none');
        }
    });

    // Xử lý khi click vào nút xem chi tiết
    $('.btn-action.view').click(function () {
        $('#invoiceDetailModal').modal('show');
    });

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

        // Khởi tạo lại tooltip
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    // Gọi hàm này sau khi tải dữ liệu
    $(document).ready(function () {
        // ...các code khởi tạo khác
        updateEditButtonStatus();
    });

    // Hàm hiển thị toast thông báo
    function showToast(message, type = 'success') {
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
    }

    // Xử lý khi nhập số lượng thuốc
    $('.quantity-input').change(function () {
        // Logic tính toán lại giá trị đơn hàng có thể được thêm vào đây
        console.log("Quantity changed:", $(this).val());
    });

    // Sự kiện khi click vào nút lọc nâng cao
    $('#applyFilter').click(function () {
        $('#filterModal').modal('hide');

        // Hiển thị thông báo
        showToast('Đã áp dụng bộ lọc thành công!');

        // Logic lọc dữ liệu
        console.log("Filters applied");
    });

    // Xử lý reset filter
    $('#resetFilter').click(function () {
        $('#advancedFilterForm')[0].reset();
    });
    // Xử lý khi thay đổi ưu đãi áp dụng trong lập hoá đơn
    $('#discountSelect').change(function () {
        // Nếu chọn tự động áp dụng ưu đãi tốt nhất
        if ($('#autoDiscount').is(':checked')) {
            // Hiển thị trạng thái đang xử lý
            $(this).prop('disabled', true);
            setTimeout(() => {
                // Giả lập tìm thấy ưu đãi tốt nhất là giảm 10%
                $(this).val('percent10');
                $(this).prop('disabled', false);

                // Tính lại tổng tiền
                updateTotals();
                showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã áp dụng ưu đãi tốt nhất cho khách hàng!');
            }, 800);
        } else {
            // Tính lại tổng tiền
            updateTotals();
        }
    });
    // Xử lý checkbox áp dụng ưu đãi tự động trong lập hoá đơn
    $('#autoDiscount').change(function () {
        if ($(this).is(':checked')) {
            $('#discountSelect').prop('disabled', true);
            setTimeout(() => {
                $('#discountSelect').val('percent10');
                $('#discountSelect').prop('disabled', false);
                updateTotals();
                showToast('<i class="fas fa-check-circle text-success me-2"></i> Đã áp dụng ưu đãi tốt nhất cho khách hàng!');
            }, 800);
        }
    });
    // Thêm vào script
    function validateInvoiceForm() {
        let isValid = true;
        const errors = {};

        // Kiểm tra khách hàng
        if (!$('#customerName').val()) {
            errors.customerName = "Vui lòng nhập tên khách hàng để lập hóa đơn";
            isValid = false;
        }

        // Kiểm tra danh sách thuốc
        if ($('#medicineList tr').length === 0) {
            errors.medicineList = "Hóa đơn phải có ít nhất một sản phẩm";
            isValid = false;
        }

        // Kiểm tra số lượng
        $('.quantity-input').each(function () {
            const value = $(this).val();
            if (!value || isNaN(value) || parseInt(value) <= 0) {
                errors.quantity = "Số lượng phải là số dương";
                isValid = false;
                return false; // break loop
            }
        });

        // Hiển thị lỗi
        if (!isValid) {
            Object.keys(errors).forEach(key => {
                showToast(errors[key], 'error');
            });
        }

        return isValid;
    }

    // Xử lý khi nhấn nút Lưu hóa đơn
    $('#saveInvoiceBtn').click(function () {
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

    // 2. Xử lý khi click vào nút xác nhận thanh toán thẻ
    $('#confirmPaymentBtn').click(function () {
        console.log("Xác nhận thanh toán thẻ");
        // Kiểm tra thông tin thẻ
        if (!validateCardInfo()) {
            return;
        }
        // Xử lý thanh toán
        processPayment();
    });

    // 3. Xử lý khi click vào nút xác nhận thanh toán tiền mặt
    $('#confirmCashPaymentBtn').click(function () {
        // Xử lý thanh toán tiền mặt
        completeCashPayment();
    });

    // 4. Xử lý khi click vào nút xác nhận thanh toán chuyển khoản
    $('#confirmTransferPaymentBtn').click(function () {
        // Kiểm tra đã tick xác nhận hoàn tất chuyển khoản chưa
        if (!$('#transferCompleted').is(':checked')) {
            showToast('Vui lòng xác nhận đã hoàn tất chuyển khoản!', 'error');
            return;
        }
        // Xử lý thanh toán chuyển khoản
        completeTransferPayment();
    });

    // 5. Xử lý khi click vào nút xác nhận thanh toán MoMo
    $('#confirmMomoPaymentBtn').click(function () {
        // Kiểm tra đã tick xác nhận hoàn tất thanh toán MoMo chưa
        if (!$('#momoCompleted').is(':checked')) {
            showToast('Vui lòng xác nhận đã hoàn tất thanh toán qua MoMo!', 'error');
            return;
        }
        // Xử lý thanh toán MoMo
        completeMomoPayment();
    });

    // 6. Reset form khi đóng modal
    $('#paymentModal, #cashPaymentModal, #transferPaymentModal, #momoPaymentModal').on('hidden.bs.modal', function () {
        resetPaymentForms();
    });

    // 7. Tính tiền thối khi nhập tiền khách đưa
    $('#cashReceived').on('input', function () {
        calculateChange();
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

function showPaymentProcessing() {
    // Thay đổi nội dung nút
    $('#confirmPaymentBtn').prop('disabled', true);
    $('#confirmPaymentBtn').html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý');

    // Xóa overlay cũ nếu có
    $('#paymentForm').find('.position-absolute').remove();

    // Thêm overlay loading lên form với z-index cao
    const loadingOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1050;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-primary mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xử lý thanh toán...</p>' +
        '</div>' +
        '</div>');

    // Đảm bảo form có position relative
    $('#paymentForm').css('position', 'relative').append(loadingOverlay);
}

function handlePaymentSuccess() {
    // Ẩn overlay loading
    $('#paymentForm').find('.position-absolute').remove();

    // Hiển thị thông báo thành công
    const successAlert = $('<div class="alert alert-success mt-3">' +
        '<div class="d-flex">' +
        '<div class="me-3">' +
        '<i class="fas fa-check-circle fs-3"></i>' +
        '</div>' +
        '<div>' +
        '<h6 class="alert-heading mb-1">Thanh toán thành công!</h6>' +
        '<p class="mb-0">Giao dịch của bạn đã được xử lý thành công.</p>' +
        '</div>' +
        '</div>' +
        '</div>');

    $('#paymentForm').append(successAlert);

    // Đổi nút thành "Hoàn tất"
    $('#confirmPaymentBtn').prop('disabled', false);
    $('#confirmPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Hoàn tất');
    $('#confirmPaymentBtn').removeClass('btn-primary').addClass('btn-success');

    // Thay đổi hành vi nút để đóng modal và hoàn tất hóa đơn
    $('#confirmPaymentBtn').off('click').click(function () {
        resetPaymentForms();
        $('#paymentModal').modal('hide');
        completeInvoice('card');
    });

    // Tự động đóng form sau 5 giây (tùy chọn)
    setTimeout(function () {
        resetPaymentForms();
        $('#paymentModal').modal('hide');
        completeInvoice('card');
    }, 5000);
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

    // Đổi nút thành "Thử lại"
    $('#confirmPaymentBtn').prop('disabled', false);
    $('#confirmPaymentBtn').html('<i class="fas fa-redo me-1"></i> Thử lại');
    $('#confirmPaymentBtn').removeClass('btn-primary').addClass('btn-danger');

    // Thay đổi hành vi nút để thử lại thanh toán
    $('#confirmPaymentBtn').off('click').click(function () {
        $(this).prop('disabled', true);
        $(this).html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý...');

        // Gọi lại hàm xử lý thanh toán
        processPayment();
    });
}

function resetPaymentForms() {
    console.log("Đang reset form thanh toán...");

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

    // Reset lại nút về trạng thái ban đầu - Thẻ ngân hàng
    $('#confirmPaymentBtn').prop('disabled', false);
    $('#confirmPaymentBtn').removeClass('btn-success btn-danger').addClass('btn-primary');
    $('#confirmPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Xác nhận thanh toán');

    // Reset lại nút về trạng thái ban đầu - Chuyển khoản
    $('#confirmTransferPaymentBtn').prop('disabled', false);
    $('#confirmTransferPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Xác nhận thanh toán');

    // Reset lại nút về trạng thái ban đầu - MoMo
    $('#confirmMomoPaymentBtn').prop('disabled', false);
    $('#confirmMomoPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Xác nhận thanh toán');

    // Gắn lại sự kiện click ban đầu cho thanh toán thẻ
    $('#confirmPaymentBtn').off('click').on('click', function () {
        console.log("Click xác nhận thanh toán sau khi reset");
        if (!validateCardInfo()) {
            return;
        }
        processPayment();
    });

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
    // updateTotals(); // Bỏ comment nếu muốn reset tổng tiền
}

function completeInvoice(paymentMethod) {
    // Lưu thông tin hóa đơn vào cơ sở dữ liệu (trong thực tế)

    // Hiển thị thông báo thành công
    const methodText = {
        'cash': 'tiền mặt',
        'card': 'thẻ ngân hàng',
        'transfer': 'chuyển khoản',
        'momo': 'ví MoMo'
    };

    const methodIcon = {
        'cash': 'fa-money-bill-wave',
        'card': 'fa-credit-card',
        'transfer': 'fa-university',
        'momo': 'fa-mobile-alt'
    };

    showToast(`<i class="fas fa-check-circle text-success me-2"></i> Lập hóa đơn thành công! Thanh toán bằng <i class="fas ${methodIcon[paymentMethod]} ms-1 me-1"></i> ${methodText[paymentMethod]}.`);

    // Reset form lập hóa đơn cho lần sử dụng tiếp theo
    resetInvoiceForm();

    // Đóng modal lập hóa đơn nếu đang mở
    $('#createInvoiceModal').modal('hide');
}

// Hàm kiểm tra thông tin thẻ
function validateCardInfo() {
    // Lấy các giá trị từ form
    const bankName = $('#bankName').val();
    const cardType = $('#cardType').val();
    const cardNumber = $('#cardNumber').val();
    const cardHolderName = $('#cardHolderName').val();
    const expiryDate = $('#expiryDate').val();
    const cvv = $('#cvv').val();
    const phoneNumber = $('#phoneNumber').val();

    // Kiểm tra các trường bắt buộc
    if (!bankName) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng chọn ngân hàng!', 'error');
        return false;
    }

    if (!cardType) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng chọn loại thẻ!', 'error');
        return false;
    }

    if (!cardNumber) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập số thẻ!', 'error');
        return false;
    }

    if (!cardHolderName) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập tên chủ thẻ!', 'error');
        return false;
    }

    if (!expiryDate) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng chọn ngày hết hạn!', 'error');
        return false;
    }

    if (!cvv) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập mã CVV/CVC!', 'error');
        return false;
    }

    if (!phoneNumber) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập số điện thoại!', 'error');
        return false;
    }

    // Kiểm tra định dạng số thẻ (chỉ chấp nhận số và khoảng trắng)
    const cardNumberCleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cardNumberCleaned) || cardNumberCleaned.length < 13 || cardNumberCleaned.length > 19) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số thẻ không hợp lệ!', 'error');
        return false;
    }

    // Kiểm tra mã CVV (3-4 số)
    if (!/^\d{3,4}$/.test(cvv)) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Mã CVV không hợp lệ!', 'error');
        return false;
    }

    // Kiểm tra số điện thoại
    if (!/^0\d{9}$/.test(phoneNumber)) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số điện thoại không hợp lệ!', 'error');
        return false;
    }

    return true;
}

// Hàm tính tiền thối cho thanh toán tiền mặt
function calculateChange() {
    const totalAmount = parseFloat($('#cashPaymentTotalAmount').text().replace(/[^\d]/g, ''));
    const received = parseFloat($('#cashReceived').val().replace(/[^\d]/g, '')) || 0;

    const change = received - totalAmount;

    if (change >= 0) {
        $('#cashChange').val(change.toLocaleString('vi-VN') + ' đ');
    } else {
        $('#cashChange').val('0 đ');
    }
}

// Xử lý thanh toán tiền mặt
function completeCashPayment() {
    const totalAmount = parseFloat($('#cashPaymentTotalAmount').text().replace(/[^\d]/g, ''));
    const received = parseFloat($('#cashReceived').val().replace(/[^\d]/g, '')) || 0;

    if (received < totalAmount) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số tiền khách đưa chưa đủ!', 'error');
        return;
    }

    // Đóng modal thanh toán
    $('#cashPaymentModal').modal('hide');

    // Hoàn tất hóa đơn
    completeInvoice('cash');
}

// Xử lý thanh toán chuyển khoản
function completeTransferPayment() {
    // Hiển thị loading
    showTransferProcessing();

    // Giả lập xử lý thanh toán trong 5 giây
    setTimeout(function () {
        // Đóng modal thanh toán
        $('#transferPaymentModal').modal('hide');

        // Hoàn tất hóa đơn
        completeInvoice('transfer');
    }, 5000);
}

// Hiển thị hiệu ứng loading khi xử lý thanh toán chuyển khoản
function showTransferProcessing() {
    // Thay đổi nội dung nút
    $('#confirmTransferPaymentBtn').prop('disabled', true);
    $('#confirmTransferPaymentBtn').html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý...');

    // Xóa overlay cũ nếu có
    $('#transferPaymentForm').find('.position-absolute').remove();

    // Thêm overlay loading lên form
    const loadingOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1050;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-info mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh giao dịch...</p>' +
        '</div>' +
        '</div>');

    // Đảm bảo form có position relative
    $('#transferPaymentForm').css('position', 'relative').append(loadingOverlay);

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-info mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh giao dịch...</p>' +
        '</div>' +
        '</div>');

    $('#transferPaymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}

// Xử lý thanh toán MoMo
function completeMomoPayment() {
    // Hiển thị loading
    showMomoProcessing();

    // Giả lập xử lý thanh toán trong 5 giây
    setTimeout(function () {
        // Đóng modal thanh toán
        $('#momoPaymentModal').modal('hide');

        // Hoàn tất hóa đơn
        completeInvoice('momo');
    }, 5000);
}

// Hiển thị hiệu ứng loading khi xử lý thanh toán MoMo
function showMomoProcessing() {
    // Thay đổi nội dung nút
    $('#confirmMomoPaymentBtn').prop('disabled', true);
    $('#confirmMomoPaymentBtn').html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý...');

    // Xóa overlay cũ nếu có
    $('#momoPaymentForm').find('.position-absolute').remove();

    // Thêm overlay loading lên form
    const loadingOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1050;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-danger mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh thanh toán MoMo...</p>' +
        '</div>' +
        '</div>');

    // Đảm bảo form có position relative
    $('#momoPaymentForm').css('position', 'relative').append(loadingOverlay);

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-danger mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh thanh toán MoMo...</p>' +
        '</div>' +
        '</div>');

    $('#momoPaymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}

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
    // Ẩn overlay loading
    $('#paymentForm').find('.position-absolute').remove();

    // Hiển thị thông báo thành công
    const successAlert = $('<div class="alert alert-success mt-3">' +
        '<div class="d-flex">' +
        '<div class="me-3">' +
        '<i class="fas fa-check-circle fs-3"></i>' +
        '</div>' +
        '<div>' +
        '<h6 class="alert-heading mb-1">Thanh toán thành công!</h6>' +
        '<p class="mb-0">Giao dịch của bạn đã được xử lý thành công.</p>' +
        '</div>' +
        '</div>' +
        '</div>');

    $('#paymentForm').append(successAlert);

    // Đổi nút thành "Hoàn tất"
    $('#confirmPaymentBtn').prop('disabled', false);
    $('#confirmPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Hoàn tất');
    $('#confirmPaymentBtn').removeClass('btn-primary').addClass('btn-success');

    // Thay đổi hành vi nút để đóng modal và hoàn tất hóa đơn
    $('#confirmPaymentBtn').off('click').click(function () {
        resetPaymentForms();
        $('#paymentModal').modal('hide');
        completeInvoice('card');
    });

    // Tự động đóng form sau 5 giây (tùy chọn)
    setTimeout(function () {
        resetPaymentForms();
        $('#paymentModal').modal('hide');
        completeInvoice('card');
    }, 5000);
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

    // Đổi nút thành "Thử lại"
    $('#confirmPaymentBtn').prop('disabled', false);
    $('#confirmPaymentBtn').html('<i class="fas fa-redo me-1"></i> Thử lại');
    $('#confirmPaymentBtn').removeClass('btn-primary').addClass('btn-danger');

    // Thay đổi hành vi nút để thử lại thanh toán
    $('#confirmPaymentBtn').off('click').click(function () {
        $(this).prop('disabled', true);
        $(this).html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý...');

        // Gọi lại hàm xử lý thanh toán
        processPayment();
    });
}

function resetPaymentForms() {
    console.log("Đang reset form thanh toán...");

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

    // Reset lại nút về trạng thái ban đầu - Thẻ ngân hàng
    $('#confirmPaymentBtn').prop('disabled', false);
    $('#confirmPaymentBtn').removeClass('btn-success btn-danger').addClass('btn-primary');
    $('#confirmPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Xác nhận thanh toán');

    // Reset lại nút về trạng thái ban đầu - Chuyển khoản
    $('#confirmTransferPaymentBtn').prop('disabled', false);
    $('#confirmTransferPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Xác nhận thanh toán');

    // Reset lại nút về trạng thái ban đầu - MoMo
    $('#confirmMomoPaymentBtn').prop('disabled', false);
    $('#confirmMomoPaymentBtn').html('<i class="fas fa-check-circle me-1"></i> Xác nhận thanh toán');

    // Gắn lại sự kiện click ban đầu cho thanh toán thẻ
    $('#confirmPaymentBtn').off('click').on('click', function () {
        console.log("Click xác nhận thanh toán sau khi reset");
        if (!validateCardInfo()) {
            return;
        }
        processPayment();
    });

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
    $('input[name="paymentMethod"][value="cash"]').prop('checked', true);
    $('#discountSelect').val('');
    $('#autoDiscount').prop('checked', false);
    $('#invoiceNotes').val('');

    // Reset các tổng tiền
    // updateTotals(); // Bỏ comment nếu muốn reset tổng tiền
}

function completeInvoice(paymentMethod) {
    // Lưu thông tin hóa đơn vào cơ sở dữ liệu (trong thực tế)

    // Hiển thị thông báo thành công
    const methodText = {
        'cash': 'tiền mặt',
        'card': 'thẻ ngân hàng',
        'transfer': 'chuyển khoản',
        'momo': 'ví MoMo'
    };

    const methodIcon = {
        'cash': 'fa-money-bill-wave',
        'card': 'fa-credit-card',
        'transfer': 'fa-university',
        'momo': 'fa-mobile-alt'
    };

    showToast(`<i class="fas fa-check-circle text-success me-2"></i> Lập hóa đơn thành công! Thanh toán bằng <i class="fas ${methodIcon[paymentMethod]} ms-1 me-1"></i> ${methodText[paymentMethod]}.`);

    // Reset form lập hóa đơn cho lần sử dụng tiếp theo
    resetInvoiceForm();

    // Đóng modal lập hóa đơn nếu đang mở
    $('#createInvoiceModal').modal('hide');
}

// Hàm kiểm tra thông tin thẻ
function validateCardInfo() {
    // Lấy các giá trị từ form
    const bankName = $('#bankName').val();
    const cardType = $('#cardType').val();
    const cardNumber = $('#cardNumber').val();
    const cardHolderName = $('#cardHolderName').val();
    const expiryDate = $('#expiryDate').val();
    const cvv = $('#cvv').val();
    const phoneNumber = $('#phoneNumber').val();

    // Kiểm tra các trường bắt buộc
    if (!bankName) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng chọn ngân hàng!', 'error');
        return false;
    }

    if (!cardType) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng chọn loại thẻ!', 'error');
        return false;
    }

    if (!cardNumber) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập số thẻ!', 'error');
        return false;
    }

    if (!cardHolderName) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập tên chủ thẻ!', 'error');
        return false;
    }

    if (!expiryDate) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng chọn ngày hết hạn!', 'error');
        return false;
    }

    if (!cvv) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập mã CVV/CVC!', 'error');
        return false;
    }

    if (!phoneNumber) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Vui lòng nhập số điện thoại!', 'error');
        return false;
    }

    // Kiểm tra định dạng số thẻ (chỉ chấp nhận số và khoảng trắng)
    const cardNumberCleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cardNumberCleaned) || cardNumberCleaned.length < 13 || cardNumberCleaned.length > 19) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số thẻ không hợp lệ!', 'error');
        return false;
    }

    // Kiểm tra mã CVV (3-4 số)
    if (!/^\d{3,4}$/.test(cvv)) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Mã CVV không hợp lệ!', 'error');
        return false;
    }

    // Kiểm tra số điện thoại
    if (!/^0\d{9}$/.test(phoneNumber)) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số điện thoại không hợp lệ!', 'error');
        return false;
    }

    return true;
}

// Hàm tính tiền thối cho thanh toán tiền mặt
function calculateChange() {
    const totalAmount = parseFloat($('#cashPaymentTotalAmount').text().replace(/[^\d]/g, ''));
    const received = parseFloat($('#cashReceived').val().replace(/[^\d]/g, '')) || 0;

    const change = received - totalAmount;

    if (change >= 0) {
        $('#cashChange').val(change.toLocaleString('vi-VN') + ' đ');
    } else {
        $('#cashChange').val('0 đ');
    }
}

// Xử lý thanh toán tiền mặt
function completeCashPayment() {
    const totalAmount = parseFloat($('#cashPaymentTotalAmount').text().replace(/[^\d]/g, ''));
    const received = parseFloat($('#cashReceived').val().replace(/[^\d]/g, '')) || 0;

    if (received < totalAmount) {
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Số tiền khách đưa chưa đủ!', 'error');
        return;
    }

    // Đóng modal thanh toán
    $('#cashPaymentModal').modal('hide');

    // Hoàn tất hóa đơn
    completeInvoice('cash');
}

// Xử lý thanh toán chuyển khoản
function completeTransferPayment() {
    // Hiển thị loading
    showTransferProcessing();

    // Giả lập xử lý thanh toán trong 5 giây
    setTimeout(function () {
        // Đóng modal thanh toán
        $('#transferPaymentModal').modal('hide');

        // Hoàn tất hóa đơn
        completeInvoice('transfer');
    }, 5000);
}

// Hiển thị hiệu ứng loading khi xử lý thanh toán chuyển khoản
function showTransferProcessing() {
    // Thay đổi nội dung nút
    $('#confirmTransferPaymentBtn').prop('disabled', true);
    $('#confirmTransferPaymentBtn').html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý');

    // Xóa overlay cũ nếu có
    $('#transferPaymentForm').find('.position-absolute').remove();

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-info mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh giao dịch...</p>' +
        '</div>' +
        '</div>');

    $('#transferPaymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}

// Xử lý thanh toán MoMo
function completeMomoPayment() {
    // Hiển thị loading
    showMomoProcessing();

    // Giả lập xử lý thanh toán trong 5 giây
    setTimeout(function () {
        // Đóng modal thanh toán
        $('#momoPaymentModal').modal('hide');

        // Hoàn tất hóa đơn
        completeInvoice('momo');
    }, 5000);
}

// Hiển thị hiệu ứng loading khi xử lý thanh toán MoMo
function showMomoProcessing() {
    // Thay đổi nội dung nút
    $('#confirmMomoPaymentBtn').prop('disabled', true);
    $('#confirmMomoPaymentBtn').html('<i class="fas fa-spinner fa-spin me-1"></i> Đang xử lý');

    // Xóa overlay cũ nếu có
    $('#momoPaymentForm').find('.position-absolute').remove();

    // Thêm overlay cho toàn bộ modal body
    const modalOverlay = $('<div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 1040;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-danger mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang xác minh thanh toán MoMo...</p>' +
        '</div>' +
        '</div>');

    $('#momoPaymentModal .modal-body').css('position', 'relative').append(modalOverlay);
}
// Hàm in hóa đơn
function printInvoice() {
    // Hiển thị overlay loading
    const loadingOverlay = $('<div class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 2000;">' +
        '<div class="text-center">' +
        '<div class="spinner-border text-primary mb-2" role="status"></div>' +
        '<p class="mb-0 fw-bold">Đang tạo hóa đơn...</p>' +
        '</div>' +
        '</div>');

    $('body').append(loadingOverlay);

    // Lấy thông tin hóa đơn từ modal chi tiết
    const invoiceId = $('#invoiceDetailModal .modal-title').text().split('#')[1] || 'HD001';
    const customerName = $('#invoiceDetailModal .card-body p:contains("Khách hàng")').text().split(':')[1].trim();
    const customerPhone = $('#invoiceDetailModal .card-body p:contains("Số điện thoại")').text().split(':')[1].trim();
    const invoiceDate = $('#invoiceDetailModal .card-body p:contains("Ngày lập")').text().split(':')[1].trim();
    const paymentMethod = $('#invoiceDetailModal .card-body p:contains("Hình thức")').text().split(':')[1].trim();

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
    doc.text('Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM', 105, 25, { align: 'center' });
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
    const discount = $('#invoiceDetailModal tfoot tr:nth-child(2) td:last-child').text().trim();
    const total = $('#invoiceDetailModal tfoot tr:nth-child(3) td:last-child').text().trim();

    // Thêm phần tổng tiền
    doc.setFontSize(10);
    doc.text('Tổng phụ:', 140, y);
    doc.text(subtotal, 170, y);
    y += 7;

    doc.text('Giảm giá:', 140, y);
    doc.text(discount, 170, y);
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

        // Hiển thị thông báo thành công
        showToast('<i class="fas fa-check-circle text-success me-2"></i> In hoá đơn thành công!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('<i class="fas fa-exclamation-circle text-danger me-2"></i> Có lỗi xảy ra khi in hoá đơn!', 'error');
    } finally {
        // Xóa overlay loading
        loadingOverlay.remove();
    }
}
// Gắn sự kiện cho nút In hóa đơn
$(document).on('click', '#invoiceDetailModal .modal-footer .btn-primary', function () {
    printInvoice();
});