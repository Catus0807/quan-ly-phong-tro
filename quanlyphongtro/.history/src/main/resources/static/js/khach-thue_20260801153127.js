// Cấu hình hê thống
const API_URL_KHACH = 'http://localhost:8080/api/nguoi-thue';
let danhSachKhach = [];
let danhSachKhachCu = []; // Mảng chứa dữ liệu khách đã dọn đi
let khachModalInstance;
let nguoiGhepModalInstance;
let giaHanModalInstance;
// BIẾN CỜ ĐÁNH DẤU 
let isTuKhoLuuTru = false; 

// Khởi tạo modal
document.addEventListener("DOMContentLoaded", () => {
    const khachModalEl = document.getElementById('khachModal');
    if (khachModalEl) khachModalInstance = new bootstrap.Modal(khachModalEl);
    const ngModalEl = document.getElementById('nguoiGhepModal');
    if (ngModalEl) nguoiGhepModalInstance = new bootstrap.Modal(ngModalEl);
    const ghModalEl = document.getElementById('giaHanModal');
    if (ghModalEl) giaHanModalInstance = new bootstrap.Modal(ghModalEl);
    
    setupKiemTraTrungLap('cccd', 'cccd');
    setupKiemTraTrungLap('sdt', 'sdt');
    setupKiemTraTrungLap('ngCccd', 'cccd');
    setupKiemTraTrungLap('ngSdt', 'sdt');

    const hopDongModalEl = document.getElementById('hopDongModal');
    if (hopDongModalEl) {
        hopDongModalEl.addEventListener('hidden.bs.modal', function () {
            // Nếu khách vừa xem hợp đồng từ Kho lưu trữ -> Bật lại Kho lưu trữ
            if (isTuKhoLuuTru) {
                let modalLuuTru = bootstrap.Modal.getInstance(document.getElementById('modalLichSuThanhLy'));
                if (!modalLuuTru) modalLuuTru = new bootstrap.Modal(document.getElementById('modalLichSuThanhLy'));
                
                modalLuuTru.show();
                isTuKhoLuuTru = false; // Reset cờ sau khi mở
            }
        });
    }
});

function fetchNguoiThue() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    const selectedDiaChi = document.getElementById('globalKhuVucFilter')?.value;
    const timestamp = new Date().getTime(); 
    
    const url = (selectedDiaChi && selectedDiaChi !== "") 
    ? `${API_URL_KHACH}/chu-tro/${chuTroId}/loc-chi-nhanh?khuVucId=${selectedDiaChi}&t=${timestamp}` 
    : `${API_URL_KHACH}/chu-tro/${chuTroId}?t=${timestamp}`;
        
    fetch(url)
        .then(res => res.json())
        .then(data => {
            danhSachKhach = data; 
            renderTableKhach(data); 
        })
        .catch(err => console.error("Lỗi tải danh sách khách:", err));
}

