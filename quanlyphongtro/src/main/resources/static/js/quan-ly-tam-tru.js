const API_URL_TAM_TRU = 'http://localhost:8080/api/tam-tru';
const API_URL_KHACH_TAM_TRU = 'http://localhost:8080/api/nguoi-thue'; 
let danhSachKhachTamTru = []; 
let mangKhachVaNguoiGhep = [];

// Load danh sách tờ khai 
function loadDanhSachTamTru() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    
    const selectedKhuVuc = document.getElementById('globalKhuVucFilter')?.value;
    const url = (selectedKhuVuc && selectedKhuVuc !== "")
        ? `${API_URL_TAM_TRU}/chu-tro/${chuTroId}?khuVucId=${selectedKhuVuc}`
        : `${API_URL_TAM_TRU}/chu-tro/${chuTroId}`;
        
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tableTamTruBody');
            if (!tbody) return; 
            
            tbody.innerHTML = '';
            
            // Lấy trạng thái sắp xếp
            const sortType = document.getElementById('sortTamTru')?.value || 'desc';
            
            // Tạo bản sao và sắp xếp
            let dataToRender = [...data];
            dataToRender.sort((a, b) => {
                return sortType === 'desc' ? b.id - a.id : a.id - b.id;
            });
            
            dataToRender.forEach((item, index) => {
                const badgeClass = item.trangThai === 'DA_HOAN_THANH' ? 'bg-success' : 'bg-warning text-dark';
                const tenTrangThai = item.trangThai === 'DA_HOAN_THANH' ? 'Đã in/Khai báo' : 'Chờ xử lý';
                
                const safeData = JSON.stringify(item).replace(/'/g, "&#39;");
                tbody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="fw-bold">${item.hoTen}</td>
                        <td>${item.cccd}</td>
                        <td>${item.choOHienTai}</td>
                        <td>${item.ngayKhai || ''}</td>
                        <td><span class="badge ${badgeClass}">${tenTrangThai}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary w-100 fw-bold" onclick='moModalXemToKhai(${safeData})'>
                                Xem
                            </button>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning text-dark" onclick='suaChiTietTamTru(${safeData})' title="Sửa thông tin">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="danhDauHoanThanh(${item.id})" title="Đánh dấu đã khai báo xong">
                                <i class="bi bi-check-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="xoaTamTru(${item.id})" title="Xóa">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Lỗi tải DS Tạm trú:", err));
}

function moModalKhaiBaoChuTro() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    const form = document.getElementById('formTamTruChuTro');
    if (form) form.reset();
    
    document.getElementById('tamTruId').value = '';
    document.getElementById('khuVucChonKhach').classList.remove('d-none'); 
    document.getElementById('btnInToKhai').classList.add('d-none');
    
    document.getElementById('ttTimKiemKhach').value = '';
    fetch(`${API_URL_KHACH_TAM_TRU}/chu-tro/${chuTroId}`)
        .then(res => res.json())
        .then(khachList => {
            mangKhachVaNguoiGhep = [];
            
            khachList.forEach(k => {
                let kvId = (k.phongTro && k.phongTro.khuVuc) ? String(k.phongTro.khuVuc.id) : '';
                let soPhong = (k.phongTro && k.phongTro.soPhong) ? k.phongTro.soPhong : 'N/A';
                
                mangKhachVaNguoiGhep.push({
                    idGia: 'CH_' + k.id,
                    nguoiThueId: k.id,
                    ten: k.tenKhach,
                    phong: soPhong,
                    chiNhanh: kvId, 
                    vaiTro: 'Người thuê chính',
                    cccd: k.cccd,
                    sdt: k.sdt || k.soDienThoai,
                    ngaySinh: k.ngaySinh,
                    gioiTinh: k.gioiTinh,
                    queQuan: k.queQuan
                });
                
                let dsGhep = k.nguoiOGhepList || k.danhSachNguoiOGhep || [];
                dsGhep.forEach(g => {
                    mangKhachVaNguoiGhep.push({
                        idGia: 'OG_' + g.id, 
                        nguoiThueId: k.id, 
                        ten: g.hoTen || g.ten,
                        phong: soPhong,
                        chiNhanh: kvId, 
                        vaiTro: 'Người ở ghép',
                        cccd: g.cccd,
                        sdt: g.sdt || g.soDienThoai,
                        ngaySinh: g.ngaySinh,
                        gioiTinh: g.gioiTinh,
                        queQuan: g.queQuan || g.thuongTru
                    });
                });
            });
            const selectChiNhanh = document.getElementById('ttLocChiNhanh');
            const globalFilter = document.getElementById('globalKhuVucFilter'); 
            
            if (selectChiNhanh && globalFilter) {
                selectChiNhanh.innerHTML = '';
                Array.from(globalFilter.options).forEach(opt => {
                    const newOpt = document.createElement('option');
                    newOpt.value = opt.value;
                    newOpt.text = opt.text;
                    selectChiNhanh.appendChild(newOpt);
                });
                selectChiNhanh.value = globalFilter.value || "";
            }
            
            locDanhSachKhachTamTru();
        })
        .catch(err => console.error("Lỗi tải danh sách khách:", err));
        
    const modalEl = document.getElementById('modalTamTruChuTro');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function locDanhSachKhachTamTru() {
    const tuKhoa = document.getElementById('ttTimKiemKhach').value.toLowerCase().trim();
    const chiNhanhLoc = document.getElementById('ttLocChiNhanh').value;
    const ketQuaLoc = mangKhachVaNguoiGhep.filter(k => {
        const khopChiNhanh = (chiNhanhLoc === '') || (String(k.chiNhanh) === String(chiNhanhLoc));
        const khopTuKhoa = (tuKhoa === '') || 
                           k.ten.toLowerCase().includes(tuKhoa) || 
                           String(k.phong).toLowerCase().includes(tuKhoa);
        
        return khopChiNhanh && khopTuKhoa;
    });
    const selectKhach = document.getElementById('chonKhachThue');
    selectKhach.innerHTML = '';
    
    if (ketQuaLoc.length === 0) {
        selectKhach.innerHTML = '<option value="" disabled>Không tìm thấy kết quả phù hợp...</option>';
        return;
    }
    ketQuaLoc.forEach(k => {
        selectKhach.innerHTML += `<option value="${k.idGia}">Phòng ${k.phong} | ${k.ten} (${k.vaiTro})</option>`;
    });
}

