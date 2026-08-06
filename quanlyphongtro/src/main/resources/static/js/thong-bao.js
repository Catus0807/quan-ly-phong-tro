const API_THONG_BAO = 'http://localhost:8080/api/thong-bao';

// NHẬN DIỆN TAB ĐỘC LẬP
const isChuTro = document.getElementById('globalKhuVucFilter') !== null;
const TAB_ROLE = isChuTro ? 'ADMIN' : 'USER';
const TAB_LOAI_NGUOI_NHAN = isChuTro ? 'CHU_TRO' : 'KHACH_THUE';
const TAB_USER_ID = isChuTro ? localStorage.getItem('chuTroId') : localStorage.getItem('khachId');

document.addEventListener('DOMContentLoaded', () => {
    if (!TAB_USER_ID) return;
    loadThongBaoGop();
    setInterval(loadThongBaoGop, 60000);
});

//  GỘP VÀ LỌC THÔNG BÁO 
function loadThongBaoGop() {
    if (!TAB_USER_ID) return;
    
    const danhSachDaDocAo = JSON.parse(localStorage.getItem('thongBaoAoDaDoc') || '[]');
    const danhSachDaXoaAo = JSON.parse(localStorage.getItem('thongBaoAoDaXoa') || '[]');
    const thoiDiemXoaTatCaAo = parseInt(localStorage.getItem('thongBaoAoClearTime') || '0');
    
    const p1 = fetch(`${API_THONG_BAO}/${TAB_LOAI_NGUOI_NHAN}/${TAB_USER_ID}`).then(res => res.ok ? res.json() : []);
    const p2 = isChuTro
        ? fetch(`http://localhost:8080/api/nguoi-thue/chu-tro/${TAB_USER_ID}`).then(res => res.ok ? res.json() : [])
        : fetch(`http://localhost:8080/api/nguoi-thue/${TAB_USER_ID}`).then(res => res.ok ? res.json() : []).then(data => data ? [data] : []);

    Promise.all([p1, p2]).then(([dbThongBao, danhSachKhach]) => {
        let thongBaoGop = dbThongBao.filter(tb => tb.loaiThongBao !== 'HOP_DONG_SAP_HET_HAN');
        
        const homNay = new Date();
        homNay.setHours(0, 0, 0, 0);

        if (Array.isArray(danhSachKhach)) {
            danhSachKhach.forEach(k => {
                if (k && k.ngayKetThuc) {
                    let aoId = '';
                    let tDe = '';
                    let nDung = '';
                    let loaiTB = 'HOP_DONG_SAP_HET_HAN';
                    let dTao = null;
                    
                    // ĐÃ THÊM: Lấy tên chi nhánh của phòng trọ
                    const chiNhanh = (k.phongTro && k.phongTro.diaChi) ? k.phongTro.diaChi : 'Chưa xếp phòng';
                    
                    if (k.trangThaiGiaHan === 'KHONG_GIA_HAN' && !isChuTro) {
                        aoId = 'ao_kgh_' + k.id;
                        tDe = 'Xác nhận trả phòng';
                        nDung = `Bạn đã báo KHÔNG gia hạn. Hợp đồng kết thúc vào ${k.ngayKetThuc.split('-').reverse().join('/')}.`;
                        loaiTB = 'KHONG_GIA_HAN';
                        dTao = new Date(homNay);
                    } else if (k.trangThaiGiaHan !== 'KHONG_GIA_HAN') {
                        const ngayKT = new Date(k.ngayKetThuc);
                        ngayKT.setHours(0, 0, 0, 0);
                        const soNgay = Math.ceil((ngayKT - homNay) / (1000 * 60 * 60 * 24));
                        
                        if (soNgay < -15) return; 
                        
                        dTao = new Date(ngayKT);
                        // Nhắc nhở 3 lần (ĐÃ GẮN THÊM TÊN CHI NHÁNH VÀO TIÊU ĐỀ CHO CHỦ TRỌ)
                        if (soNgay <= 30 && soNgay > 15) {
                            aoId = 'ao_han_30_' + k.id;
                            tDe = isChuTro ? `Lần 1: Sắp hết hạn HĐ (${chiNhanh})` : 'Lần 1: Hợp đồng sắp hết hạn';
                            nDung = isChuTro ? `Hợp đồng P.${k.phongTro ? k.phongTro.soPhong : ''} tại ${chiNhanh} sẽ hết hạn sau ${soNgay} ngày. Hai bên cần thảo luận phương án.` 
                                            : `Hợp đồng của bạn sẽ hết hạn sau ${soNgay} ngày. Hãy bắt đầu suy nghĩ và thảo luận phương án.`;
                            dTao.setDate(ngayKT.getDate() - 30);
                        } else if (soNgay <= 15 && soNgay > 7) {
                            aoId = 'ao_han_15_' + k.id;
                            tDe = isChuTro ? `Lần 2: Sắp hết hạn HĐ (${chiNhanh})` : 'Lần 2: Nhắc nhở hợp đồng sắp hết';
                            nDung = isChuTro ? `Hợp đồng P.${k.phongTro ? k.phongTro.soPhong : ''} tại ${chiNhanh} chỉ còn ${soNgay} ngày. Nhắc lại nếu chưa nhận được phản hồi.` 
                                            : `Nhắc lại: Hợp đồng của bạn còn ${soNgay} ngày. Vui lòng phản hồi sớm nếu chưa có quyết định.`;
                            dTao.setDate(ngayKT.getDate() - 15);
                        } else if (soNgay <= 7 && soNgay >= 0) {
                            aoId = 'ao_han_7_' + k.id;
                            tDe = isChuTro ? `Lần 3: Chốt phương án HĐ (${chiNhanh})` : 'Lần 3: Chốt phương án hợp đồng';
                            nDung = isChuTro ? `GẤP: Hợp đồng P.${k.phongTro ? k.phongTro.soPhong : ''} tại ${chiNhanh} còn ${soNgay} ngày. Cần chốt phương án gia hạn hoặc bàn giao!` 
                                            : `GẤP: Hợp đồng còn ${soNgay} ngày. Bạn cần chốt phương án (gia hạn/trả phòng) ngay lập tức!`;
                            dTao.setDate(ngayKT.getDate() - 7);
                        } else if (soNgay < 0) {
                            aoId = 'ao_het_' + k.id;
                            tDe = isChuTro ? `Hợp đồng ĐÃ HẾT HẠN (${chiNhanh})` : 'Hợp đồng ĐÃ HẾT HẠN';
                            nDung = isChuTro ? `Hợp đồng P.${k.phongTro ? k.phongTro.soPhong : ''} tại ${chiNhanh} ĐÃ QUÁ HẠN!` 
                                            : `Hợp đồng thuê phòng của bạn ĐÃ HẾT HẠN! Vui lòng liên hệ chủ trọ ngay.`;
                            dTao = new Date(homNay); 
                        }
                    }

                    if (aoId && dTao) {
                        dTao.setHours(8, 0, 0, 0);
                        
                        // Bỏ qua nếu người dùng đã ấn Xóa thông báo này hoặc Xóa Tất Cả
                        if (danhSachDaXoaAo.includes(aoId)) return;
                        if (dTao.getTime() <= thoiDiemXoaTatCaAo) return;

                        thongBaoGop.push({
                            id: aoId,
                            tieuDe: tDe,
                            noiDung: nDung,
                            loaiThongBao: loaiTB,
                            daDoc: danhSachDaDocAo.includes(aoId) || loaiTB === 'KHONG_GIA_HAN',
                            ngayTao: dTao.toISOString(),
                            thamChieuId: k.id
                        });
                    }
                }
            });
        }
        thongBaoGop.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
        renderThongBao(thongBaoGop);
    }).catch(err => console.error("Lỗi tải thông báo:", err));
}