// Vẽ bảng khách thuê 
function renderTableKhach(data) {
    const tbody = document.getElementById('tableNguoiThue');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // 1. Lấy giá trị từ các bộ lọc
    const filterHopDong = document.getElementById('filterHopDong')?.value || 'tat-ca';
    const sortType = document.getElementById('sortKhach')?.value || 'desc'; // Mặc định là mới nhất
    
    const homNay = new Date();
    homNay.setHours(0, 0, 0, 0); 
    
    // 2. Thuật toán sắp xếp (Mới nhất / Cũ nhất)
    let dataToRender = [...data];
    dataToRender.sort((a, b) => {
        if (sortType === 'desc') {
            return b.id - a.id; // Mới nhất (ID lớn) nổi lên trên
        } else {
            return a.id - b.id; // Cũ nhất (ID nhỏ) lên trên
        }
    });

    let stt = 1; 
    // 3. Vòng lặp vẽ bảng
    dataToRender.forEach((khach) => {
        let soNgayConLai = null;
        let rowClass = "align-middle"; 
        let warningBadge = "";
        
        // Tính toán cảnh báo
        if (khach.trangThaiGiaHan === 'KHONG_GIA_HAN') {
            rowClass = "align-middle table-secondary text-muted";
            warningBadge = `<br><span class="badge bg-dark text-white mt-2 px-2 py-1 shadow-sm"><i class="bi bi-box-arrow-right"></i> Khách báo trả phòng</span>`;
        } 
        else if (khach.ngayKetThuc) {
            const ngayKetThuc = new Date(khach.ngayKetThuc);
            ngayKetThuc.setHours(0, 0, 0, 0);
            const chenhLechThoiGian = ngayKetThuc.getTime() - homNay.getTime();
            soNgayConLai = Math.ceil(chenhLechThoiGian / (1000 * 3600 * 24));
            
            if (soNgayConLai < 0) {
                rowClass = "align-middle table-secondary text-muted"; 
                warningBadge = `<br><span class="badge bg-dark text-white mt-2 px-2 py-1 shadow-sm"><i class="bi bi-x-octagon"></i> Đã hết hạn</span>`;
            } else if (soNgayConLai <= 15) {
                rowClass = "align-middle table-danger"; 
                warningBadge = `<br><span class="badge bg-danger text-white mt-2 px-2 py-1 shadow-sm"><i class="bi bi-exclamation-triangle"></i> Còn ${soNgayConLai} ngày</span>`;
            } else if (soNgayConLai <= 30) {
                rowClass = "align-middle table-warning"; 
                warningBadge = `<br><span class="badge bg-warning text-dark mt-2 px-2 py-1 shadow-sm"><i class="bi bi-bell"></i> Còn ${soNgayConLai} ngày</span>`;
            }
        }
        
        // Thuật toán Lọc Hợp Đồng
        if (filterHopDong === 'sap-het-han') {
            if (khach.trangThaiGiaHan === 'KHONG_GIA_HAN' || soNgayConLai === null || soNgayConLai > 30) {
                return; 
            }
        } else if (filterHopDong === 'tra-phong') {
            if (khach.trangThaiGiaHan !== 'KHONG_GIA_HAN') {
                return; 
            }
        }
        
        const danhSachGhep = khach.danhSachNguoiOGhep || [];
        const rowSpan = 1 + danhSachGhep.length; 
        const chiNhanh = (khach.phongTro && khach.phongTro.diaChi) ? khach.phongTro.diaChi : '---';
        const tenPhong = khach.phongTro ? `<span class="badge bg-info text-dark fs-6">${khach.phongTro.soPhong}</span>` : 'Chưa xếp';
        const tienCocFormat = khach.tienCoc ? khach.tienCoc.toLocaleString('vi-VN') + ' đ' : '0 đ';
        
        const ngayBD = khach.ngayBatDau ? khach.ngayBatDau.split('-').reverse().join('/') : '---';
        const ngayKT = khach.ngayKetThuc ? khach.ngayKetThuc.split('-').reverse().join('/') : '---';
        const thoiGianThue = `${ngayBD} <br><i class="bi bi-arrow-down-short text-muted"></i><br> <strong>${ngayKT}</strong> ${warningBadge}`;
        
        const thongTinChinh = `
            <button class="btn btn-sm btn-outline-secondary bg-white" onclick='xemChiTietCaNhan(${JSON.stringify(khach).replace(/'/g, "&#39;")})'>
                <i class="bi bi-info-circle"></i> Xem
            </button>
        `;
        
        const btnThemGhep = danhSachGhep.length < 1 
            ? `<button class="btn btn-sm btn-info mb-1" onclick="moModalThemNguoiGhep(${khach.id})" title="Thêm người ở ghép"><i class="bi bi-person-plus text-white"></i></button>` 
            : '';
            
        const hanhDongChinh = `
            ${btnThemGhep}
            <button class="btn btn-sm btn-success mb-1" onclick="capTaiKhoan(${khach.id}, '${khach.sdt || ''}')" title="Cấp tài khoản">
                <i class="bi bi-key"></i>
            </button><br>
            <button class="btn btn-sm btn-warning mb-1" onclick="openKhachModal(${khach.id})" title="Sửa thông tin">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger mb-1" onclick="deleteKhach(${khach.id})" title="Thanh lý hợp đồng & Nhận lại phòng">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        `;
        
        // Hàng của khách chính
        const trMain = document.createElement('tr');
        trMain.className = rowClass; 
        
        trMain.innerHTML = `
            <td rowspan="${rowSpan}" class="fw-bold text-center">${stt}</td>
            <td rowspan="${rowSpan}" class="fw-bold text-center">${chiNhanh}</td>
            <td rowspan="${rowSpan}" class="text-center">${tenPhong}</td>
            <td>
                <strong class="text-primary">${khach.tenKhach}</strong><br>
                <span class="badge bg-primary mt-1" style="font-size: 0.7em;">Người đại diện</span>
            </td>
            <td class="text-center">${khach.cccd}</td>
            <td class="text-center">${khach.sdt || ''}</td>
            <td class="text-center">${thongTinChinh}</td>
            <td rowspan="${rowSpan}" class="text-center" style="font-size: 0.95em;">${thoiGianThue}</td>
            <td rowspan="${rowSpan}" class="text-danger fw-bold text-center">${tienCocFormat}</td>
            <td rowspan="${rowSpan}" class="text-center">
                <div class="d-flex flex-column gap-2 align-items-center">
                    <button class="btn btn-sm btn-primary w-100" onclick="exportHopDong(${khach.id})">Xem</button>
                    <button class="btn btn-sm btn-info text-white fw-bold w-100" onclick="moModalGiaHan(${khach.id}, '${khach.ngayKetThuc}')">Gia hạn</button>
                </div>
            </td>
            <td rowspan="${rowSpan}" class="text-center">${hanhDongChinh}</td>
        `;
        tbody.appendChild(trMain);
        
        // Hàng của người ở ghép
        danhSachGhep.forEach(nguoiGhep => {
            const trPhu = document.createElement('tr');
            trPhu.className = rowClass; 
            
            const thongTinGhep = `
                <button class="btn btn-sm btn-outline-secondary bg-white" onclick='xemChiTietCaNhan(${JSON.stringify(nguoiGhep).replace(/'/g, "&#39;")}, true)'>
                    <i class="bi bi-info-circle"></i> Xem
                </button>
            `;
            trPhu.innerHTML = `
                <td>
                    <span class="text-dark fw-bold">${nguoiGhep.ten}</span>
                    <i class="bi bi-pencil-square text-warning ms-2" style="cursor: pointer;" onclick='moModalSuaNguoiGhep(${JSON.stringify(nguoiGhep).replace(/'/g, "&#39;")}, ${khach.id})' title="Sửa thông tin"></i>
                    <i class="bi bi-x-circle-fill text-danger ms-1" style="cursor: pointer;" onclick="event.stopPropagation(); xoaNguoiGhep(${nguoiGhep.id})" title="Xóa người này"></i>
                    <br><span class="badge bg-secondary mt-1" style="font-size: 0.7em;">Ở ghép</span>
                </td>
                <td class="text-muted text-center">${nguoiGhep.cccd}</td>
                <td class="text-muted text-center">${nguoiGhep.sdt || '---'}</td>
                <td class="text-center">${thongTinGhep}</td>
            `;
            tbody.appendChild(trPhu);
        });
        stt++; 
    });
    if (stt === 1) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-success py-4 fw-bold"><i class="bi bi-check-circle"></i> Không có hợp đồng nào phù hợp.</td></tr>`;
    }
}

