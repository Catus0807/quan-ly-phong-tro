const API_URL_SUCO = '/api/su-co';
let suCoModal;
let danhSachPhongGlobal = []; 
document.addEventListener("DOMContentLoaded", () => {
    suCoModal = new bootstrap.Modal(document.getElementById('suCoModal'));
    
    const scChiNhanhEl = document.getElementById('scChiNhanh');
    if(scChiNhanhEl) {
        scChiNhanhEl.addEventListener('change', onChiNhanhChange);
    }
});

// LẤY VÀ LỌC SỰ CỐ 
function fetchSuCo() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    
    const selectChiNhanh = document.getElementById('globalKhuVucFilter');
    const chiNhanhId = selectChiNhanh ? selectChiNhanh.value : '';
    const tenChiNhanh = (selectChiNhanh && selectChiNhanh.selectedIndex > 0) ? selectChiNhanh.options[selectChiNhanh.selectedIndex].text : '';
    fetch('/api/su-co')
        .then(res => res.json())
        .then(data => {
            let filteredData = data.filter(sc => {
                if (sc.chuTro && String(sc.chuTro.id) === String(chuTroId)) return true;
                if (sc.phongTro && sc.phongTro.chuTro && String(sc.phongTro.chuTro.id) === String(chuTroId)) return true;
                return false;
            });
            
            if (chiNhanhId !== "") {
                filteredData = filteredData.filter(sc => {
                    if (sc.phongTro && sc.phongTro.khuVuc) {
                        return String(sc.phongTro.khuVuc.id) === String(chiNhanhId);
                    }
                    if (!sc.phongTro && sc.chiNhanh === tenChiNhanh) {
                        return true;
                    }
                    return false;
                });
            }
            
            // Xóa hàm .sort() cứng ở đây để nhường cho hàm renderTable xử lý linh hoạt
            renderTableSuCo(filteredData);
        })
        .catch(err => console.error("Lỗi tải sự cố:", err));
}

