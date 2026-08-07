const API_URL_TAM_TRU_KHACH = '/api/tam-tru';
const API_URL_KHACH_THUE = '/api/nguoi-thue';
let danhSachNguoiKhai = []; // Chứa khách chính + người ghép

// Tải danh sách lịch sử khai báo
function loadLichSuTamTru() {
    const khachId = localStorage.getItem('khachId');
    if (!khachId) return;

    fetch(`${API_URL_TAM_TRU_KHACH}/khach/${khachId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tableTamTruKhachBody');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            if(data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted fst-italic">Bạn chưa gửi tờ khai nào.</td></tr>';
                return;
            }

            data.forEach((item, index) => {
                const badgeClass = item.trangThai === 'DA_HOAN_THANH' ? 'bg-success' : 'bg-warning text-dark';
                const tenTrangThai = item.trangThai === 'DA_HOAN_THANH' ? 'Đã hoàn thành' : 'Chờ xử lý';
                const safeData = JSON.stringify(item).replace(/'/g, "&#39;");
                
                tbody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="fw-bold text-primary">${item.hoTen}</td>
                        <td>${item.cccd}</td>
                        <td>${item.ngayKhai || ''}</td>
                        <td><span class="badge ${badgeClass}">${tenTrangThai}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info text-white fw-bold" onclick='moModalXemToKhaiKhach(${safeData})'>
                                <i class="bi bi-eye"></i> Xem
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Lỗi tải lịch sử tạm trú:", err));
}

// Mở Modal & Tải danh sách người khai
function moModalKhaiBaoNguoiThue() {
    document.getElementById('formTamTruKhach').reset();
    const khachId = localStorage.getItem('khachId');
    
    // Gọi API lấy chi tiết hợp đồng để bóc tách người ở chính & ghép
    fetch(`${API_URL_KHACH_THUE}/${khachId}`)
        .then(res => res.json())
        .then(khach => {
            danhSachNguoiKhai = [];
            let diaChiPhong = khach.phongTro ? `Phòng ${khach.phongTro.soPhong}, ${khach.phongTro.diaChi}` : '';
            
            // Thêm Người thuê chính
            danhSachNguoiKhai.push({
                idGia: 'CH_' + khach.id,
                ten: khach.tenKhach,
                cccd: khach.cccd,
                sdt: khach.sdt || khach.soDienThoai,
                ngaySinh: khach.ngaySinh,
                gioiTinh: khach.gioiTinh,
                queQuan: khach.queQuan,
                choOHienTai: diaChiPhong,
                vaiTro: 'Người thuê chính'
            });

            // Thêm Người ở ghép (nếu có)
            let dsGhep = khach.nguoiOGhepList || khach.danhSachNguoiOGhep || [];
            dsGhep.forEach(g => {
                danhSachNguoiKhai.push({
                    idGia: 'OG_' + g.id,
                    ten: g.hoTen || g.ten,
                    cccd: g.cccd,
                    sdt: g.sdt || g.soDienThoai,
                    ngaySinh: g.ngaySinh,
                    gioiTinh: g.gioiTinh,
                    queQuan: g.queQuan || g.thuongTru,
                    choOHienTai: diaChiPhong,
                    vaiTro: 'Người ở ghép'
                });
            });

            // Render Dropdown
            const selectNguoi = document.getElementById('ntChonNguoi');
            selectNguoi.innerHTML = '<option value="">-- Chọn người cần khai báo --</option>';
            danhSachNguoiKhai.forEach(nk => {
                selectNguoi.innerHTML += `<option value="${nk.idGia}">${nk.ten} (${nk.vaiTro})</option>`;
            });

            const modal = new bootstrap.Modal(document.getElementById('modalTamTruKhach'));
            modal.show();
        });
}

// Tự động điền khi Khách chọn người
function dienTuDongThongTinNguoiKhai() {
    const idGia = document.getElementById('ntChonNguoi').value;
    if (!idGia) {
        document.getElementById('formTamTruKhach').reset();
        return;
    }

    const nguoi = danhSachNguoiKhai.find(n => n.idGia === idGia);
    if (nguoi) {
        document.getElementById('ntHoTen').value = nguoi.ten || '';
        document.getElementById('ntCccd').value = nguoi.cccd || '';
        document.getElementById('ntSdt').value = nguoi.sdt || '';
        
        let ns = nguoi.ngaySinh || '';
        if (ns.includes('/')) {
            let parts = ns.split('/');
            ns = `${parts[2]}-${parts[1]}-${parts[0]}`; 
        }
        document.getElementById('ntNgaySinh').value = ns;
        document.getElementById('ntGioiTinh').value = nguoi.gioiTinh || '';
        document.getElementById('ntThuongTru').value = nguoi.queQuan || '';
        document.getElementById('ntChoOHienTai').value = nguoi.choOHienTai || '';
    }
}

// Gửi tờ khai
function guiKhaiBaoTamTruNguoiThue() {
    const khachId = localStorage.getItem('khachId');
    if (!khachId) return;

    const valNgaySinh = document.getElementById('ntNgaySinh').value;

    const data = {
        nguoiThue: { id: parseInt(khachId) },
        hoTen: document.getElementById('ntHoTen').value.trim(),
        cccd: document.getElementById('ntCccd').value.trim(),
        sdt: document.getElementById('ntSdt').value.trim(),
        ngaySinh: valNgaySinh ? valNgaySinh : null,
        gioiTinh: document.getElementById('ntGioiTinh').value,
        thuongTru: document.getElementById('ntThuongTru').value.trim(),
        choOHienTai: document.getElementById('ntChoOHienTai').value.trim(),
        ngayKhai: new Date().toISOString().split('T')[0],
        trangThai: 'CHO_XU_LY'
    };

    if (!data.hoTen || !data.cccd || !data.sdt || !data.thuongTru || !data.choOHienTai) {
        alert("Vui lòng nhập đủ các trường bắt buộc có dấu (*)");
        return;
    }

    fetch(API_URL_TAM_TRU_KHACH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(async res => {
        if (res.ok) {
            alert("Đã gửi tờ khai thành công! Vui lòng chờ chủ trọ xác nhận.");
            bootstrap.Modal.getInstance(document.getElementById('modalTamTruKhach')).hide();
            loadLichSuTamTru();
        }
    });
}

// Xem lại Tờ khai CT01
function moModalXemToKhaiKhach(item) {
    let ngaySinhFormat = item.ngaySinh || '..................';
    if (ngaySinhFormat.includes('-')) {
        const parts = ngaySinhFormat.split('-');
        ngaySinhFormat = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    let ngayTao = item.ngayKhai ? new Date(item.ngayKhai) : new Date();
    
    let chiNhanhKinhGui = '................................................';
    if (item.choOHienTai) {
        const parts = item.choOHienTai.split(',');
        if (parts.length > 1) {
            chiNhanhKinhGui = parts.slice(1).join(',').trim();
        } else {
            chiNhanhKinhGui = item.choOHienTai;
        }
    }

    // LẤY THÔNG TIN CHỦ TRỌ TỪ LOCAL STORAGE 
    const tenAdmin = localStorage.getItem('adminName') || '....................................';
    const cccdAdmin = localStorage.getItem('adminCCCD') || '';

    const dataIn = {
        hoTen: item.hoTen || '................................................',
        ngaySinh: ngaySinhFormat,
        gioiTinh: item.gioiTinh || '.........',
        cccd: item.cccd || '....................................',
        sdt: item.sdt || '....................................',
        thuongTru: item.thuongTru || '................................................',
        choOHienTai: item.choOHienTai || '................................................',
        kinhGui: chiNhanhKinhGui,
        ngayKhaiNgay: String(ngayTao.getDate()).padStart(2, '0'),
        ngayKhaiThang: String(ngayTao.getMonth() + 1).padStart(2, '0'),
        ngayKhaiNam: ngayTao.getFullYear(),
        
        // TRUYỀN THÔNG TIN CHỦ TRỌ VÀO TEMPLATE
        tenChuTro: tenAdmin.toUpperCase(), 
        cccdChuTro: cccdAdmin
    };

    const printContent = getTemplateCT01(dataIn);
    document.getElementById('inTamTruKhachContent').innerHTML = printContent;
    new bootstrap.Modal(document.getElementById('inTamTruKhachModal')).show();
}

document.addEventListener('DOMContentLoaded', loadLichSuTamTru);