const API_URL_HOADON = '/api/hoa-don';
let hoaDonModal;
let danhSachPhongHoaDon = []; 
let tongTienHoaDon = 0; // Biến toàn cục lưu tổng tiền thực tế
let danhSachHoaDonToanBo = []; // Biến lưu toàn bộ hóa đơn để lọc nội bộ (Local Search)

// Khởi tạo modal khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById('hoaDonModal');
    if (modalEl) hoaDonModal = new bootstrap.Modal(modalEl);
});

// Lấy dữ liệu hóa đơn từ Server
function fetchHoaDon() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;

    const selectedDiaChi = document.getElementById('globalKhuVucFilter')?.value;
    const url = (selectedDiaChi && selectedDiaChi !== "") 
    ? `${API_URL_HOADON}/loc-chi-nhanh?khuVucId=${selectedDiaChi}` 
    : API_URL_HOADON;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // ĐÃ THÊM LỌC: Chỉ giữ lại những hóa đơn thuộc về Chủ trọ này
            danhSachHoaDonToanBo = data.filter(hd => {
                if (hd.chuTro && String(hd.chuTro.id) === String(chuTroId)) return true;
                // Đề phòng trường hợp chuTro trong hoa_don bị null nhưng phongTro có chuTro
                if (hd.phongTro && hd.phongTro.chuTro && String(hd.phongTro.chuTro.id) === String(chuTroId)) return true;
                return false;
            });
            
            locHoaDonLocal(); // Gọi hàm lọc đa năng để vẽ bảng
        })
        .catch(err => console.error("Lỗi tải hóa đơn:", err));
}

// Hàm Lọc đa năng (Theo Tháng + Trạng thái + Số phòng)
function locHoaDonLocal() {
    const filterThang = document.getElementById('filterThang')?.value;
    const filterTrangThai = document.getElementById('filterTrangThai')?.value;
    const searchPhong = document.getElementById('searchHoaDonPhong')?.value.trim().toLowerCase() || '';

    let filtered = danhSachHoaDonToanBo.filter(hd => {
        // 1. Lọc theo tháng
        if (filterThang && hd.thangThu !== filterThang) return false;
        
        // 2. Lọc theo trạng thái thanh toán
        if (filterTrangThai && hd.trangThai !== filterTrangThai) return false;
        
        // 3. Lọc theo số phòng (Từ khóa tìm kiếm)
        if (searchPhong) {
            const tenPhong = hd.phongTro ? hd.phongTro.soPhong.toLowerCase() : '';
            if (!tenPhong.includes(searchPhong)) return false;
        }
        
        return true;
    });

    renderTableHoaDon(filtered);
}

