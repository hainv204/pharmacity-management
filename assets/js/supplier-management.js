
// Xử lý đóng mở modal
document.getElementById('viewMedicineReceiptModal').addEventListener('hidden.bs.modal', function () {
  var modalPhieuNhap = new bootstrap.Modal(document.getElementById('medicineReceiptModal'));
  modalPhieuNhap.show();
});
document.getElementById('editMedicineReceiptModal').addEventListener('hidden.bs.modal', function () {
  var modalPhieuNhap = new bootstrap.Modal(document.getElementById('medicineReceiptModal'));
  modalPhieuNhap.show();
});
document.getElementById('addMedicineReceiptModal').addEventListener('hidden.bs.modal', function () {
  var modalPhieuNhap = new bootstrap.Modal(document.getElementById('medicineReceiptModal'));
  modalPhieuNhap.show();
});
document.getElementById('deleteMedicineReceiptModal').addEventListener('hidden.bs.modal', function () {
  var modalPhieuNhap = new bootstrap.Modal(document.getElementById('medicineReceiptModal')); 
  modalPhieuNhap.show();
});

//===================== QUẢN LÝ NHÀ CUNG CẤP ====================
// Dữ liệu mẫu
let suppliers = [
  {
    id: 'NCC001',
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    address: '230A Đống Đa, Q. Hải Châu, Đà Nẵng',
    link: 'Xem phiếu nhập',
    receipts: [
      {
        id: 'P001',
        date: '2025-07-08 18:35',
        total: 500000,
        details: [
          { code: 'T001', name: 'Paracetamol', date: '2025-07-08', price: 5000, quantity: 100 }
        ]
      }
    ]
  },
  // ... các nhà cung cấp khác
];
let currentSupplierIdx = null; // Chỉ số NCC đang xem phiếu nhập
let currentReceiptIdx = null;  // Chỉ số phiếu nhập đang sửa/xóa


//===================== NHÀ CUNG CẤP ====================
// Render bảng nhà cung cấp
function renderSuppliers() {
  const tbody = document.querySelector('#suppliersTable tbody');
  tbody.innerHTML = '';
  suppliers.forEach((supplier, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${supplier.id}</td>
      <td>${supplier.name}</td>
      <td>${supplier.phone}</td>
      <td>${supplier.address}</td>
      <td><a href="#medicineReceiptModal" class="text-decoration-underline" data-bs-toggle="modal" data-bs-target="#medicineReceiptModal" data-idx="${idx}">${supplier.link}</a></td>
      <td>
        <button class="btn btn-sm btn-light border me-1 btn-edit" data-idx="${idx}" data-bs-toggle="modal" data-bs-target="#editSupplierModal"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-light border btn-delete" data-idx="${idx}" data-bs-toggle="modal" data-bs-target="#deleteSupplierModal"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  bindEditEvents();
  bindDeleteEvents();
  bindSupplierReceiptLinks(); // Gán lại sự kiện sau mỗi lần render
}
// Gán sự kiện cho link "Xem phiếu nhập" trong bảng nhà cung cấp
function bindSupplierReceiptLinks() {
  document.querySelectorAll('#suppliersTable .text-decoration-underline').forEach(a => {
    a.onclick = function() {
      const idx = +a.getAttribute('data-idx');
      showMedicineReceipts(idx);
    };
  });
}


// Hàm để thiết lập trạng thái hợp lệ cho các trường nhập liệu
function setValidation(input, isValid) {
  if (!isValid) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
}

// ====================== THÊM NHÀ CUNG CẤP ====================
// Hàm kiểm tra hợp lệ và thêm nhà cung cấp
document.getElementById('addSupplierForm').onsubmit = function(e) {
  e.preventDefault();

  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');

  // Kiểm tra hợp lệ
  const nameValid = /^[^\d!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+$/.test(name.value.trim()) && name.value.trim() !== '';
  setValidation(name, nameValid);

  const phoneValid = /^\d{10,}$/.test(phone.value.trim());
  setValidation(phone, phoneValid);

  const addressValid = address.value.trim() !== '';
  setValidation(address, addressValid);

  // Nếu có lỗi, không thêm
  if (!nameValid || !phoneValid || !addressValid) return;

  // Thêm vào mảng và render lại bảng
  const newId = 'NCC' + String(suppliers.length + 1).padStart(3, '0');
  suppliers.push({ id: newId, name: name.value.trim(), phone: phone.value.trim(), address: address.value.trim(), link: 'Xem phiếu nhập' });
  renderSuppliers();
  document.getElementById('addSupplierForm').reset();
  bootstrap.Modal.getInstance(document.getElementById('addSupplierModal')).hide();
  //Hiển thị thông báo thành công
  const alertDiv = document.getElementById('supplier-added-alert');
  alertDiv.style.display = 'flex';
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 2000);
};



// Khi modal Thêm nhà cung cấp mở, ẩn chỉ báo lỗi
$('#addSupplierModal').on('show.bs.modal', function () {
  ['name', 'phone', 'address'].forEach(function(id) {
    document.getElementById(id).classList.remove('is-invalid');
  });
  document.getElementById('addSupplierForm').reset();
});




// ===================== Sửa NHÀ CUNG CẤP ====================
let editingIdx = null;
function bindEditEvents() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = function() {
      editingIdx = +btn.getAttribute('data-idx');
      const supplier = suppliers[editingIdx];
      document.getElementById('name1').value = supplier.name;
      document.getElementById('phone1').value = supplier.phone;
      document.getElementById('address1').value = supplier.address;
    };
  });
}
document.getElementById('editSupplierForm').onsubmit = function(e) {
  e.preventDefault();
  if (editingIdx === null) return;

  // Kiểm tra hợp lệ như logic submitBtn1
  const name = document.getElementById('name1');
  const phone = document.getElementById('phone1');
  const address = document.getElementById('address1');

  // Kiểm tra tên: không chứa số, ký tự đặc biệt, không rỗng
  const nameValid = /^[^\d!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+$/.test(name.value.trim()) && name.value.trim() !== '';
  setValidation(name, nameValid);

  // Kiểm tra số điện thoại: chỉ số, ít nhất 10 ký tự
  const phoneValid = /^\d{10,}$/.test(phone.value.trim());
  setValidation(phone, phoneValid);

  // Kiểm tra địa chỉ: không rỗng
  const addressValid = address.value.trim() !== '';
  setValidation(address, addressValid);

  if (!nameValid || !phoneValid || !addressValid) return;

  suppliers[editingIdx].name = name.value.trim();
  suppliers[editingIdx].phone = phone.value.trim();
  suppliers[editingIdx].address = address.value.trim();
  renderSuppliers();
  bootstrap.Modal.getInstance(document.getElementById('editSupplierModal')).hide();

  // Hiển thị thông báo thành công
  const alertDiv = document.getElementById('supplier-edited-alert');
  alertDiv.style.display = 'flex';
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 2000);
};

