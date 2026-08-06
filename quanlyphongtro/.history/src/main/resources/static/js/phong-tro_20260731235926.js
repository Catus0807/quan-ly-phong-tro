const API_URL_PHONG = 'http://localhost:8080/api/phong-tro';

function kiemTraRong(input) {
    if (!input || !input.value || input.value.trim() === "") {
        if(input) input.classList.add('is-invalid');
    } else {
        if(input) input.classList.remove('is-invalid');
    }
}

function toggleGiaThue() {
    const select = document.getElementById('giaThueSelect');
    const input = document.getElementById('giaThue');
    if (select.value === 'custom') {
        input.classList.remove('d-none'); 
        input.focus();
    } else {
        input.classList.add('d-none'); 
    }
    kiemTraRongGiaThue();
}

function kiemTraRongGiaThue() {
    const select = document.getElementById('giaThueSelect');
    const input = document.getElementById('giaThue');
    if (select.value === "") {
        select.classList.add('is-invalid');
    } else if (select.value === 'custom') {
        select.classList.remove('is-invalid');
        kiemTraRong(input); 
    } else {
        select.classList.remove('is-invalid');
        input.classList.remove('is-invalid');
    }
}

function getRoomModal() {
    const el = document.getElementById('roomModal');
    if (!el) return null;
    return bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
}

let danhSachPhongGoc = []; 

function fetchRooms() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    const selectedDiaChi = document.getElementById('globalKhuVucFilter')?.value;
    const url = (selectedDiaChi && selectedDiaChi !== "")
    ? `${API_URL_PHONG}/chu-tro/${chuTroId}/search?khuVucId=${selectedDiaChi}`
    : `${API_URL_PHONG}/chu-tro/${chuTroId}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            danhSachPhongGoc = data; 
            searchRooms(); 
        })
        .catch(err => console.error("Lỗi khi tải danh sách phòng:", err));
}

function searchRooms() {
    const keyword = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const status = document.getElementById('filterTrangThaiPhong')?.value || '';
    const filteredData = danhSachPhongGoc.filter(room => {
        if (status && room.trangThai !== status) return false;
        if (keyword) {
            const soPhong = (room.soPhong || '').toLowerCase();
            const diaChi = room.khuVuc ? (room.khuVuc.tenKhuVuc || '').toLowerCase() : '';
            const giaThue = (room.giaThue || '').toString(); 
            return soPhong.includes(keyword) || diaChi.includes(keyword) || giaThue.includes(keyword);
        }
        return true;
    });
    renderTablePhong(filteredData);
}

function resetPhongFilters() {
    if(document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if(document.getElementById('filterTrangThaiPhong')) document.getElementById('filterTrangThaiPhong').value = '';
    searchRooms(); 
}

function renderTablePhong(data) {
    const tbody = document.getElementById('tableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const sortType = document.getElementById('sortPhong')?.value || 'desc';
    let dataToRender = [...data];
    dataToRender.sort((a, b) => {
        return sortType === 'desc' ? b.id - a.id : a.id - b.id;
    });
    
    dataToRender.forEach((room, index) => {
        const tr = document.createElement('tr');
        const safeRoomJson = JSON.stringify(room).replace(/'/g, "&#39;");
        
        // Lấy thẳng tên khu vực từ Obj KhuVuc (Chuẩn xác 100%)
        const tenKhuVucHienThi = room.khuVuc ? room.khuVuc.tenKhuVuc : '---';
        
        tr.innerHTML = `
            <td class="text-center fw-bold">${index + 1}</td>
            <td class="fw-bold text-primary">${room.soPhong}</td>
            <td>${room.dienTich || 0} m2</td>
            <td class="text-danger fw-bold">${(room.giaThue || 0).toLocaleString('vi-VN')} đ</td>
            <td class="fw-bold">${tenKhuVucHienThi}</td>
            <td><span class="badge ${getBadgeColor(room.trangThai)}">${room.trangThai}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick='editRoom(${safeRoomJson})' title="Sửa thông tin"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})" title="Xóa phòng"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getBadgeColor(status) {
    switch(status) {
        case 'TRONG': return 'bg-success';
        case 'DANG_THUE': return 'bg-primary';
        case 'BAO_TRI': return 'bg-secondary';
        default: return 'bg-dark';
    }
}

