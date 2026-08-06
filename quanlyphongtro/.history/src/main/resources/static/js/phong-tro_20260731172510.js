const API_URL_PHONG = 'http://localhost:8080/api/phong-tro';

// Kiểm tra ô trống
function kiemTraRong(input) {
    if (!input || !input.value || input.value.trim() === "") {
        if(input) input.classList.add('is-invalid');
    } else {
        if(input) input.classList.remove('is-invalid');
    }
}

// Hàm hiển thị ô nhập số nếu chọn "Số khác..."
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

// Hàm kiểm tra rỗng chuyên dụng cho cụm Giá thuê
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

// Xử lý quản lý phòng trọ
function getRoomModal() {
    const el = document.getElementById('roomModal');
    if (!el) return null;
    return bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
}

let danhSachPhongGoc = []; // Thêm biến toàn cục lưu dữ liệu

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
            danhSachPhongGoc = data; // Lưu lại data gốc
            searchRooms(); // Gọi hàm lọc để tự động render
        })
        .catch(err => console.error("Lỗi khi tải danh sách phòng:", err));
}

// Viết lại hàm searchRooms hoàn toàn bằng Local Filter (Nhanh gấp 10 lần)
function searchRooms() {
    const keyword = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const status = document.getElementById('filterTrangThaiPhong')?.value || '';

    const filteredData = danhSachPhongGoc.filter(room => {
        // 1. Lọc theo trạng thái
        if (status && room.trangThai !== status) return false;

        // 2. Lọc theo từ khóa (Cho phép tìm cả Số phòng, Địa chỉ, Giá)
        if (keyword) {
            const soPhong = (room.soPhong || '').toLowerCase();
            const diaChi = (room.diaChi || '').toLowerCase();
            const giaThue = (room.giaThue || '').toString(); 
            
            return soPhong.includes(keyword) || diaChi.includes(keyword) || giaThue.includes(keyword);
        }
        
        return true;
    });

    renderTablePhong(filteredData);
}

// Hàm gắn vào nút "Làm mới"
function resetPhongFilters() {
    if(document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if(document.getElementById('filterTrangThaiPhong')) document.getElementById('filterTrangThaiPhong').value = '';
    searchRooms(); // Tự động load lại bảng
}

// Vẽ bảng hiển thị phòng (ĐÃ TÍCH HỢP SẮP XẾP)
function renderTablePhong(data) {
    const tbody = document.getElementById('tableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    // Lấy trạng thái sắp xếp
    const sortType = document.getElementById('sortPhong')?.value || 'desc';
    
    // Tạo bản sao và sắp xếp
    let dataToRender = [...data];
    dataToRender.sort((a, b) => {
        return sortType === 'desc' ? b.id - a.id : a.id - b.id;
    });
    
    dataToRender.forEach((room, index) => {
        const tr = document.createElement('tr');
        const safeRoomJson = JSON.stringify(room).replace(/'/g, "&#39;");
        
        tr.innerHTML = `
            <td class="text-center fw-bold">${index + 1}</td>
            <td class="fw-bold">${room.soPhong}</td>
            <td>${room.dienTich || 0} m2</td>
            <td class="text-danger fw-bold">${(room.giaThue || 0).toLocaleString('vi-VN')} đ</td>
            <td>${room.diaChi || ''}</td>
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
    
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.innerText = 'Thêm Phòng Mới';
    
    const globalKhuVuc = document.getElementById('globalKhuVucFilter');
    const diaChiInput = document.getElementById('diaChi') || document.getElementById('roomAddress');
    if (globalKhuVuc && globalKhuVuc.value && diaChiInput) {
        diaChiInput.value = globalKhuVuc.options[globalKhuVuc.selectedIndex].text;
    }
    
    const modal = getRoomModal();
    if(modal) modal.show();
}

function editRoom(room) {
    document.getElementById('roomId').value = room.id;
    document.getElementById('soPhong').value = room.soPhong;
    document.getElementById('dienTich').value = room.dienTich;
    document.getElementById('trangThai').value = room.trangThai;
    const diaChiInput = document.getElementById('diaChi') || document.getElementById('roomAddress');
    if(diaChiInput) diaChiInput.value = room.diaChi || '';
    
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
    
    const diaChiInput = document.getElementById('diaChi') || document.getElementById('roomAddress');
    const tenDiaChi = diaChiInput ? diaChiInput.value.trim() : '';
    const locKhuVuc = document.getElementById('globalKhuVucFilter');
    let idKhuVuc = null;
    if (locKhuVuc) {
        for (let i = 0; i < locKhuVuc.options.length; i++) {
            if (locKhuVuc.options[i].text === tenDiaChi) {
                idKhuVuc = parseInt(locKhuVuc.options[i].value);
                break;
            }
        }
    }
    const khuVucToSave = idKhuVuc ? { id: idKhuVuc } : null;
    const roomData = {
        soPhong: soPhongInput?.value.trim(),
        dienTich: document.getElementById('dienTich')?.value,
        giaThue: giaThueToSave,
        diaChi: tenDiaChi, 
        khuVuc: khuVucToSave, 
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
    const soPhongValue = soPhongInput ? soPhongInput.value.trim() : '';
    const diaChiEl = document.getElementById('diaChi') || document.getElementById('roomAddress');
    const diaChiValue = diaChiEl ? diaChiEl.value.trim() : '';
    const roomId = document.getElementById('roomId')?.value; 
    const errorDiv = document.getElementById('errorSoPhong');
    
    if (!soPhongValue || !diaChiValue) {
        if (errorDiv) errorDiv.innerText = "";
        if (soPhongInput) soPhongInput.classList.remove('is-invalid');
        return;
    }
    fetch(`${API_URL_PHONG}/chu-tro/${chuTroId}`)
        .then(res => res.json())
        .then(allRooms => {
            const isDuplicate = allRooms.some(r => 
                r.soPhong.toLowerCase() === soPhongValue.toLowerCase() && 
                (r.diaChi || '').trim() === diaChiValue &&
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
}