// Khi modal Sửa nhà cung cấp mở, ẩn chỉ báo lỗi
$('#editSupplierModal').on('show.bs.modal', function () {
  ['name1', 'phone1', 'address1'].forEach(function(id) {
    document.getElementById(id).classList.remove('is-invalid');
  });
  document.getElementById('editSupplierForm').reset();
});

//======================= Xóa NHÀ CUNG CẤP ====================
let deletingIdx = null;
function bindDeleteEvents() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = function() {
      deletingIdx = +btn.getAttribute('data-idx');
    };
  });
}
document.getElementById('confirmDeleteSupplierBtn').onclick = function() {
  if (deletingIdx === null) return;
  suppliers.splice(deletingIdx, 1);
  renderSuppliers();
  // Đóng modal xác nhận xóa
  bootstrap.Modal.getInstance(document.getElementById('deleteSupplierModal')).hide();
  // Hiển thị thông báo thành công
  const alertDiv = document.getElementById('supplier-deleted-alert');
  alertDiv.style.display = 'flex';
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 2000);
  deletingIdx = null;
};





//===================== PHIẾU NHẬP THUỐC =====================

// Hiển thị danh sách phiếu nhập thuốc cho nhà cung cấp
function showMedicineReceipts(supplierIdx) {
  currentSupplierIdx = supplierIdx;
  const supplier = suppliers[supplierIdx];
  const tbody = document.querySelector('#medicineReceiptModal tbody');
  tbody.innerHTML = '';
  if (!supplier.receipts || supplier.receipts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có phiếu nhập</td></tr>';
    return;
  }
  supplier.receipts.forEach((receipt, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center">${receipt.id}</td>
      <td class="text-center">${receipt.date}</td>
      <td class="text-end">${receipt.total.toLocaleString()}</td>
      <td class="text-center">
        <button class="btn btn-light btn-sm me-1 btn-eye" data-bs-toggle="modal" data-bs-target="#viewMedicineReceiptModal" data-idx="${idx}"><i class="fas fa-eye"></i></button>
        <button class="btn btn-light btn-sm me-1 btn-edit-receipt" data-bs-toggle="modal" data-bs-target="#editMedicineReceiptModal" data-idx="${idx}"><i class="fas fa-edit"></i></button>
        <button class="btn btn-light btn-sm btn-delete-receipt" data-bs-toggle="modal" data-bs-target="#deleteMedicineReceiptModal" data-idx="${idx}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  bindReceiptActionEvents();
  editReceiptActionEvents();
  deleteReceiptActionEvents();
}



// ===================== TẠO PHIẾU NHẬP MỚI =====================

// Khi mở modal tạo phiếu nhập, reset danh sách thuốc tạm
$('#addMedicineReceiptModal').on('show.bs.modal', function () {
  newReceiptDrugs = [];
  renderDrugListInReceipt();
  document.getElementById('addMedicineReceiptForm').reset();
  ['ten-thuoc-add', 'so-luong-add', 'don-gia-add'].forEach(id => document.getElementById(id).classList.remove('is-invalid'));
  document.getElementById('addChiTietBtn').style.display = '';
  document.getElementById('editChiTietBtn').style.display = '';
});

// Thêm thuốc vào danh sách tạm
document.getElementById('addChiTietBtn').onclick = function() {
  const tenThuoc = document.getElementById('ten-thuoc-add');
  const soLuong = document.getElementById('so-luong-add');
  const donGia = document.getElementById('don-gia-add');
  let valid = true;
  if (!tenThuoc.value.trim()) { setValidation(tenThuoc, false); valid = false; } else setValidation(tenThuoc, true);
  if (!soLuong.value.trim() || Number(soLuong.value) <= 0) { setValidation(soLuong, false); valid = false; } else setValidation(soLuong, true);
  if (!donGia.value.trim() || Number(donGia.value) <= 0) { setValidation(donGia, false); valid = false; } else setValidation(donGia, true);
  if (!valid) return;

  newReceiptDrugs.push({
    code: 'T' + Date.now() + Math.floor(Math.random()*1000),
    name: tenThuoc.value.trim(),
    date: new Date().toISOString().slice(0, 10),
    price: Number(donGia.value),
    quantity: Number(soLuong.value)
  });
  renderDrugListInReceipt();
  document.getElementById('addMedicineReceiptForm').reset();
};

// Sửa thuốc trong danh sách tạm
window.editDrugInReceipt = function(idx) {
  const drug = newReceiptDrugs[idx];
  document.getElementById('ten-thuoc-add').value = drug.name;
  document.getElementById('so-luong-add').value = drug.quantity;
  document.getElementById('don-gia-add').value = drug.price;
  document.getElementById('addChiTietBtn').style.display = '';
  document.getElementById('editChiTietBtn').style.display = '';
  document.getElementById('editChiTietBtn').onclick = function() {
    // Validate lại
    const tenThuoc = document.getElementById('ten-thuoc-add');
    const soLuong = document.getElementById('so-luong-add');
    const donGia = document.getElementById('don-gia-add');
    let valid = true;
    if (!tenThuoc.value.trim()) { setValidation(tenThuoc, false); valid = false; } else setValidation(tenThuoc, true);
    if (!soLuong.value.trim() || Number(soLuong.value) <= 0) { setValidation(soLuong, false); valid = false; } else setValidation(soLuong, true);
    if (!donGia.value.trim() || Number(donGia.value) <= 0) { setValidation(donGia, false); valid = false; } else setValidation(donGia, true);
    if (!valid) return;

    newReceiptDrugs[idx].name = tenThuoc.value.trim();
    newReceiptDrugs[idx].quantity = Number(soLuong.value);
    newReceiptDrugs[idx].price = Number(donGia.value);
    renderDrugListInReceipt();
    document.getElementById('addMedicineReceiptForm').reset();
    document.getElementById('addChiTietBtn').style.display = '';
    document.getElementById('editChiTietBtn').style.display = '';
  };
};

// Xóa thuốc khỏi danh sách tạm
window.deleteDrugInReceipt = function(idx) {
  newReceiptDrugs.splice(idx, 1);
  renderDrugListInReceipt();
};

// Hiển thị danh sách thuốc trong modal tạo phiếu nhập
function renderDrugListInReceipt() {
  const tbody = document.querySelector('#addMedicineReceiptModal .custom-table tbody');
  tbody.innerHTML = '';
  let total = 0;
  newReceiptDrugs.forEach((drug, idx) => {
    total += drug.price * drug.quantity;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center">${drug.code}</td>
      <td class="text-center">${drug.name}</td>
      <td class="text-center">${drug.date}</td>
      <td class="text-center">${drug.price.toLocaleString()}</td>
      <td class="text-center">${drug.quantity}</td>
      <td class="text-center">
        <button class="btn btn-light btn-sm me-1" onclick="editDrugInReceipt(${idx})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-light btn-sm" onclick="deleteDrugInReceipt(${idx})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('tong-tien').value = total.toLocaleString();
}

// Lưu phiếu nhập vào nhà cung cấp
document.querySelector('#addMedicineReceiptModal .footer-btns .btn-primary').onclick = function() {
  if (newReceiptDrugs.length === 0) {
    
  }
  const supplier = suppliers[currentSupplierIdx];
  const newId = 'P' + String((supplier.receipts?.length || 0) + 1).padStart(3, '0');
  const now = new Date();
  const total = newReceiptDrugs.reduce((sum, d) => sum + d.price * d.quantity, 0);
  const receipt = {
    id: newId,
    date: now.toISOString().slice(0, 16).replace('T', ' '),
    total: total,
    details: JSON.parse(JSON.stringify(newReceiptDrugs))
  };
  if (!supplier.receipts) supplier.receipts = [];
  supplier.receipts.push(receipt);
  // Reset
  newReceiptDrugs = [];
  renderDrugListInReceipt();
  showMedicineReceipts(currentSupplierIdx);
  bootstrap.Modal.getInstance(document.getElementById('addMedicineReceiptModal')).hide();

  // Hiển thị thông báo thành công
  const alertDiv = document.getElementById('receipt-added-alert');
  alertDiv.style.display = 'flex';
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 2000);
};



// ===================== SỬA PHIẾU NHẬP THUỐC =====================

// Danh sách thuốc tạm khi sửa phiếu nhập
let editReceiptDrugs = [];

function editReceiptActionEvents() {
  // Gán sự kiện cho nút sửa phiếu nhập
  document.querySelectorAll('#medicineReceiptModal .btn-edit-receipt').forEach(btn => {
    btn.onclick = function() {
      currentReceiptIdx = +btn.getAttribute('data-idx');
      const receipt = suppliers[currentSupplierIdx].receipts[currentReceiptIdx];
      // Render chi tiết thuốc vào modal sửa phiếu nhập
      editReceiptDrugs = JSON.parse(JSON.stringify(receipt.details));
      renderDrugListInEditReceipt();
      // Tính lại tổng tiền từ danh sách thuốc (phòng trường hợp receipt.total không đúng)
      const total = editReceiptDrugs.reduce((sum, d) => sum + (d.price * d.quantity), 0);
      document.getElementById('tong-tienEdit').value = total.toLocaleString();
    };
  });
}

// Thêm thuốc vào danh sách tạm khi sửa phiếu nhập
document.getElementById('addChiTietBtn2').onclick = function () {
  const tenThuoc = document.getElementById('ten-thuoc-edit');
  const soLuong = document.getElementById('so-luong-edit');
  const donGia = document.getElementById('don-gia-edit');
  let valid = true;
  if (!tenThuoc.value.trim()) {
    setValidation(tenThuoc, false);
    valid = false;
  } else setValidation(tenThuoc, true);
  if (!soLuong.value.trim() || Number(soLuong.value) <= 0) {
    setValidation(soLuong, false);
    valid = false;
  } else setValidation(soLuong, true);
  if (!donGia.value.trim() || Number(donGia.value) <= 0) {
    setValidation(donGia, false);
    valid = false;
  } else setValidation(donGia, true);
  if (!valid) return;

  editReceiptDrugs.push({
    code: 'T' + Date.now() + Math.floor(Math.random() * 1000),
    name: tenThuoc.value.trim(),
    date: new Date().toISOString().slice(0, 10),
    price: Number(donGia.value),
    quantity: Number(soLuong.value),
  });
  renderDrugListInEditReceipt();
  document.getElementById('editMedicineReceiptForm').reset();
};

// Sửa thuốc trong danh sách tạm khi sửa phiếu nhập
window.editDrugInEditReceipt = function (idx) {
  const drug = editReceiptDrugs[idx];
  document.getElementById('ten-thuoc-edit').value = drug.name;
  document.getElementById('so-luong-edit').value = drug.quantity;
  document.getElementById('don-gia-edit').value = drug.price;
  document.getElementById('addChiTietBtn2').style.display = '';
  document.getElementById('editChiTietBtn2').style.display = '';
  document.getElementById('editChiTietBtn2').onclick = function () {
    // Validate lại
    const tenThuoc = document.getElementById('ten-thuoc-edit');
    const soLuong = document.getElementById('so-luong-edit');
    const donGia = document.getElementById('don-gia-edit');
    let valid = true;
    if (!tenThuoc.value.trim()) {
      setValidation(tenThuoc, false);
      valid = false;
    } else setValidation(tenThuoc, true);
    if (!soLuong.value.trim() || Number(soLuong.value) <= 0) {
      setValidation(soLuong, false);
      valid = false;
    } else setValidation(soLuong, true);
    if (!donGia.value.trim() || Number(donGia.value) <= 0) {
      setValidation(donGia, false);
      valid = false;
    } else setValidation(donGia, true);
    if (!valid) return;

    editReceiptDrugs[idx].name = tenThuoc.value.trim();
    editReceiptDrugs[idx].quantity = Number(soLuong.value);
    editReceiptDrugs[idx].price = Number(donGia.value);
    renderDrugListInEditReceipt();
    document.getElementById('editMedicineReceiptForm').reset();
    document.getElementById('addChiTietBtn2').style.display = '';
    document.getElementById('editChiTietBtn2').style.display = '';
  };
};

// Xóa thuốc khỏi danh sách tạm khi sửa phiếu nhập
window.deleteDrugInEditReceipt = function (idx) {
  editReceiptDrugs.splice(idx, 1);
  renderDrugListInEditReceipt();
};

// Hiển thị danh sách thuốc trong modal sửa phiếu nhập
function renderDrugListInEditReceipt() {
  const tbody = document.querySelector(
    '#editMedicineReceiptModal .custom-table tbody'
  );
  tbody.innerHTML = '';
  let total = 0;
  editReceiptDrugs.forEach((drug, idx) => {
    total += drug.price * drug.quantity;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center">${drug.code}</td>
      <td class="text-center">${drug.name}</td>
      <td class="text-center">${drug.date}</td>
      <td class="text-center">${drug.price.toLocaleString()}</td>
      <td class="text-center">${drug.quantity}</td>
      <td class="text-center">
        <button class="btn btn-light btn-sm me-1" onclick="editDrugInEditReceipt(${idx})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-light btn-sm" onclick="deleteDrugInEditReceipt(${idx})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('tong-tienEdit').value = total.toLocaleString();
}

// Lưu phiếu nhập đã sửa vào nhà cung cấp
document.querySelector(
  '#editMedicineReceiptModal .footer-btns .btn-primary'
).onclick = function () {
  if (
    currentSupplierIdx === null ||
    currentReceiptIdx === null ||
    !suppliers[currentSupplierIdx] ||
    !suppliers[currentSupplierIdx].receipts ||
    !suppliers[currentSupplierIdx].receipts[currentReceiptIdx]
  )
    return;
  if (editReceiptDrugs.length === 0) {
    // Có thể hiển thị cảnh báo nếu muốn
    return;
  }
  const now = new Date();
  const total = editReceiptDrugs.reduce(
    (sum, d) => sum + d.price * d.quantity,
    0
  );
  // Cập nhật lại phiếu nhập
  suppliers[currentSupplierIdx].receipts[currentReceiptIdx].details =
    JSON.parse(JSON.stringify(editReceiptDrugs));
  suppliers[currentSupplierIdx].receipts[currentReceiptIdx].total = total;
  suppliers[currentSupplierIdx].receipts[currentReceiptIdx].date = now
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
  // Reset
  editReceiptDrugs = [];
  renderDrugListInEditReceipt();
  showMedicineReceipts(currentSupplierIdx);
  bootstrap.Modal.getInstance(
    document.getElementById('editMedicineReceiptModal')
  ).hide();

  // Hiển thị thông báo thành công
  const alertDiv = document.getElementById('receipt-edited-alert');
  alertDiv.style.display = 'flex';
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 2000);
};



//============XEM CHI TIẾT PHIẾU NHẬP THUỐC=====
function bindReceiptActionEvents() {
  // Xem chi tiết
  document.querySelectorAll('#medicineReceiptModal .btn-eye').forEach(btn => {
    btn.onclick = function() {
      currentReceiptIdx = +btn.getAttribute('data-idx');
      const receipt = suppliers[currentSupplierIdx].receipts[currentReceiptIdx];
      // Render chi tiết thuốc vào modal xem chi tiết
      const tbody = document.querySelector('#viewMedicineReceiptModal tbody');
      tbody.innerHTML = '';
      let total = 0;
      receipt.details.forEach(detail => {
        total += detail.price * detail.quantity;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="text-center">${detail.code}</td>
          <td class="text-center">${detail.name}</td>
          <td class="text-center">${detail.date}</td>
          <td class="text-center">${detail.price.toLocaleString()}</td>
          <td class="text-center">${detail.quantity}</td>
        `;
        tbody.appendChild(tr);
      });
      document.getElementById('tong-tienView').value = total.toLocaleString();
    };
  });
}



//=========XÓA PHIẾU NHẬP THUỐC=========
function deleteReceiptActionEvents() {
  document.querySelectorAll('#medicineReceiptModal .btn-delete-receipt').forEach(btn => {
    btn.onclick = function() {
      currentReceiptIdx = +btn.getAttribute('data-idx');
      // Hiển thị modal xác nhận xóa
      const modalEl = document.getElementById('deleteMedicineReceiptModal');
      // Sử dụng instance hiện có nếu có, nếu không thì tạo mới
      let modal = bootstrap.Modal.getInstance(modalEl);
      if (!modal) modal = new bootstrap.Modal(modalEl);
      modal.show();

      // Đảm bảo chỉ gán 1 lần sự kiện xác nhận xóa
      const confirmBtn = document.getElementById('confirmDeleteMedicineReceiptBtn');
      // Xóa các listener cũ trước khi gán mới
      confirmBtn.onclick = null;
      confirmBtn.onclick = function() {
        if (currentSupplierIdx === null || currentReceiptIdx === null) return;
        suppliers[currentSupplierIdx].receipts.splice(currentReceiptIdx, 1);
        showMedicineReceipts(currentSupplierIdx);
        // Ẩn modal xác nhận xóa
        bootstrap.Modal.getInstance(modalEl).hide();
        currentReceiptIdx = null;

        // Hiển thị thông báo thành công
        const alertDiv = document.getElementById('receipt-deleted-alert');
        alertDiv.style.display = 'flex';
        setTimeout(() => {
          alertDiv.style.display = 'none';
        }, 2000);
      };
    };
  });
}

//=====Tìm kiếm nhà cung cấp=====
document.getElementById('searchSupplierBtn').onclick = function() {
  const searchInput = document.getElementById('searchSupplier');
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm === '') {
    renderSuppliers(suppliers); // Hiển thị toàn bộ
    alertDiv.style.display = 'none';
    return;
  }

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm) ||
    supplier.id.toLowerCase().includes(searchTerm) ||
    supplier.phone.includes(searchTerm) ||
    supplier.address.toLowerCase().includes(searchTerm)
  );
  // Render lại bảng chỉ với các nhà cung cấp tìm được
  const tbody = document.querySelector('#suppliersTable tbody');
  tbody.innerHTML = '';
  filteredSuppliers.forEach((supplier, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${supplier.id}</td>
      <td>${supplier.name}</td>
      <td>${supplier.phone}</td>
      <td>${supplier.address}</td>
      <td><a href="#medicineReceiptModal" class="text-decoration-underline" data-bs-toggle="modal" data-bs-target="#medicineReceiptModal" data-idx="${suppliers.indexOf(supplier)}">${supplier.link}</a></td>
      <td>
        <button class="btn btn-sm btn-light border me-1 btn-edit" data-idx="${suppliers.indexOf(supplier)}" data-bs-toggle="modal" data-bs-target="#editSupplierModal"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-light border btn-delete" data-idx="${suppliers.indexOf(supplier)}" data-bs-toggle="modal" data-bs-target="#deleteSupplierModal"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  bindEditEvents();
  bindDeleteEvents();
  bindSupplierReceiptLinks();
  const alertDiv = document.getElementById('supplier-not-found-alert');
  if (filteredSuppliers.length === 0 && searchTerm !== '') {
    alertDiv.style.display = 'flex';
    setTimeout(() => { alertDiv.style.display = 'none'; }, 2000);
  } else {
    alertDiv.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  renderSuppliers();
  bindSupplierReceiptLinks();
});