function loadPhongTrongTheoChiNhanh() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    const chiNhanh = document.getElementById('hdChiNhanh')?.value || '';
    const select = document.getElementById('selectPhongId') || document.getElementById('hdPhong'); 
    
    if (!select) return; 
    select.innerHTML = '<option value="">-- Đang tải dữ liệu... --</option>';
    
    fetch(`http://localhost:8080/api/phong-tro/chu-tro/${chuTroId}`)
        .then(res => res.json())
        .then(data => {
            select.innerHTML = '<option value="">-- Chọn phòng --</option>';
            const phongPhuHop = data.filter(p => p.trangThai === 'TRONG' && (!chiNhanh || (p.khuVuc && p.khuVuc.id == chiNhanh)));
            
            phongPhuHop.forEach(p => {
                select.innerHTML += `<option value="${p.id}" data-dientich="${p.dienTich}" data-giathue="${p.giaThue}" data-diachi="${p.diaChi}">${p.soPhong} - ${(p.giaThue || 0).toLocaleString('vi-VN')} đ</option>`;
            });
            
            if (phongPhuHop.length === 0) {
                select.innerHTML = '<option value="">-- Không có phòng trống ở đây --</option>';
            }
        })
        .catch(err => {
            console.error("Lỗi:", err);
            select.innerHTML = '<option value="">-- Lỗi tải dữ liệu --</option>';
        });
}

function xemChiTietCaNhan(obj, isOGhep = false) {
    document.getElementById('hsTen').innerText = isOGhep ? obj.ten : obj.tenKhach;
    document.getElementById('hsVaiTro').innerText = isOGhep ? "Người ở ghép" : "Người đại diện";
    document.getElementById('hsVaiTro').className = isOGhep ? "badge bg-secondary" : "badge bg-primary";
    document.getElementById('hsNgaySinh').innerText = obj.ngaySinh ? (obj.ngaySinh.includes('-') ? obj.ngaySinh.split('-').reverse().join('/') : obj.ngaySinh) : 'Chưa cập nhật';
    document.getElementById('hsGioiTinh').innerText = obj.gioiTinh || 'Chưa cập nhật';
    document.getElementById('hsQueQuan').innerText = obj.queQuan || 'Chưa cập nhật';
    new bootstrap.Modal(document.getElementById('chiTietKhachModal')).show();
}