//  VẼ GIAO DIỆN (UI) THÔNG BÁO
function renderThongBao(data) {
    const listEl = document.getElementById('listThongBao');
    const badge = document.getElementById('badgeThongBao');
    if (!listEl) return;
    
    listEl.innerHTML = `
        <li>
            <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light shadow-sm">
                <span class="fw-bold text-primary"><i class="bi bi-bell"></i> Thông báo</span>
                <button class="btn btn-sm btn-outline-danger py-0 px-2 fw-bold" onclick="xoaTatCaThongBao(event)"><i class="bi bi-trash"></i> Xóa tất cả</button>
            </div>
        </li>
    `;
    if (data.length === 0) {
        listEl.innerHTML += '<li><span class="dropdown-item text-center text-muted py-4">Không có thông báo nào</span></li>';
        if (badge) badge.classList.add('d-none');
        return;
    }
    
    let soUnread = 0;
    data.forEach(tb => {
        const isUnread = !tb.daDoc;
        if (isUnread) soUnread++;
        const bgClass = isUnread ? 'bg-light fw-bold' : '';
        const timeStr = new Date(tb.ngayTao).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
        
        let icon = 'bi-info-circle text-primary';
        if (tb.loaiThongBao === 'HOA_DON') icon = 'bi-receipt text-warning';
        if (tb.loaiThongBao === 'SU_CO') icon = 'bi-tools text-danger';
        if (tb.loaiThongBao === 'HOP_DONG' || tb.loaiThongBao === 'HOP_DONG_SAP_HET_HAN' || tb.loaiThongBao === 'YEU_CAU_GIA_HAN') icon = 'bi-file-earmark-text text-success';
        if (tb.loaiThongBao === 'TAM_TRU') icon = 'bi-house-check text-info';
        if (tb.loaiThongBao === 'KHONG_GIA_HAN') icon = 'bi-box-arrow-right text-dark'; 
        
        const thamChieuIdStr = tb.thamChieuId ? tb.thamChieuId : 'null';
        const idParam = typeof tb.id === 'string' ? `'${tb.id}'` : tb.id;
        
        const li = document.createElement('li');
        li.className = "position-relative"; 
        li.innerHTML = `
            <a class="dropdown-item text-wrap border-bottom pe-5 ${bgClass}" href="#" onclick="xuLyClickThongBao(${idParam}, this, '${tb.loaiThongBao}', ${thamChieuIdStr})">
                <div class="d-flex align-items-start gap-2 py-1">
                    <i class="bi ${icon} fs-4 mt-1"></i>
                    <div>
                        <h6 class="mb-1 ${isUnread ? 'text-dark' : 'text-muted'} fw-bold" style="font-size: 1.05rem;">${tb.tieuDe}</h6>
                        <p class="mb-1 text-muted" style="font-size: 0.95rem; white-space: normal; line-height: 1.4;">${tb.noiDung}</p>
                        <small class="text-secondary fw-semibold" style="font-size: 0.85rem;">${timeStr}</small>
                    </div>
                </div>
            </a>
            <button class="btn btn-sm text-danger position-absolute top-50 end-0 translate-middle-y me-2" 
                    style="z-index: 10;" title="Xóa thông báo này" 
                    onclick="xoaMotThongBao(event, ${idParam})">
                <i class="bi bi-x-circle-fill fs-5 opacity-75 hover-opacity-100"></i>
            </button>
        `;
        listEl.appendChild(li);
    });
    
    if (badge) {
        if (soUnread > 0) {
            badge.innerText = soUnread > 99 ? '99+' : soUnread;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    }
}

// CÁC HÀM XÓA THÔNG BÁO 
function xoaMotThongBao(event, id) {
    event.stopPropagation(); 
    if (typeof id === 'string' && id.startsWith('ao_')) {
        const danhSachDaXoaAo = JSON.parse(localStorage.getItem('thongBaoAoDaXoa') || '[]');
        if (!danhSachDaXoaAo.includes(id)) {
            danhSachDaXoaAo.push(id);
            localStorage.setItem('thongBaoAoDaXoa', JSON.stringify(danhSachDaXoaAo));
        }
        loadThongBaoGop();
    } else {
        fetch(`${API_THONG_BAO}/${id}`, { method: 'DELETE' })
            .then(() => loadThongBaoGop())
            .catch(err => console.error("Lỗi xóa thông báo:", err));
    }
}

function xoaTatCaThongBao(event) {
    event.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn dọn dẹp TẤT CẢ thông báo không?")) return;
    
    localStorage.setItem('thongBaoAoClearTime', new Date().getTime());
    fetch(`${API_THONG_BAO}/${TAB_LOAI_NGUOI_NHAN}/${TAB_USER_ID}/xoa-tat-ca`, { method: 'DELETE' })
        .then(() => loadThongBaoGop())
        .catch(err => console.error(err));
}

//  XỬ LÝ CLICK ĐỌC THÔNG BÁO VÀ ĐIỀU HƯỚNG
function xuLyClickThongBao(id, el, loaiThongBao, thamChieuId) {
    const isUnread = el.classList.contains('bg-light');
    if (isUnread) {
        el.classList.remove('bg-light', 'fw-bold');
        const h6 = el.querySelector('h6');
        if (h6) h6.classList.replace('text-dark', 'text-muted');
        const badge = document.getElementById('badgeThongBao');
        if (badge) {
            let currentCount = parseInt(badge.innerText);
            if (!isNaN(currentCount) && currentCount > 0) {
                currentCount--;
                if (currentCount === 0) badge.classList.add('d-none');
                else badge.innerText = currentCount;
            }
        }
        if (typeof id === 'number') {
            fetch(`${API_THONG_BAO}/${id}/da-doc`, { method: 'PUT' }).catch(err => console.error(err));
        } else if (typeof id === 'string' && id.startsWith('ao_')) {
            const danhSachDaDocAo = JSON.parse(localStorage.getItem('thongBaoAoDaDoc') || '[]');
            if (!danhSachDaDocAo.includes(id)) {
                danhSachDaDocAo.push(id);
                localStorage.setItem('thongBaoAoDaDoc', JSON.stringify(danhSachDaDocAo));
            }
        }
    }
    
    /// Điều hướng Tab
    if (TAB_ROLE === 'ADMIN') {
        if (loaiThongBao === 'SU_CO') switchTab('su-co');
        else if (loaiThongBao === 'TAM_TRU') switchTab('tam-tru');
        else if (loaiThongBao === 'HOP_DONG' || loaiThongBao === 'KHONG_GIA_HAN' || loaiThongBao === 'YEU_CAU_GIA_HAN') {
            switchTab('khach-thue');
            if (thamChieuId !== null) {
                setTimeout(() => { moModalPhanHoi(thamChieuId); }, 800); 
            }
        }
        // Xử lý click cho thông báo người ở ghép
        else if (loaiThongBao === 'NGUOI_GHEP') {
            switchTab('khach-thue');
            if (thamChieuId !== null) {
                // Đợi 0.8s cho tab Khách thuê load xong rồi mở thông tin
                setTimeout(() => {
                    if (typeof moChiTietNguoiGhepTuThongBao === 'function') {
                        moChiTietNguoiGhepTuThongBao(thamChieuId);
                    }
                }, 800);
            }
        }
    } else if (TAB_ROLE === 'USER') {
        if (loaiThongBao === 'HOA_DON') switchTab('hoa-don');
        else if (loaiThongBao === 'SU_CO') switchTab('su-co');
        else if (loaiThongBao === 'TAM_TRU') switchTab('tam-tru');
        else if (loaiThongBao === 'HOP_DONG' || loaiThongBao === 'KHONG_GIA_HAN') switchTab('hop-dong');
        else if (loaiThongBao === 'HOP_DONG_SAP_HET_HAN') {
            switchTab('hop-dong');
            setTimeout(() => {
                const modalEl = document.getElementById('modalYeuCauGiaHanUser');
                if (modalEl) new bootstrap.Modal(modalEl).show();
            }, 500);
        }
    }
}