// Vẽ bảng sự cố 
function renderTableSuCo(data) {
    const tbody = document.getElementById('tableSuCo');
    tbody.innerHTML = '';
    
    const filterThang = document.getElementById('filterThangSuCo')?.value;
    const filterTrangThai = document.getElementById('filterTrangThaiSuCo')?.value;
    const sortType = document.getElementById('sortSuCo')?.value || 'desc';
    
    // Tạo bản sao và sắp xếp
    let dataToRender = [...data];
    dataToRender.sort((a, b) => {
        return sortType === 'desc' ? b.id - a.id : a.id - b.id;
    });

    let stt = 1; 
    dataToRender.forEach((sc) => {
        if (filterTrangThai && sc.trangThai !== filterTrangThai) return;
        
        let ngayBaoStr = "---";
        let thangBaoStr = "";
        if (sc.ngayBao) {
            if (Array.isArray(sc.ngayBao)) {
                ngayBaoStr = `${sc.ngayBao[2].toString().padStart(2, '0')}/${sc.ngayBao[1].toString().padStart(2, '0')}/${sc.ngayBao[0]}`;
                thangBaoStr = `${sc.ngayBao[1].toString().padStart(2, '0')}/${sc.ngayBao[0]}`;
            } else {
                const d = new Date(sc.ngayBao);
                ngayBaoStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                thangBaoStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            }
        }
        
        if (filterThang && thangBaoStr !== filterThang) return; 
        
        const tr = document.createElement('tr');
        
        let badgeTrangThai = '';
        if(sc.trangThai === 'DANG_CHO') badgeTrangThai = '<span class="badge bg-danger">Đang chờ</span>';
        else if(sc.trangThai === 'DANG_SUA') badgeTrangThai = '<span class="badge bg-warning text-dark">Đang sửa</span>';
        else badgeTrangThai = '<span class="badge bg-success">Đã xong</span>';
        const badgeMienPhi = sc.mienPhi ? '<span class="badge bg-info text-dark">Miễn phí</span>' : '<span class="badge bg-secondary">Tính phí</span>';
        
        const viTriHienThi = sc.viTri || (sc.phongTro ? sc.phongTro.soPhong : 'Khu vực chung');
        const chiNhanhHienThi = sc.chiNhanh || (sc.phongTro ? sc.phongTro.diaChi : '---');
        
        tr.innerHTML = `
            <td class="text-center fw-bold">${stt}</td>
            <td class="fw-bold">${chiNhanhHienThi}</td>
            <td class="fw-bold text-primary">${viTriHienThi}</td>
            <td>${ngayBaoStr}</td>
            <td>${sc.tenSuCo}</td>
            <td>${sc.moTa || '<span class="text-muted fst-italic">Không có</span>'}</td>
            <td>${sc.chiPhiTong ? sc.chiPhiTong.toLocaleString() + ' đ' : '0 đ'}</td>
            <td class="fw-bold text-danger">${sc.chiPhiNguoiThue ? sc.chiPhiNguoiThue.toLocaleString() + ' đ' : '0 đ'}</td>
            <td>${badgeTrangThai}<br>${badgeMienPhi}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick='openSuCoModal(${JSON.stringify(sc)})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteSuCo(${sc.id})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
        stt++; 
    });
    if (stt === 1) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-muted py-3">Không có sự cố nào phù hợp với bộ lọc hiện tại.</td></tr>';
    }
}

function toggleViTriKhac() {
    const select = document.getElementById('scPhongSelect');
    const inputKhac = document.getElementById('scViTriKhac');
    if (select.value === 'KHU_VUC_CHUNG') {
        inputKhac.classList.remove('d-none');
        inputKhac.required = true;
    } else {
        inputKhac.classList.add('d-none');
        inputKhac.required = false;
        inputKhac.value = '';
    }
}

// KHI CHỦ TRỌ ĐỔI CHI NHÁNH TRONG MODAL
function onChiNhanhChange() {
    const selectedBranch = document.getElementById('scChiNhanh').value;
    renderPhongSelect(selectedBranch); 
}

// HÀM LỌC V VẼ LẠI DANH SÁCH PHÒNG THEO CHI NHÁNH ĐÃ CHỌN
function renderPhongSelect(branchId, selectedPhongId = null, viTriText = '') {
    const selectPhong = document.getElementById('scPhongSelect');
    if (!selectPhong) return;
    
    selectPhong.innerHTML = '<option value="">-- Chọn phòng --</option>';
    
    // ĐÃ SỬA: Thuật toán lọc "Bao lô" - Dù HTML truyền ID hay Tên chi nhánh vào thì vẫn lọc chính xác 100%
    const filteredRooms = (branchId && branchId !== "")
        ? danhSachPhongGlobal.filter(p => {
            if (!p.khuVuc) return false;
            return String(p.khuVuc.id) === String(branchId) || 
                   p.khuVuc.tenKhuVuc === branchId || 
                   p.khuVuc.diaChi === branchId;
        })
        : danhSachPhongGlobal; 
        
    filteredRooms.forEach(p => {
        selectPhong.innerHTML += `<option value="${p.id}" ${p.id == selectedPhongId ? 'selected' : ''}>Phòng ${p.soPhong}</option>`;
    });
    
    const isKhuVucChung = viTriText && !selectedPhongId;
    selectPhong.innerHTML += `<option value="KHU_VUC_CHUNG" ${isKhuVucChung ? 'selected' : ''}>-- Khu vực chung / Vị trí khác --</option>`;
    
    toggleViTriKhac();
    if (isKhuVucChung) {
        document.getElementById('scViTriKhac').value = viTriText;
    }
}

// HÀM TẢI DỮ LIỆU TỪ BACKEND KHI VỪA MỞ MODAL
function loadPhongChoSuCo(selectedPhongId = null, viTriText = '', selectedChiNhanh = '') {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    
    const selectChiNhanh = document.getElementById('scChiNhanh');
    const globalKhuVuc = document.getElementById('globalKhuVucFilter');
    
    if (globalKhuVuc && selectChiNhanh) {
        selectChiNhanh.innerHTML = '';
        Array.from(globalKhuVuc.options).forEach(opt => {
            const newOpt = document.createElement('option');
            newOpt.value = opt.value;
            newOpt.text = opt.value === "" ? "-- Chọn chi nhánh --" : opt.text;
            selectChiNhanh.appendChild(newOpt);
        });
        // Gán chi nhánh mặc định khi mở Modal
        selectChiNhanh.value = selectedChiNhanh || globalKhuVuc.value || "";
    }
    
    fetch(`/api/phong-tro/chu-tro/${chuTroId}`)
        .then(res => res.json())
        .then(data => {
            danhSachPhongGlobal = data;
            // ĐẦU VÀO LUÔN LÀ ID CỦA CHI NHÁNH ĐANG ĐƯỢC CHỌN
            renderPhongSelect(selectChiNhanh.value, selectedPhongId, viTriText);
        })
        .catch(err => console.error("Lỗi lấy danh sách phòng sự cố:", err));
}

function openSuCoModal(sc = null) {
    const form = document.getElementById('suCoForm');
    form.reset();
    
    if (sc) {
        document.getElementById('suCoId').value = sc.id;
        document.getElementById('scTenSuCo').value = sc.tenSuCo;
        document.getElementById('scMoTa').value = sc.moTa || '';
        document.getElementById('scTrangThai').value = sc.trangThai;
        document.getElementById('scChiPhiTong').value = sc.chiPhiTong || '';
        document.getElementById('scMienPhi').checked = sc.mienPhi || false;
        
        const phongId = sc.phongTro ? sc.phongTro.id : null;
        const branch = (sc.phongTro && sc.phongTro.khuVuc) ? sc.phongTro.khuVuc.id : '';
        
        loadPhongChoSuCo(phongId, sc.viTri, branch);
    } else {
        document.getElementById('suCoId').value = '';
        document.getElementById('scTrangThai').value = 'DANG_CHO';
        document.getElementById('scMienPhi').checked = false;
        
        const currentBranch = document.getElementById('globalKhuVucFilter');
        const defaultBranch = (currentBranch && currentBranch.value) ? currentBranch.value : '';
        
        loadPhongChoSuCo(null, '', defaultBranch);
    }
    suCoModal.show();
}

function saveSuCo() {
    const id = document.getElementById('suCoId').value;
    const chuTroId = localStorage.getItem('chuTroId');
    
    const selectValue = document.getElementById('scPhongSelect').value;
    let phongId = null;
    let viTri = '';
    
    if (selectValue === 'KHU_VUC_CHUNG') {
        viTri = document.getElementById('scViTriKhac').value;
    } else if (selectValue !== '') {
        phongId = selectValue;
        const p = danhSachPhongGlobal.find(x => x.id == phongId);
        if (p) viTri = p.soPhong;
    }
    
    const scChiNhanhEl = document.getElementById('scChiNhanh');
    const chiNhanhText = scChiNhanhEl.options[scChiNhanhEl.selectedIndex]?.text || '';
    
    const data = {
        chiNhanh: chiNhanhText.includes('--') ? '' : chiNhanhText,
        viTri: viTri,
        tenSuCo: document.getElementById('scTenSuCo').value,
        moTa: document.getElementById('scMoTa').value,
        trangThai: document.getElementById('scTrangThai').value,
        chiPhiTong: document.getElementById('scChiPhiTong').value || 0,
        mienPhi: document.getElementById('scMienPhi').checked,
        phongTro: phongId ? { id: parseInt(phongId) } : null,
        chuTro: { id: parseInt(chuTroId) } 
    };
    
    fetch(id ? `${API_URL_SUCO}/${id}` : API_URL_SUCO, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => {
        if(res.ok) {
            suCoModal.hide();
            fetchSuCo(); 
        } else alert("Lỗi khi lưu sự cố!");
    });
}

function deleteSuCo(id) {
    if(confirm('Bạn có chắc muốn xóa bản ghi này?')) {
        fetch(`${API_URL_SUCO}/${id}`, { method: 'DELETE' }).then(() => fetchSuCo());
    }
}

function handlePhongChange() {
    toggleViTriKhac();
    
    const select = document.getElementById('scPhongSelect');
    const checkboxMienPhi = document.getElementById('scMienPhi');
    
    if (select.value === 'KHU_VUC_CHUNG') {
        checkboxMienPhi.checked = true;
    } else if (select.value !== '') {
        checkboxMienPhi.checked = false;
    }
}