function openKhachModal(id = null) {
    const form = document.getElementById('khachForm');
    if (form) form.reset(); 
    
    document.querySelectorAll('#khachForm .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    const hdChiNhanh = document.getElementById('hdChiNhanh');
    const selectPhong = document.getElementById('selectPhongId') || document.getElementById('hdPhong');
    const divChiNhanhModal = hdChiNhanh?.closest('.mb-3'); 
    const divPhong = document.getElementById('divPhong') || selectPhong?.closest('.mb-3');
    const btnSave = document.querySelector('#khachModal .btn-primary'); 
    
    const tcSelect = document.getElementById('tienCocSelect');
    const tcInput = document.getElementById('tienCoc');
    if (id) {
        const khach = danhSachKhach.find(k => k.id === id);
        document.getElementById('khachId').value = khach.id;
        document.getElementById('tenKhach').value = khach.tenKhach;
        document.getElementById('cccd').value = khach.cccd;
        document.getElementById('cccd').disabled = true;
        document.getElementById('sdt').value = khach.sdt || '';
        
        let ns = khach.ngaySinh || '';
        if (ns.includes('-')) {
            let parts = ns.split('-');
            ns = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        document.getElementById('ktNgaySinh').value = ns;
        document.getElementById('ktGioiTinh').value = khach.gioiTinh || '';
        document.getElementById('ktQueQuan').value = khach.queQuan || '';
        
        document.getElementById('ngayBatDau').value = khach.ngayBatDau || '';
        document.getElementById('ngayBatDau').disabled = true; 
        
        const savedTienCoc = khach.tienCoc || 0;
        if (tcSelect && tcInput) {
            if ([1000000, 2000000, 3000000].includes(savedTienCoc)) {
                tcSelect.value = savedTienCoc;
                tcInput.classList.add('d-none');
            } else { 
                tcSelect.value = 'custom';
                tcInput.classList.remove('d-none');
                tcInput.value = savedTienCoc;
            }
            tcSelect.disabled = true;
            tcInput.disabled = true;
        }
        
        const divThoiHan = document.getElementById('divThoiHan');
        if (divThoiHan) divThoiHan.style.display = 'none';
        
        if (divChiNhanhModal) divChiNhanhModal.style.display = 'block';
        if (divPhong) divPhong.style.display = 'block';
        
        if (hdChiNhanh && khach.phongTro) {
            hdChiNhanh.innerHTML = `<option value="${khach.phongTro.diaChi}">${khach.phongTro.diaChi}</option>`;
            hdChiNhanh.disabled = true;
        }
        if (selectPhong && khach.phongTro) {
            selectPhong.innerHTML = `<option value="${khach.phongTro.id}">${khach.phongTro.soPhong}</option>`;
            selectPhong.disabled = true;
        }
        document.getElementById('khachModalTitle').innerText = 'Sửa thông tin khách';
        if(btnSave) btnSave.innerText = 'Lưu thông tin';
        
    } else { 
        document.getElementById('khachId').value = '';
        document.getElementById('ktNgaySinh').value = '';
        document.getElementById('ktGioiTinh').value = '';
        document.getElementById('ktQueQuan').value = '';
        
        document.getElementById('ngayBatDau').disabled = false;
        document.getElementById('cccd').disabled = false;
        
        if (tcSelect && tcInput) {
            tcSelect.value = '';
            tcSelect.disabled = false;
            
            tcInput.value = '';
            tcInput.disabled = false;
            tcInput.classList.add('d-none'); 
        }
        
        const divThoiHan = document.getElementById('divThoiHan');
        if (divThoiHan) divThoiHan.style.display = 'flex'; 
        
        if (divChiNhanhModal) divChiNhanhModal.style.display = 'block';
        if (divPhong) divPhong.style.display = 'block';
        if (hdChiNhanh) hdChiNhanh.disabled = false;
        if (selectPhong) selectPhong.disabled = false;
        
        const globalKhuVuc = document.getElementById('globalKhuVucFilter');
        if (globalKhuVuc && hdChiNhanh) {
            hdChiNhanh.innerHTML = globalKhuVuc.innerHTML;
            hdChiNhanh.value = globalKhuVuc.value || "";
        }
        
        loadPhongTrongTheoChiNhanh(); 
        document.getElementById('khachModalTitle').innerText = 'Ký hợp đồng mới';
        if(btnSave) btnSave.innerText = 'Lưu hợp đồng';
    }
    
    if (khachModalInstance) khachModalInstance.show();
}

function calculateEndDate() {
    const ngayBatDau = document.getElementById('ngayBatDau')?.value;
    const thoiHan = document.getElementById('thoiHan')?.value;
    const inputKetThuc = document.getElementById('ngayKetThuc');
    
    if (!ngayBatDau || !inputKetThuc) return;
    
    if (thoiHan === 'custom') {
        inputKetThuc.readOnly = false;
        inputKetThuc.value = ''; 
    } else {
        inputKetThuc.readOnly = true;
        const date = new Date(ngayBatDau);
        date.setMonth(date.getMonth() + parseInt(thoiHan));
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        inputKetThuc.value = `${yyyy}-${mm}-${dd}`;
    }
}

function saveKhach() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) {
        alert("Lỗi: Không xác định được danh tính Chủ trọ. Vui lòng đăng nhập lại!");
        return;
    }
    const id = document.getElementById('khachId')?.value;
    const reqInputs = [
        document.getElementById('ngayBatDau'),
        document.getElementById('tenKhach'),
        document.getElementById('hdChiNhanh'),
        document.getElementById('hdPhong')
    ];
    let isValid = true;
    
    reqInputs.forEach(input => {
        if (input) {
            kiemTraRong(input);
            if (input.classList.contains('is-invalid')) isValid = false;
        }
    });
    
    const cccdInput = document.getElementById('cccd');
    if (cccdInput) {
        khoaOChuaHopLe(cccdInput, 12, 'Căn cước công dân phải có đúng 12 số!');
        if (cccdInput.classList.contains('is-invalid')) isValid = false;
    }
    
    const sdtInput = document.getElementById('sdt');
    if (sdtInput) {
        khoaOChuaHopLe(sdtInput, 10, 'Số điện thoại phải có đúng 10 số!');
        if (sdtInput.classList.contains('is-invalid')) isValid = false;
    }
    kiemTraRongTienCoc();
    if (document.getElementById('tienCocSelect')?.classList.contains('is-invalid') || 
        document.getElementById('tienCoc')?.classList.contains('is-invalid')) {
        isValid = false;
    }
    
    if (!isValid) return; 
    const cccdValue = cccdInput.value.trim();
    const sdtValue = sdtInput.value.trim();
    
    let nsInput = document.getElementById('ktNgaySinh')?.value || '';
    let nsBackend = nsInput.length === 10 ? `${nsInput.split('/')[2]}-${nsInput.split('/')[1]}-${nsInput.split('/')[0]}` : null;
    
    const selectPhong = document.getElementById('hdPhong');
    const phongId = selectPhong ? selectPhong.value : null;
    
    let tienCocToSave = 0;
    const tcSelectVal = document.getElementById('tienCocSelect')?.value;
    if (tcSelectVal === 'custom') {
        tienCocToSave = parseFloat(document.getElementById('tienCoc')?.value) || 0;
    } else {
        tienCocToSave = parseFloat(tcSelectVal) || 0;
    }
    
    const data = {
        tenKhach: document.getElementById('tenKhach')?.value.trim(),
        cccd: cccdValue, 
        sdt: sdtValue,   
        ngaySinh: nsBackend,
        gioiTinh: document.getElementById('ktGioiTinh')?.value,
        queQuan: document.getElementById('ktQueQuan')?.value.trim(),
        tienCoc: tienCocToSave, 
        ngayBatDau: document.getElementById('ngayBatDau')?.value,
        ngayKetThuc: document.getElementById('ngayKetThuc')?.value, 
        phongTro: { id: phongId }
    };
    
    if (!id) {
        if (!phongId) return alert("Vui lòng chọn phòng để ký hợp đồng!");
        const opt = selectPhong.options[selectPhong.selectedIndex];
        const soPhong = opt.text.split(' - ')[0]; 
        const dienTich = opt.dataset.dientich || '...';
        const giaThue = opt.dataset.giathue ? Number(opt.dataset.giathue).toLocaleString('vi-VN') + ' VNĐ' : '...';
        const diaChi = opt.dataset.diachi || '...';
        const tienCocFormat = data.tienCoc ? data.tienCoc.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ';
        
        if (typeof taoNoiDungHopDong === 'function') {
            data.noiDungHopDong = taoNoiDungHopDong(data, soPhong, dienTich, giaThue, diaChi, tienCocFormat);
        }
    }
    const url = id ? `${API_URL_KHACH}/${id}` : `${API_URL_KHACH}/chu-tro/${chuTroId}`;
    fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async res => {
        if (res.ok) {
            if (khachModalInstance) khachModalInstance.hide();
            fetchNguoiThue(); 
            if (typeof fetchRooms === 'function') fetchRooms(); 
            alert(id ? "Cập nhật thành công!" : "Ký hợp đồng mới thành công!");
        } else {
            alert("Hệ thống báo lỗi:\n" + await res.text());
        }
    })
    .catch(err => console.error("Lỗi kết nối:", err));
}