function openModal() {
    const form = document.getElementById('roomForm');
    if (form) form.reset();
    
    document.getElementById('roomId').value = '';
    document.getElementById('soPhong').disabled = false;
    
    const gtSelect = document.getElementById('giaThueSelect');
    const gtInput = document.getElementById('giaThue');
    if (gtSelect) {
        gtSelect.value = '';
        gtSelect.disabled = false;
        gtSelect.classList.remove('is-invalid');
    }
    if (gtInput) {
        gtInput.value = '';
        gtInput.disabled = false;
        gtInput.classList.add('d-none');
        gtInput.classList.remove('is-invalid');
    }
    
    // ĐẦU VÀO ĐỘNG CHI NHÁNH TỪ BỘ LỌC TỔNG (An toàn)
    const modalKhuVucSelect = document.getElementById('roomKhuVuc');
    const globalKhuVuc = document.getElementById('globalKhuVucFilter');
    if (modalKhuVucSelect && globalKhuVuc) {
        modalKhuVucSelect.innerHTML = '<option value="">-- Chọn chi nhánh --</option>';
        Array.from(globalKhuVuc.options).forEach(opt => {
            if (opt.value !== "") {
                modalKhuVucSelect.innerHTML += `<option value="${opt.value}">${opt.text}</option>`;
            }
        });
        if (globalKhuVuc.value) {
            modalKhuVucSelect.value = globalKhuVuc.value;
        }
    }
    
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.innerText = 'Thêm Phòng Mới';
    
    const modal = getRoomModal();
    if(modal) modal.show();
}

function editRoom(room) {
    document.getElementById('roomId').value = room.id;
    document.getElementById('soPhong').value = room.soPhong;
    document.getElementById('dienTich').value = room.dienTich;
    document.getElementById('trangThai').value = room.trangThai;
    
    const isRented = (room.trangThai === 'DANG_THUE');
    document.getElementById('soPhong').disabled = isRented; 
    
    const savedGiaThue = room.giaThue || 0;
    const gtSelect = document.getElementById('giaThueSelect');
    const gtInput = document.getElementById('giaThue');
    
    if (gtSelect && gtInput) {
        gtSelect.classList.remove('is-invalid');
        gtInput.classList.remove('is-invalid');
        
        if ([3000000, 4000000, 5000000].includes(savedGiaThue)) {
            gtSelect.value = savedGiaThue;
            gtInput.classList.add('d-none');
        } else {
            gtSelect.value = 'custom';
            gtInput.classList.remove('d-none');
            gtInput.value = savedGiaThue;
        }
        
        gtSelect.disabled = isRented;
        gtInput.disabled = isRented;
    }

    // LOAD DANH SÁCH VÀ GÁN ĐÚNG CHI NHÁNH ĐANG CHỌN
    const modalKhuVucSelect = document.getElementById('roomKhuVuc');
    const globalKhuVuc = document.getElementById('globalKhuVucFilter');
    if (modalKhuVucSelect && globalKhuVuc) {
        modalKhuVucSelect.innerHTML = '<option value="">-- Chọn chi nhánh --</option>';
        Array.from(globalKhuVuc.options).forEach(opt => {
            if (opt.value !== "") {
                modalKhuVucSelect.innerHTML += `<option value="${opt.value}">${opt.text}</option>`;
            }
        });
        if (room.khuVuc) {
            modalKhuVucSelect.value = room.khuVuc.id;
        }
    }
    
    document.getElementById('modalTitle').innerText = isRented ? 'Cập nhật (Phòng đang có khách)' : 'Cập nhật Phòng';
    const modal = getRoomModal();
    if(modal) modal.show();
}

function saveRoom() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) {
        alert("Lỗi: Không xác định được danh tính Chủ trọ. Vui lòng đăng nhập lại!");
        return;
    }
    
    const idStr = document.getElementById('roomId')?.value;
    const id = (idStr && idStr !== '') ? parseInt(idStr) : null;
    
    const soPhongInput = document.getElementById('soPhong');
    if (soPhongInput && soPhongInput.classList.contains('is-invalid')) {
        alert("Vui lòng sửa lỗi tên phòng (bị trùng) trước khi lưu!");
        return;
    }
    
    const gtSelect = document.getElementById('giaThueSelect');
    const gtInput = document.getElementById('giaThue');
    let giaThueToSave = 0;
    if (gtSelect && gtInput) {
        kiemTraRongGiaThue();
        if (gtSelect.classList.contains('is-invalid') || gtInput.classList.contains('is-invalid')) {
            return; 
        }
        if (gtSelect.value === 'custom') {
            giaThueToSave = parseFloat(gtInput.value) || 0;
        } else {
            giaThueToSave = parseFloat(gtSelect.value) || 0;
        }
    }
    
    // KIỂM TRA ID CHI NHÁNH CHUẨN
    const modalKhuVucSelect = document.getElementById('roomKhuVuc');
    const idKhuVuc = modalKhuVucSelect ? parseInt(modalKhuVucSelect.value) : null;
    const tenDiaChi = modalKhuVucSelect && modalKhuVucSelect.selectedIndex > 0 ? modalKhuVucSelect.options[modalKhuVucSelect.selectedIndex].text : '';

    if (!idKhuVuc) {
        alert("Vui lòng chọn Chi nhánh!");
        return;
    }

    const roomData = {
        soPhong: soPhongInput?.value.trim(),
        dienTich: document.getElementById('dienTich')?.value,
        giaThue: giaThueToSave,
        diaChi: tenDiaChi, 
        khuVuc: { id: idKhuVuc }, // Trực tiếp truyền Object ID vào
        trangThai: document.getElementById('trangThai')?.value
    };
    
    if (!roomData.soPhong || !roomData.giaThue) {
        alert("Vui lòng nhập đủ Số phòng và Giá thuê!");
        return;
    }
    
    const url = id ? `${API_URL_PHONG}/${id}` : `${API_URL_PHONG}/chu-tro/${chuTroId}`;
    
    fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    })
    .then(async res => {
        if (res.ok) {
            const modal = getRoomModal();
            if(modal) modal.hide();
            fetchRooms(); 
            alert(id ? "Cập nhật thành công!" : "Thêm phòng mới thành công!");
        } else {
            const errorMessage = await res.text();
            alert("Lỗi: " + errorMessage); 
        }
    })
    .catch(err => console.error("Lỗi khi lưu phòng:", err));
}