function dienTuDongThongTinKhach() {
    const idGia = document.getElementById('chonKhachThue').value;
    if (!idGia) {
        document.getElementById('formTamTruChuTro').reset();
        return;
    }
    const khach = mangKhachVaNguoiGhep.find(k => k.idGia === idGia);
    if (khach) {
        document.getElementById('khachThueId').value = khach.nguoiThueId; 
        
        document.getElementById('ctHoTen').value = khach.ten || '';
        document.getElementById('ctCccd').value = khach.cccd || '';
        document.getElementById('ctSdt').value = khach.sdt || ''; 
        
        let ns = khach.ngaySinh || '';
        if (ns.includes('/')) {
            let parts = ns.split('/');
            ns = `${parts[2]}-${parts[1]}-${parts[0]}`; 
        }
        document.getElementById('ctNgaySinh').value = ns;
        
        document.getElementById('ctGioiTinh').value = khach.gioiTinh || '';
        document.getElementById('ctThuongTru').value = khach.queQuan || '';
        
        document.getElementById('ctChoOHienTai').value = `Phòng ${khach.phong}, ${khach.chiNhanh}`;
    }
}

function suaChiTietTamTru(item) {
    document.getElementById('tamTruId').value = item.id;
    document.getElementById('khachThueId').value = item.nguoiThue ? item.nguoiThue.id : '';
    
    document.getElementById('khuVucChonKhach').classList.add('d-none');
    document.getElementById('btnInToKhai').classList.add('d-none'); 
    
    document.getElementById('ctHoTen').value = item.hoTen;
    document.getElementById('ctCccd').value = item.cccd;
    document.getElementById('ctSdt').value = item.sdt || '';
    document.getElementById('ctNgaySinh').value = item.ngaySinh || '';
    document.getElementById('ctGioiTinh').value = item.gioiTinh || '';
    document.getElementById('ctThuongTru').value = item.thuongTru || '';
    document.getElementById('ctChoOHienTai').value = item.choOHienTai || '';
    const modalEl = document.getElementById('modalTamTruChuTro');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function luuToKhaiChuTro() {
    const id = document.getElementById('tamTruId').value;
    const khachId = document.getElementById('khachThueId').value;
    
    const valNgaySinh = document.getElementById('ctNgaySinh').value;
    const data = {
        nguoiThue: khachId ? { id: parseInt(khachId) } : null,
        hoTen: document.getElementById('ctHoTen').value.trim(),
        cccd: document.getElementById('ctCccd').value.trim(),
        sdt: document.getElementById('ctSdt').value.trim(),
        ngaySinh: valNgaySinh ? valNgaySinh : null, 
        gioiTinh: document.getElementById('ctGioiTinh').value || null,
        thuongTru: document.getElementById('ctThuongTru').value.trim(),
        choOHienTai: document.getElementById('ctChoOHienTai').value.trim(),
        ngayKhai: new Date().toISOString().split('T')[0]
    };
    if (!data.hoTen || !data.cccd || !data.thuongTru || !data.choOHienTai) {
        alert("Vui lòng nhập đủ Họ tên, CCCD và Thường trú!");
        return;
    }
    fetch(id ? `${API_URL_TAM_TRU}/${id}` : API_URL_TAM_TRU, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async res => {
        if (res.ok) {
            alert(id ? "Cập nhật thành công!" : "Tạo tờ khai thành công!");
            bootstrap.Modal.getInstance(document.getElementById('modalTamTruChuTro')).hide();
            loadDanhSachTamTru();
        } else {
            const errText = await res.text();
            alert("Hệ thống Backend báo lỗi:\n" + errText);
        }
    })
    .catch(err => console.error("Lỗi lưu tờ khai:", err));
}

function moModalXemToKhai(item) {
    let ngaySinhFormat = item.ngaySinh || '..................';
    if (ngaySinhFormat.includes('-')) {
        const parts = ngaySinhFormat.split('-');
        ngaySinhFormat = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    let ngayTao = new Date(); 
    if (item.ngayKhai) {
        ngayTao = new Date(item.ngayKhai);
    }
    const ngay = String(ngayTao.getDate()).padStart(2, '0');
    const thang = String(ngayTao.getMonth() + 1).padStart(2, '0');
    const nam = ngayTao.getFullYear();
    
    let sdtHienThi = item.sdt;
    if (!sdtHienThi && item.nguoiThue) {
        sdtHienThi = item.nguoiThue.sdt || item.nguoiThue.soDienThoai;
    }
    
    let chiNhanhKinhGui = '.......................................................................................';
    if (item.nguoiThue && item.nguoiThue.phongTro && item.nguoiThue.phongTro.diaChi) {
        chiNhanhKinhGui = item.nguoiThue.phongTro.diaChi;
    } else if (item.choOHienTai) {
        const parts = item.choOHienTai.split(',');
        if (parts.length > 1) {
            chiNhanhKinhGui = parts.slice(1).join(',').trim();
        } else {
            chiNhanhKinhGui = item.choOHienTai;
        }
    }
    
    const dataIn = {
        hoTen: item.hoTen || '................................................',
        ngaySinh: ngaySinhFormat,
        gioiTinh: item.gioiTinh || '.........',
        cccd: item.cccd || '....................................',
        sdt: sdtHienThi || '....................................', 
        thuongTru: item.thuongTru || '....................................................................................',
        choOHienTai: item.choOHienTai || '....................................................................................',
        kinhGui: chiNhanhKinhGui,
        
        ngayKhaiNgay: ngay,
        ngayKhaiThang: thang,
        ngayKhaiNam: nam,
        tenChuTro: (localStorage.getItem('adminName') || '....................................').toUpperCase(),
        cccdChuTro: localStorage.getItem('adminCCCD') || ''
    };
    const printContent = getTemplateCT01(dataIn);
    document.getElementById('inTamTruContent').innerHTML = printContent;
    
    const inModal = new bootstrap.Modal(document.getElementById('inTamTruModal'));
    inModal.show();
}

function inChiTietTamTru() {
    const content = document.getElementById('inTamTruContent').innerHTML;
    const printWindow = window.open('', '', 'width=900,height=900');
    
    printWindow.document.write('<html><head><title>In Tờ Khai CT01</title></head><body style="margin: 0; padding: 20px;">');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function xoaTamTru(id) {
    if (confirm("Bạn có chắc chắn muốn xóa tờ khai này khỏi hệ thống?")) {
        fetch(`${API_URL_TAM_TRU}/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert("Đã xóa tờ khai thành công!");
                    loadDanhSachTamTru(); 
                } else {
                    alert("Lỗi khi xóa tờ khai!");
                }
            })
            .catch(err => console.error(err));
    }
}

function danhDauHoanThanh(id) {
    if (confirm("Xác nhận tờ khai này đã được xử lý (Đã in / Đã nộp)?")) {
        fetch(`${API_URL_TAM_TRU}/${id}/trang-thai`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify("DA_HOAN_THANH")
        })
        .then(res => {
            if (res.ok) {
                loadDanhSachTamTru(); 
            }
        })
        .catch(err => console.error(err));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadDanhSachTamTru();
});