// Thanh lý (Soft delete)
function deleteKhach(id) {
    if (confirm('XÁC NHẬN THANH LÝ HỢP ĐỒNG?\n\n- Khách sẽ được dọn ra và phòng chuyển về trạng thái TRỐNG.\n- Lịch sử Hóa đơn và Sự cố của phòng này vẫn sẽ được GIỮ LẠI an toàn trong hệ thống để quản lý dòng tiền.')) {
        fetch(`${API_URL_KHACH}/${id}`, { method: 'DELETE' })
        .then(async res => {
            if (res.ok) {
                alert(await res.text());
                setTimeout(() => {
                    fetchNguoiThue(); 
                    if (typeof fetchRooms === 'function') fetchRooms(); 
                }, 300);
            } else alert("Có lỗi xảy ra khi thanh lý!");
        });
    }
}

function capTaiKhoan(id, sdt) {
    if (!sdt || sdt.trim() === '') return alert("Khách thuê này chưa có SĐT!");
    const matKhauMoi = prompt(`TẠO TÀI KHOẢN.\n- Tên đăng nhập: ${sdt}\n- Nhập mật khẩu:`);
    if (matKhauMoi && matKhauMoi.trim() !== '') {
        fetch(`${API_URL_KHACH}/${id}/tao-tai-khoan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matKhauMoi)
        }).then(async res => alert(res.ok ? await res.text() : "Lỗi: " + await res.text()));
    }
}

function moModalGiaHan(id, ngayKetThucCu) {
    if (!ngayKetThucCu || ngayKetThucCu === 'null' || ngayKetThucCu === '') {
        alert("Lỗi: Không xác định được ngày kết thúc cũ của hợp đồng này!");
        return;
    }
    
    document.getElementById('ghKhachId').value = id;
    document.getElementById('ghNgayKetThucCu').value = ngayKetThucCu;
    document.getElementById('ghSoThang').value = "6"; 
    
    const oldDate = new Date(ngayKetThucCu);
    document.getElementById('hienThiNgayKetThucCu').innerText = `${String(oldDate.getDate()).padStart(2,'0')}/${String(oldDate.getMonth()+1).padStart(2,'0')}/${oldDate.getFullYear()}`;
    
    tinhTruocNgayGiaHan(); 
    
    if(giaHanModalInstance) giaHanModalInstance.show();
}

function tinhTruocNgayGiaHan() {
    const ngayCuStr = document.getElementById('ghNgayKetThucCu').value;
    const soThang = document.getElementById('ghSoThang').value;
    
    if(!ngayCuStr || !soThang) return;
    
    const d = new Date(ngayCuStr);
    d.setMonth(d.getMonth() + parseInt(soThang));
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    document.getElementById('hienThiNgayKetThucMoi').innerText = `${dd}/${mm}/${yyyy}`;
}

function xacNhanGiaHan() {
    const id = document.getElementById('ghKhachId').value;
    const ngayCuStr = document.getElementById('ghNgayKetThucCu').value;
    const soThang = document.getElementById('ghSoThang').value;
    
    const d = new Date(ngayCuStr);
    d.setMonth(d.getMonth() + parseInt(soThang));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const ngayKetThucMoi = `${yyyy}-${mm}-${dd}`;
    
    const formatNgayMoi = document.getElementById('hienThiNgayKetThucMoi').innerText;
    const formatNgayCu = document.getElementById('hienThiNgayKetThucCu').innerText;
    const ngayLapPhuLuc = new Date().toLocaleDateString('vi-VN');
    
    const phuLucHtml = `
        <div style="page-break-before: always; margin-top: 50px;">
            <hr style="border-top: 2px dashed #000; margin-bottom: 30px;">
            <h3 style="text-align: center; font-weight: bold; color: #d9534f;">PHỤ LỤC GIA HẠN HỢP ĐỒNG THUÊ PHÒNG</h3>
            <p><strong>Ngày lập phụ lục:</strong> ${ngayLapPhuLuc}</p>
            <p>Hai bên thống nhất thỏa thuận gia hạn thời gian thuê phòng thêm <strong>${soThang} tháng</strong>.</p>
            <p><strong>Thời gian thuê mới được tính:</strong> Từ ngày ${formatNgayCu} đến hết ngày ${formatNgayMoi}.</p>
            <p>Các điều khoản khác của hợp đồng chính vẫn giữ nguyên giá trị pháp lý.</p>
            <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                <div style="text-align: center;"><strong>ĐẠI DIỆN BÊN A (CHỦ TRỌ)</strong><br><i>(Ký, ghi rõ họ tên)</i></div>
                <div style="text-align: center;"><strong>ĐẠI DIỆN BÊN B (NGƯỜI THUÊ)</strong><br><i>(Ký, ghi rõ họ tên)</i></div>
            </div>
            <br><br><br><br>
        </div>
    `;
    
    fetch(`${API_URL_KHACH}/${id}/gia-han`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            ngayKetThucMoi: ngayKetThucMoi,
            phuLucHtml: phuLucHtml 
        })
    })
    .then(async res => {
        if (res.ok) {
            alert("Đã gia hạn và tạo phụ lục hợp đồng thành công!");
            if(giaHanModalInstance) giaHanModalInstance.hide();
            fetchNguoiThue(); 
        } else {
            alert("Lỗi: " + await res.text());
        }
    })
    .catch(err => console.error("Lỗi:", err));
}

function moModalThemNguoiGhep(khachId) {
    const form = document.getElementById('nguoiGhepForm');
    if (form) form.reset();
    
    document.getElementById('nguoiGhepTitle').innerText = "Thêm Người Ở Ghép";
    document.getElementById('ngKhachId').value = khachId;
    document.getElementById('ngGhepId').value = ''; 
    if (nguoiGhepModalInstance) nguoiGhepModalInstance.show();
}

function moModalSuaNguoiGhep(obj, khachId) {
    const form = document.getElementById('nguoiGhepForm');
    if (form) form.reset();
    
    document.getElementById('nguoiGhepTitle').innerText = "Sửa Thông Tin Người Ghép";
    document.getElementById('ngKhachId').value = khachId;
    document.getElementById('ngGhepId').value = obj.id;
    
    document.getElementById('ngTen').value = obj.ten;
    
    document.getElementById('ngCccd').value = obj.cccd;
    document.getElementById('ngCccd').disabled = true; 
    
    document.getElementById('ngSdt').value = obj.sdt || '';
    
    let ns = obj.ngaySinh || '';
    if (ns.includes('-')) {
        let parts = ns.split('-');
        ns = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    document.getElementById('ngNgaySinh').value = ns;
    document.getElementById('ngGioiTinh').value = obj.gioiTinh || '';
    document.getElementById('ngQueQuan').value = obj.queQuan || '';
    if (nguoiGhepModalInstance) nguoiGhepModalInstance.show();
}

function saveNguoiGhep() {
    if (document.querySelectorAll('#nguoiGhepForm .is-invalid').length > 0) {
        alert("Vui lòng sửa các lỗi màu đỏ trước khi lưu!");
        return;
    }
    const khachId = document.getElementById('ngKhachId').value;
    const ghepId = document.getElementById('ngGhepId').value; 
    
    const ten = document.getElementById('ngTen').value.trim();
    const cccd = document.getElementById('ngCccd').value.trim();
    const sdt = document.getElementById('ngSdt').value.trim();
    
    if (!ten || !cccd || !sdt) {
        alert("Vui lòng điền đầy đủ Tên, CCCD và SĐT!"); return;
    }
    
    let nsInput = document.getElementById('ngNgaySinh')?.value || '';
    let nsBackend = nsInput.length === 10 ? `${nsInput.split('/')[2]}-${nsInput.split('/')[1]}-${nsInput.split('/')[0]}` : null;
    
    const data = { 
        ten: ten, cccd: cccd, sdt: sdt,
        ngaySinh: nsBackend,
        gioiTinh: document.getElementById('ngGioiTinh')?.value,
        queQuan: document.getElementById('ngQueQuan')?.value.trim()
    };
    
    const url = ghepId ? `http://localhost:8080/api/nguoi-o-ghep/${ghepId}` : `http://localhost:8080/api/nguoi-o-ghep/khach/${khachId}`;
    const method = ghepId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async res => {
        if (res.ok) {
            alert(ghepId ? "Cập nhật thành công!" : "Thêm người ở ghép thành công!");
            if (nguoiGhepModalInstance) nguoiGhepModalInstance.hide();
            fetchNguoiThue(); 
        } else {
            alert("Lỗi: " + await res.text()); 
        }
    });
}

function xoaNguoiGhep(id) {
    if (confirm("Chắc chắn muốn xóa người ở ghép này?")) {
        fetch(`http://localhost:8080/api/nguoi-o-ghep/${id}`, { method: 'DELETE' })
        .then(async res => {
            if (res.ok) {
                alert("Đã xóa người ở ghép!");
                setTimeout(() => fetchNguoiThue(), 300);
            } else {
                const errorMsg = await res.text();
                alert("Lỗi khi xóa: " + errorMsg);
            }
        });
    }
}

function setupKiemTraTrungLap(inputId, type) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    let typingTimer;
    inputEl.addEventListener('input', function() {
        clearTimeout(typingTimer);
        const val = this.value.trim();
        const errorEl = this.nextElementSibling; 
        
        if (this.disabled) return;
        
        if (!val || (type === 'sdt' && val.length < 10) || (type === 'cccd' && val.length < 12)) {
            this.classList.remove('is-valid', 'is-invalid');
            if (errorEl && errorEl.classList.contains('invalid-feedback')) errorEl.innerText = "";
            return;
        }
        typingTimer = setTimeout(() => {
            fetch(`http://localhost:8080/api/nguoi-thue/kiem-tra/${type}?${type}=${val}`)
                .then(res => {
                    if (!res.ok) throw new Error("Lỗi API " + res.status);
                    return res.json();
                })
                .then(data => {
                    if (data.exists === true) {
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                        if (errorEl && errorEl.classList.contains('invalid-feedback')) {
                            errorEl.innerText = type === 'sdt' ? "⚠️ Số điện thoại này đã được sử dụng!" : "⚠️ Căn cước công dân này đã tồn tại!";
                            errorEl.style.display = 'block';
                        }
                    } else if (data.exists === false) {
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                        if (errorEl && errorEl.classList.contains('invalid-feedback')) errorEl.innerText = "";
                    } else {
                        throw new Error("Dữ liệu trả về bị sai định dạng!");
                    }
                })
                .catch(err => {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                    if (errorEl && errorEl.classList.contains('invalid-feedback')) {
                        errorEl.innerText = "❌ Không thể kiểm tra: " + err.message;
                        errorEl.style.display = 'block';
                    }
                });
        }, 500); 
    });
}