// Hàm vẽ bảng hóa đơn
function renderTableHoaDon(data) {
    const tbody = document.getElementById('tableHoaDon');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Lấy trạng thái sắp xếp
    const sortType = document.getElementById('sortHoaDon')?.value || 'desc';
    
    // Tạo bản sao và sắp xếp mảng
    let dataToRender = [...data];
    dataToRender.sort((a, b) => {
        return sortType === 'desc' ? b.id - a.id : a.id - b.id;
    });
    
    let stt = 1;
    dataToRender.forEach((hd) => {
        const tr = document.createElement('tr');
        const chiNhanh = hd.phongTro ? hd.phongTro.diaChi : '---';
        const tenPhong = hd.phongTro ? hd.phongTro.soPhong : 'N/A';
        
        const soDienTieuThu = Math.max(0, (hd.soDienMoi || 0) - (hd.soDienCu || 0));
        const soNuocTieuThu = Math.max(0, (hd.soNuocMoi || 0) - (hd.soNuocCu || 0));
        
        const giaDien = hd.giaDien || 3500;
        const giaNuoc = hd.giaNuoc || 20000;
        
        const badgeTrangThai = hd.trangThai === 'DA_THU' 
            ? '<span class="badge bg-success">Đã thanh toán</span>' 
            : '<span class="badge bg-danger">Chưa thanh toán</span>';
        const safeHdJson = JSON.stringify(hd).replace(/'/g, "&#39;");
        
        tr.innerHTML = `
            <td class="text-center fw-bold">${stt}</td>
            <td class="fw-bold align-middle">${chiNhanh}</td>
            <td class="fw-bold text-primary align-middle">${tenPhong}</td>
            <td class="align-middle">${hd.thangThu}</td>
            <td class="align-middle">${(hd.tienPhong || 0).toLocaleString('vi-VN')} đ</td>
            
            <td class="td-dien-nuoc">
                <strong>${soDienTieuThu} ký</strong><br>
                <span class="gia-dien">${giaDien.toLocaleString('vi-VN')} đ/ký</span><br>
                <span class="chi-so">(${hd.soDienCu || 0} &rarr; ${hd.soDienMoi || 0})</span>
            </td>
            
            <td class="td-dien-nuoc">
                <strong>${soNuocTieuThu} khối</strong><br>
                <span class="gia-nuoc">${giaNuoc.toLocaleString('vi-VN')} đ/khối</span><br>
                <span class="chi-so">(${hd.soNuocCu || 0} &rarr; ${hd.soNuocMoi || 0})</span>
            </td>
            
            <td class="align-middle">${(hd.phuPhi || 0).toLocaleString('vi-VN')} đ</td>
            <td class="fw-bold text-danger fs-6 align-middle">${(hd.tongTien || 0).toLocaleString('vi-VN')} đ</td>
            <td class="align-middle">${badgeTrangThai}</td>
            <td class="align-middle">
                <button class="btn btn-sm btn-warning mb-1" onclick='openHoaDonModal(${safeHdJson})' title="Sửa">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="deleteHoaDon(${hd.id})" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        stt++;
    });

    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-muted py-4">Không tìm thấy hóa đơn nào phù hợp.</td></tr>';
    }
}

// Xử lý mở modal và tính toán số tiền
function openHoaDonModal(hd = null) {
    const form = document.getElementById('hoaDonForm');
    if (form) form.reset();
    
    document.getElementById('hdDienCu').style.backgroundColor = '';
    document.getElementById('hdNuocCu').style.backgroundColor = '';
    
    if (hd && typeof hd === 'object') {
        // Trạng thái Sửa hóa đơn
        document.getElementById('hoaDonId').value = hd.id;
        
        const [mm, yyyy] = hd.thangThu.split('/');
        document.getElementById('hdThangThu').value = `${yyyy}-${mm}`;
        document.getElementById('hdDienCu').value = hd.soDienCu;
        document.getElementById('hdDienMoi').value = hd.soDienMoi;
        document.getElementById('giaDien').value = hd.giaDien || 3500; 
        document.getElementById('hdNuocCu').value = hd.soNuocCu;
        document.getElementById('hdNuocMoi').value = hd.soNuocMoi;
        document.getElementById('giaNuoc').value = hd.giaNuoc || 20000; 
        document.getElementById('hdPhuPhi').value = hd.phuPhi;
        document.getElementById('hdTrangThai').value = hd.trangThai;
        
        const chiNhanhCuaPhong = (hd.phongTro && hd.phongTro.khuVuc) ? hd.phongTro.khuVuc.id : '';
        loadPhongDangThue(hd.phongTro.id, chiNhanhCuaPhong);
    } else {
        // Trạng thái Thêm mới
        document.getElementById('hoaDonId').value = '';
        document.getElementById('hdPhuPhi').value = '100000'; 
        document.getElementById('giaDien').value = '3500';
        document.getElementById('giaNuoc').value = '20000';
        
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        document.getElementById('hdThangThu').value = `${yyyy}-${mm}`;
        
        const currentBranch = document.getElementById('globalKhuVucFilter');
        const defaultBranch = (currentBranch && currentBranch.value) ? currentBranch.value : '';
        
        loadPhongDangThue(null, defaultBranch); 
    }
    
    if(hoaDonModal) hoaDonModal.show();
}

// Tính tổng tiền hóa đơn dựa trên các giá trị nhập vào
function tinhTongTien() {
    const dienCu = parseFloat(document.getElementById('hdDienCu')?.value) || 0;
    const dienMoi = parseFloat(document.getElementById('hdDienMoi')?.value) || 0;
    const giaDien = parseFloat(document.getElementById('giaDien')?.value) || 0;
    const nuocCu = parseFloat(document.getElementById('hdNuocCu')?.value) || 0;
    const nuocMoi = parseFloat(document.getElementById('hdNuocMoi')?.value) || 0;
    const giaNuoc = parseFloat(document.getElementById('giaNuoc')?.value) || 0;
    const phuPhi = parseFloat(document.getElementById('hdPhuPhi')?.value) || 0;
    const phongSelect = document.getElementById('hdPhongId');
    let tienPhong = 0;
    if (phongSelect && phongSelect.selectedIndex > 0) {
        const selectedOption = phongSelect.options[phongSelect.selectedIndex];
        tienPhong = parseFloat(selectedOption.getAttribute('data-giathue')) || 0;
    }
    const soDienTieuThu = Math.max(0, dienMoi - dienCu);
    const soNuocTieuThu = Math.max(0, nuocMoi - nuocCu);
    const thanhTienDien = soDienTieuThu * giaDien;
    const thanhTienNuoc = soNuocTieuThu * giaNuoc;
    tongTienHoaDon = tienPhong + thanhTienDien + thanhTienNuoc + phuPhi;
    
    const hienThiEl = document.getElementById('hdTongTienHienThi');
    if (hienThiEl) {
        hienThiEl.innerText = tongTienHoaDon.toLocaleString('vi-VN') + ' đ';
    }
}

// Lấy danh sách phòng đang thuê và điền vào select
function loadPhongDangThue(selectedPhongId = null, selectedChiNhanh = '') {
    const chuTroId = localStorage.getItem('chuTroId');
    const hoaDonChiNhanh = document.getElementById('hoaDonChiNhanh');
    const globalKhuVuc = document.getElementById('globalKhuVucFilter');
    
    // Đồng bộ danh sách chi nhánh
    if (globalKhuVuc && hoaDonChiNhanh) {
        hoaDonChiNhanh.innerHTML = ''; 
        Array.from(globalKhuVuc.options).forEach(opt => {
            const newOpt = document.createElement('option');
            newOpt.value = opt.value;
            newOpt.text = opt.value === "" ? "-- Chọn chi nhánh --" : opt.text;
            hoaDonChiNhanh.appendChild(newOpt);
        });
        hoaDonChiNhanh.value = selectedChiNhanh || globalKhuVuc.value || "";
    }
    
    const selectPhong = document.getElementById('hdPhongId');
    if (selectPhong) selectPhong.innerHTML = '<option value="">-- Đang tải dữ liệu... --</option>';
    
    fetch(`/api/phong-tro/chu-tro/${chuTroId}?t=` + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            // Chỉ lấy các phòng đang có người ở
            danhSachPhongHoaDon = data.filter(p => {
                const status = (p.trangThai || '').toString().toUpperCase().trim();
                return status !== 'TRONG' && status !== 'TRỐNG' && status !== 'BAO_TRI';
            });
            
            const currentBranch = hoaDonChiNhanh ? hoaDonChiNhanh.value : '';
            renderPhongHoaDonSelect(currentBranch, selectedPhongId);
        })
        .catch(err => {
            console.error("Lỗi lấy danh sách phòng:", err);
            if (selectPhong) selectPhong.innerHTML = '<option value="">-- Lỗi tải dữ liệu --</option>';
        });
}

// Khi đổi chi nhánh, lọc lại danh sách phòng đang thuê
function onChiNhanhHoaDonChange() {
    const selectedBranch = document.getElementById('hoaDonChiNhanh')?.value || '';
    renderPhongHoaDonSelect(selectedBranch);
    
    // Reset dữ liệu khi đổi chi nhánh
    if(document.getElementById('hdPhongId')) document.getElementById('hdPhongId').value = "";
    if(document.getElementById('hdDienCu')) {
        document.getElementById('hdDienCu').value = '';
        document.getElementById('hdDienCu').style.backgroundColor = '';
    }
    if(document.getElementById('hdNuocCu')) {
        document.getElementById('hdNuocCu').value = '';
        document.getElementById('hdNuocCu').style.backgroundColor = '';
    }
    tinhTongTien(); 
}

// Render danh sách phòng đang thuê vào select
function renderPhongHoaDonSelect(branchName, selectedPhongId = null) {
    const selectPhong = document.getElementById('hdPhongId');
    if (!selectPhong) return;
    selectPhong.innerHTML = '<option value="">-- Chọn phòng đang thuê --</option>';
    
    const filteredRooms = branchName 
        ? danhSachPhongHoaDon.filter(p => p.khuVuc && p.khuVuc.id == branchName)
        : danhSachPhongHoaDon;
        
    filteredRooms.forEach(p => {
        const isSelected = (String(p.id) === String(selectedPhongId)) ? 'selected' : '';
        selectPhong.innerHTML += `<option value="${p.id}" data-giathue="${p.giaThue}" ${isSelected}>Phòng ${p.soPhong} (Giá: ${(p.giaThue || 0).toLocaleString('vi-VN')}đ)</option>`;
    });
    
    if (filteredRooms.length === 0) {
        selectPhong.innerHTML = '<option value="">-- Không có phòng đang thuê ở đây --</option>';
    }
    tinhTongTien(); 
}

// Lấy chỉ số cũ của phòng khi chọn phòng (để điền vào ô Số Cũ)
function fetchChiSoCu() {
    const phongId = document.getElementById('hdPhongId').value;
    
    if (!phongId) {
        document.getElementById('hdDienCu').value = '';
        document.getElementById('hdNuocCu').value = '';
        tinhTongTien();
        return;
    }
    
    fetch(`${API_URL_HOADON}/phong/${phongId}/latest`)
        .then(res => {
            if (!res.ok && res.status !== 204) throw new Error("Lỗi API từ Backend! Mã lỗi: " + res.status);
            if (res.status === 204) {
                document.getElementById('hdDienCu').value = '';
                document.getElementById('hdNuocCu').value = '';
                document.getElementById('hdDienCu').placeholder = 'Chưa có dữ liệu';
                document.getElementById('hdNuocCu').placeholder = 'Chưa có dữ liệu';
                document.getElementById('hdDienCu').style.backgroundColor = '';
                document.getElementById('hdNuocCu').style.backgroundColor = '';
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (data) {
                document.getElementById('hdDienCu').value = data.soDienMoi;
                document.getElementById('hdNuocCu').value = data.soNuocMoi;
                document.getElementById('hdDienCu').style.backgroundColor = '#e9ecef';
                document.getElementById('hdNuocCu').style.backgroundColor = '#e9ecef';
            }
            tinhTongTien(); 
        })
        .catch(err => console.error("Lỗi lấy chỉ số cũ:", err));
}

// Kiểm tra chỉ số mới có nhỏ hơn chỉ số cũ hay không
function kiemTraChiSoLoi(idCu, idMoi) {
    const inputCu = document.getElementById(idCu);
    const inputMoi = document.getElementById(idMoi);
    
    if (!inputCu || !inputMoi) return;
    
    const valCu = parseFloat(inputCu.value) || 0;
    
    if (inputMoi.value !== "") {
        const valMoi = parseFloat(inputMoi.value) || 0;
        if (valMoi < valCu) {
            inputMoi.classList.add('is-invalid');
        } else {
            inputMoi.classList.remove('is-invalid');
        }
    } else {
        inputMoi.classList.remove('is-invalid');
    }
}

// Lưu hóa đơn
function saveHoaDon() {
    const id = document.getElementById('hoaDonId')?.value;
    const phongId = document.getElementById('hdPhongId')?.value;
    const dienMoiInput = document.getElementById('hdDienMoi');
    const nuocMoiInput = document.getElementById('hdNuocMoi');
    
    // LẤY ID CHỦ TRỌ TỪ LOCAL STORAGE
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) {
        alert("Lỗi: Không xác định được danh tính Chủ trọ. Vui lòng đăng nhập lại!");
        return;
    }
    
    if (dienMoiInput?.classList.contains('is-invalid') || nuocMoiInput?.classList.contains('is-invalid')) {
        alert("Lỗi: Chỉ số Điện hoặc Nước không hợp lệ. Vui lòng kiểm tra các ô bị viền đỏ!");
        return; 
    }
    
    if (!phongId) {
        alert("Vui lòng chọn Phòng trước khi lưu!");
        return; 
    }
    
    const rawThang = document.getElementById('hdThangThu')?.value; 
    const [yyyy, mm] = rawThang.split('-');
    
    const data = {
        thangThu: `${mm}/${yyyy}`, 
        soDienCu: document.getElementById('hdDienCu')?.value || 0,
        soDienMoi: document.getElementById('hdDienMoi')?.value || 0,
        giaDien: document.getElementById('giaDien')?.value || 3500, 
        soNuocCu: document.getElementById('hdNuocCu')?.value || 0,
        soNuocMoi: document.getElementById('hdNuocMoi')?.value || 0,
        giaNuoc: document.getElementById('giaNuoc')?.value || 20000, 
        phuPhi: document.getElementById('hdPhuPhi')?.value || 0,
        trangThai: document.getElementById('hdTrangThai')?.value,
        tongTien: tongTienHoaDon, 
        phongTro: { id: parseInt(phongId) },
        
        // ĐÃ THÊM: Gắn hóa đơn này cho Chủ trọ đang đăng nhập
        chuTro: { id: parseInt(chuTroId) } 
    };
    
    fetch(id ? `${API_URL_HOADON}/${id}` : API_URL_HOADON, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async res => {
        if (res.ok) {
            if (hoaDonModal) hoaDonModal.hide();
            fetchHoaDon();
            alert(id ? "Cập nhật hóa đơn thành công!" : "Tạo hóa đơn thành công!");
        } else {
            const errorMsg = await res.text();
            alert("Lỗi khi lưu hóa đơn:\n" + errorMsg);
        }
    })
    .catch(err => console.error("Lỗi mạng:", err));
}

// Xóa hóa đơn
function deleteHoaDon(id) {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này? Các số liệu báo cáo doanh thu liên quan sẽ bị ảnh hưởng.')) {
        fetch(`${API_URL_HOADON}/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) fetchHoaDon();
                else alert("Lỗi khi xóa hóa đơn!");
            });
    }
}