function checkTrungTenPhong() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;

    const soPhongInput = document.getElementById('soPhong');
    const soPhongValue = soPhongInput ? soPhongInput.value.trim().toLowerCase() : '';
    const modalKhuVucSelect = document.getElementById('roomKhuVuc');
    const idKhuVuc = modalKhuVucSelect ? modalKhuVucSelect.value : '';
    const roomId = document.getElementById('roomId')?.value; 
    const errorDiv = document.getElementById('errorSoPhong');
    
    if (!soPhongValue || !idKhuVuc) {
        if (errorDiv) errorDiv.innerText = "";
        if (soPhongInput) soPhongInput.classList.remove('is-invalid');
        return;
    }
    fetch(`${API_URL_PHONG}/chu-tro/${chuTroId}`)
        .then(res => res.json())
        .then(allRooms => {
            // Kiểm tra dựa trên ID khu vực thay vì text
            const isDuplicate = allRooms.some(r => 
                r.soPhong.toLowerCase() === soPhongValue && 
                r.khuVuc && String(r.khuVuc.id) === String(idKhuVuc) &&
                String(r.id) !== String(roomId)
            );
            if (isDuplicate) {
                if (errorDiv) errorDiv.innerText = "⚠️ Tên phòng này đã tồn tại ở chi nhánh này!";
                if (soPhongInput) soPhongInput.classList.add('is-invalid');
            } else {
                if (errorDiv) errorDiv.innerText = "";
                if (soPhongInput) soPhongInput.classList.remove('is-invalid');
            }
        });
}

// ĐÃ SỬA: Đóng hàm deleteRoom đúng vị trí
function deleteRoom(id) {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
        fetch(`${API_URL_PHONG}/${id}`, { method: 'DELETE' })
            .then(async res => {
                if (res.ok) {
                    alert("Đã xóa phòng thành công!");
                    fetchRooms();
                } else {
                    const msg = await res.text();
                    alert("Hệ thống từ chối xóa:\n\n" + msg);
                }
            })
            .catch(err => console.error("Lỗi khi xóa:", err));
    }
} // Kết thúc hàm deleteRoom tại đây

// Mở Modal giao diện đẹp thay vì dùng prompt của trình duyệt
function themKhuVucMoi() {
    const input = document.getElementById('inputTenKhuVucMoi');
    if(input) {
        input.value = ''; // Làm sạch ô nhập cũ
        input.classList.remove('is-invalid');
    }
    
    const modalEl = document.getElementById('modalThemKhuVuc');
    if(modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// Xử lý lưu chi nhánh mới vào Database
function xacNhanThemKhuVuc() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return alert("Vui lòng đăng nhập lại!");
    
    const inputEl = document.getElementById('inputTenKhuVucMoi');
    const tenKhuVuc = inputEl.value.trim();
    
    if (!tenKhuVuc) {
        inputEl.classList.add('is-invalid'); 
        return;
    }
    inputEl.classList.remove('is-invalid');
    
    const data = {
        tenKhuVuc: tenKhuVuc,
        diaChi: tenKhuVuc 
    };
    
    fetch(`http://localhost:8080/api/khu-vuc/chu-tro/${chuTroId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error("Lỗi khi thêm chi nhánh trên hệ thống");
    })
    .then(newKhuVuc => {
        alert("Đã thêm chi nhánh mới thành công!");
        
        // Cập nhật lại bộ lọc tổng ở ngoài màn hình
        if (typeof fetchDanhSachKhuVuc === 'function') {
            fetchDanhSachKhuVuc(); 
        }
        
        // Cập nhật thẻ Select trong form Thêm Phòng
        const modalKhuVucSelect = document.getElementById('roomKhuVuc');
        if (modalKhuVucSelect) {
            modalKhuVucSelect.innerHTML += `<option value="${newKhuVuc.id}">${newKhuVuc.tenKhuVuc}</option>`;
            modalKhuVucSelect.value = newKhuVuc.id; 
            modalKhuVucSelect.classList.remove('is-invalid');
            modalKhuVucSelect.classList.add('is-valid');
        }
        
        // Ẩn modal nhập tên chi nhánh đi
        const modalEl = document.getElementById('modalThemKhuVuc');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();
    })
    .catch(err => alert("Không thể thêm chi nhánh: " + err.message));
}
}