function kiemTraRong(input) {
    if (!input.value || input.value.trim() === "") {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}

function toggleTienCoc() {
    const select = document.getElementById('tienCocSelect');
    const input = document.getElementById('tienCoc');
    if (select.value === 'custom') {
        input.classList.remove('d-none');
        input.focus();
    } else {
        input.classList.add('d-none'); 
    }
    kiemTraRongTienCoc();
}

function kiemTraRongTienCoc() {
    const select = document.getElementById('tienCocSelect');
    const input = document.getElementById('tienCoc');
    
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

function locKyTuSo(input, maxLength) {
    input.value = input.value.replace(/[^0-9]/g, ''); 
    if (input.value.length === maxLength) input.classList.remove('is-invalid');
}

function formatDateInput(input) {
    let val = input.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.substring(0, 8); 
    if (val.length >= 5) input.value = val.substring(0, 2) + '/' + val.substring(2, 4) + '/' + val.substring(4, 8);
    else if (val.length >= 3) input.value = val.substring(0, 2) + '/' + val.substring(2, val.length);
    else input.value = val;
}

let chuoiNoTienTam = ""; 
function moModalPhanHoi(khachId) {
    document.getElementById('phKhachId').value = khachId;
    document.getElementById('phLyDo').value = '';
    
    document.getElementById('phKhuVucNoHoaDon').classList.add('d-none');
    document.getElementById('phDanhSachNo').innerHTML = '';
    chuoiNoTienTam = '';
    
    fetch(`http://localhost:8080/api/nguoi-thue/${khachId}`)
    .then(res => res.json())
    .then(khach => {
        if (khach.phongTro && khach.phongTro.id) {
            kiemTraNoHoaDon(khach.phongTro.id);
        }
    }).catch(err => console.error("Lỗi lấy thông tin khách:", err));
    
    new bootstrap.Modal(document.getElementById('modalPhanHoiYeuCau')).show();
}

function kiemTraNoHoaDon(phongId) {
    fetch(`http://localhost:8080/api/hoa-don/phong/${phongId}`)
    .then(res => res.json())
    .then(danhSachHoaDon => {
        const hoaDonNo = danhSachHoaDon.filter(hd => hd.trangThai === 'CHUA_THU');
        
        if (hoaDonNo.length > 0) {
            const divNo = document.getElementById('phKhuVucNoHoaDon');
            const ulNo = document.getElementById('phDanhSachNo');
            divNo.classList.remove('d-none'); 
            
            let tongNo = 0;
            let chiTietThang = [];
            hoaDonNo.forEach(hd => {
                const tien = hd.tongTien || 0;
                tongNo += tien;
                chiTietThang.push(hd.thangThu);
                ulNo.innerHTML += `<li>Tháng <strong>${hd.thangThu}</strong>: <span class="text-danger">${tien.toLocaleString('vi-VN')} đ</span></li>`;
            });
            chuoiNoTienTam = `Bạn chưa thanh toán hóa đơn tháng ${chiTietThang.join(', ')} với tổng nợ là ${tongNo.toLocaleString('vi-VN')} đ. Vui lòng thanh toán đầy đủ trước khi làm thủ tục!`;
        }
    }).catch(err => console.error("Lỗi lấy hóa đơn:", err));
}

function autoFillLyDoNoTien() {
    const lyDoEl = document.getElementById('phLyDo');
    const currentText = lyDoEl.value.trim();
    
    document.getElementById('phQuyetDinh').value = "false";
    
    if (currentText) {
        lyDoEl.value = currentText + "\n- " + chuoiNoTienTam;
    } else {
        lyDoEl.value = chuoiNoTienTam;
    }
}

function guiPhanHoiChoKhach() {
    const id = document.getElementById('phKhachId').value;
    const isChapNhan = document.getElementById('phQuyetDinh').value;
    const lyDo = document.getElementById('phLyDo').value.trim();
    
    fetch(`${API_URL_KHACH}/${id}/phan-hoi-yeu-cau?isChapNhan=${isChapNhan}&lyDo=${encodeURIComponent(lyDo)}`, {
        method: 'POST'
    })
    .then(async res => {
        if (res.ok) {
            alert("Đã gửi phản hồi thành công!");
            bootstrap.Modal.getInstance(document.getElementById('modalPhanHoiYeuCau')).hide();
            fetchNguoiThue(); 
        } else {
            alert("Lỗi: " + await res.text());
        }
    }).catch(err => console.error(err));
}

// ==========================================
// KHO LƯU TRỮ (LỊCH SỬ THANH LÝ)
// ==========================================
function moModalLichSuThanhLy() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;

    const tbody = document.getElementById('bangLichSuThanhLy');
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted py-4">Đang tải dữ liệu...</td></tr>`;
    
    new bootstrap.Modal(document.getElementById('modalLichSuThanhLy')).show();

    fetch(`${API_URL_KHACH}/chu-tro/${chuTroId}/lich-su-thanh-ly`)
        .then(async res => {
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(res.status === 404 ? "Lỗi 404: Không tìm thấy API (Bạn đã Restart Spring Boot chưa?)" : errText);
            }
            return res.json();
        })
        .then(data => {
            danhSachKhachCu = data; 
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-success py-4 fw-bold">Trống! Chưa có hợp đồng nào được thanh lý.</td></tr>`;
                return;
            }

            data.forEach(khach => {
                const tenPhong = khach.phongTro ? `<span class="badge bg-secondary">${khach.phongTro.soPhong}</span>` : '---';
                const ngayBD = khach.ngayBatDau ? khach.ngayBatDau.split('-').reverse().join('/') : '---';
                const ngayKT = khach.ngayKetThuc ? khach.ngayKetThuc.split('-').reverse().join('/') : '---';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tenPhong}</td>
                    <td class="fw-bold text-dark">${khach.tenKhach}</td>
                    <td>${khach.sdt || '---'}</td>
                    <td>${khach.cccd || '---'}</td>
                    <td class="text-muted" style="font-size: 0.9em;">${ngayBD} <i class="bi bi-arrow-right"></i> ${ngayKT}</td>
                    <td>
                        <button class="btn btn-sm btn-primary fw-bold" onclick="exportHopDong(${khach.id}, true)">
                            <i class="bi bi-file-earmark-text"></i> Xem HĐ
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="6" class="text-danger py-4 fw-bold">⚠️ LỖI: ${err.message}</td></tr>`;
        });
}

// ==========================================
// HÀM XEM HỢP ĐỒNG (ĐÃ TÍCH HỢP BIẾN CỜ)
// ==========================================
function exportHopDong(id, isArchive = false) {
    const listToSearch = isArchive ? danhSachKhachCu : danhSachKhach;
    const khach = listToSearch.find(k => k.id === id);
    
    if (!khach) return;
    const content = document.getElementById('hopDongContent');
    content.innerHTML = khach.noiDungHopDong ? khach.noiDungHopDong : `Bản lưu hợp đồng gốc không tồn tại.`;
    
    // KIỂM TRA ĐỂ BẬT CỜ
    if (isArchive) {
        isTuKhoLuuTru = true; // Bật cờ: "Đang xem từ Kho lưu trữ"
        
        // Ẩn tạm Kho lưu trữ đi
        const modalLuuTru = bootstrap.Modal.getInstance(document.getElementById('modalLichSuThanhLy'));
        if (modalLuuTru) modalLuuTru.hide();
    } else {
        isTuKhoLuuTru = false; // Tắt cờ nếu đang xem khách ở bên ngoài
    }
    
    const hopDongModalEl = document.getElementById('hopDongModal');
    let hopDongModal = bootstrap.Modal.getInstance(hopDongModalEl);
    if (!hopDongModal) {
        hopDongModal = new bootstrap.Modal(hopDongModalEl);
    }
    
    // Đợi Kho lưu trữ thu vào hoàn toàn rồi mới bung Hợp đồng ra
    setTimeout(() => {
        hopDongModal.show();
    }, isArchive ? 300 : 0);
}

// ==========================================
// KHÁCH GỬI XÁC NHẬN GIA HẠN / TRẢ PHÒNG
// ==========================================
function guiPhanHoiGiaHan(isGiaHan) {
    const khachId = localStorage.getItem('khachId');
    let soThang = 0;
    
    if (isGiaHan) {
        soThang = document.getElementById('soThangGiaHanInput').value;
        if (!soThang || isNaN(soThang) || parseInt(soThang) <= 0) {
            alert("Vui lòng chọn số tháng hợp lệ!");
            return;
        }
    } else {
        if (!confirm("Bạn có chắc chắn KHÔNG GIA HẠN và sẽ dọn đi khi hết hạn hợp đồng? Hệ thống sẽ báo cho Chủ trọ biết quyết định này.")) {
            return;
        }
    }
    
    fetch(`http://localhost:8080/api/nguoi-thue/${khachId}/gui-yeu-cau-gia-han?isGiaHan=${isGiaHan}&soThang=${soThang}`, {
        method: 'POST'
    })
    .then(async res => {
        if (res.ok) {
            alert(isGiaHan ? "Đã gửi yêu cầu gia hạn đến Chủ trọ!" : "Đã thông báo KHÔNG GIA HẠN đến Chủ trọ!");
            
            const modalEl = document.getElementById('modalYeuCauGiaHanUser');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            if (typeof loadThongBaoGop === 'function') loadThongBaoGop(); 
            if (typeof loadWidgetHopDong === 'function') loadWidgetHopDong(); 
        } else {
            alert("Có lỗi xảy ra: " + await res.text());
        }
    }).catch(err => console.error("Lỗi:", err));
}