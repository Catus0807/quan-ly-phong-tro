//TẢI VÀ HIỂN THỊ HỢP ĐỒNG
function loadHopDong() {
    const idNguoiThue = localStorage.getItem('khachId'); 
    fetch(`/api/nguoi-thue/${idNguoiThue}`)
    .then(res => {
        if (!res.ok) throw new Error("Không thể kết nối API Backend");
        return res.json();
    })
    .then(khach => {
        const container = document.getElementById('noidungHopDong');
        
        if (khach.noiDungHopDong && khach.noiDungHopDong.trim() !== "") {
            container.innerHTML = khach.noiDungHopDong;
        } else {
            container.innerHTML = `
                <div class="alert alert-warning text-center mt-4">
                    <i class="bi bi-exclamation-triangle-fill fs-4 d-block mb-2"></i>
                    Hợp đồng của bạn chưa được số hóa trên hệ thống.<br>Vui lòng liên hệ Chủ trọ để cập nhật!
                </div>`;
        }
    })
    .catch(err => {
        console.error("Lỗi tải hợp đồng:", err);
        document.getElementById('noidungHopDong').innerHTML = `
            <div class="alert alert-danger text-center mt-4">
                <i class="bi bi-x-circle-fill fs-4 d-block mb-2"></i>
                Có lỗi xảy ra khi tải dữ liệu hợp đồng. Vui lòng thử lại sau!
            </div>`;
    });
}

function taiHopDongPDF(elementId, tenFile) {
    const element = document.getElementById(elementId);
    if (!element || element.innerHTML.trim() === '' || element.innerHTML.includes('alert-warning') || element.innerHTML.includes('alert-danger')) {
        alert("Không có nội dung hợp đồng hợp lệ để tải!");
        return;
    }
    const tenKhach = localStorage.getItem('tenKhach') || '';
    const finalFileName = tenKhach ? `Hop_Dong_${tenKhach}.pdf` : (tenFile || 'Hop_Dong_Thue_Phong.pdf');
    
    const opt = {
        margin:       0.5,
        filename:     finalFileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// WIDGET QUẢN LÝ NGÀY THÁNG HỢP ĐỒNG & NÚT BẤM
function loadWidgetHopDong() {
    const khachId = localStorage.getItem('khachId');
    if (!khachId) return;

    fetch(`/api/nguoi-thue/${khachId}`)
        .then(res => res.json())
        .then(khach => {
            if(khach.ngayBatDau) document.getElementById('txtNgayBatDau').innerText = khach.ngayBatDau.split('-').reverse().join('/');
            if(khach.ngayKetThuc) {
                document.getElementById('txtNgayKetThuc').innerText = khach.ngayKetThuc.split('-').reverse().join('/');
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const ngayKT = new Date(khach.ngayKetThuc);
                ngayKT.setHours(0, 0, 0, 0); 

                const soNgay = Math.round((ngayKT.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                const badge = document.getElementById('badgeTrangThaiHopDong');
                const canhBao = document.getElementById('canhBaoHetHan');
                const btnGiaHan = document.getElementById('btnGiaHan');
                const btnBaoTra = document.getElementById('btnBaoTraPhong');
                const btnHuyTra = document.getElementById('btnHuyTraPhong');

                // NẾU KHÁCH ĐÃ BÁO TRẢ PHÒNG -> Đổi giao diện, hiện nút Hủy
                if (khach.trangThaiGiaHan === 'KHONG_GIA_HAN') {
                    badge.className = 'badge bg-dark'; badge.innerText = 'Đã báo trả phòng';
                    canhBao.classList.remove('d-none');
                    canhBao.innerHTML = ` Bạn đã thông báo trả phòng. Chờ chủ trọ xác nhận.`;
                    canhBao.className = 'alert alert-secondary py-2 mb-3';
                    
                    if (btnGiaHan) btnGiaHan.classList.add('d-none');
                    if (btnBaoTra) btnBaoTra.classList.add('d-none');
                    if (btnHuyTra) btnHuyTra.classList.remove('d-none');
                } 
                // BỔ SUNG: NẾU KHÁCH XIN HỦY TRẢ PHÒNG -> HIỆN ĐANG CHỜ DUYỆT
                else if (khach.trangThaiGiaHan === 'HUY_TRA_PHONG') {
                    badge.className = 'badge bg-warning text-dark'; badge.innerText = 'Đang chờ duyệt Hủy';
                    canhBao.classList.remove('d-none');
                    canhBao.innerHTML = ` Bạn đã gửi yêu cầu xin HỦY TRẢ PHÒNG. Đang chờ chủ trọ duyệt.`;
                    canhBao.className = 'alert alert-warning py-2 mb-3';
                    
                    // Khóa toàn bộ nút bấm trong lúc chờ
                    if (btnGiaHan) btnGiaHan.classList.add('d-none');
                    if (btnBaoTra) btnBaoTra.classList.add('d-none');
                    if (btnHuyTra) btnHuyTra.classList.add('d-none');
                } 
                else {
                    // TRẠNG THÁI BÌNH THƯỜNG -> Reset giao diện
                    if (btnGiaHan) btnGiaHan.classList.remove('d-none');
                    if (btnBaoTra) btnBaoTra.classList.remove('d-none');
                    if (btnHuyTra) btnHuyTra.classList.add('d-none');

                    if (soNgay < 0) {
                        badge.className = 'badge bg-dark'; badge.innerText = 'Đã hết hạn';
                        canhBao.classList.remove('d-none');
                        canhBao.innerHTML = ` Hợp đồng ĐÃ HẾT HẠN!`;
                        canhBao.className = 'alert alert-danger py-2 mb-3';
                    } else if (soNgay <= 30) {
                        badge.className = 'badge bg-danger'; badge.innerText = `Còn ${soNgay} ngày`;
                        canhBao.classList.remove('d-none');
                        canhBao.innerHTML = ` Hợp đồng của bạn sắp hết hạn!`;
                        canhBao.className = 'alert alert-warning py-2 mb-3';
                    } else {
                        badge.className = 'badge bg-success'; badge.innerText = 'Đang hiệu lực';
                        canhBao.classList.add('d-none');
                    }
                }
            }
        }).catch(err => console.error(err));
}

// TÍNH TOÁN VÀ GỬI BÁO CÁO TRẢ PHÒNG 
function tinhToanTienCocTraPhong() {
    const ngayChuyenInput = document.getElementById('ngayChuyenDi').value;
    const resEl = document.getElementById('ketQuaCocTraPhong');
    
    if (!ngayChuyenInput) {
        resEl.classList.add('d-none');
        return;
    }

    const ngayChuyen = new Date(ngayChuyenInput);
    ngayChuyen.setHours(0,0,0,0);
    const homNay = new Date();
    homNay.setHours(0,0,0,0);

    const soNgayBaoTruoc = Math.ceil((ngayChuyen - homNay) / (1000 * 60 * 60 * 24));

    resEl.classList.remove('d-none', 'alert-success', 'alert-warning', 'alert-danger');

    if (soNgayBaoTruoc < 0) {
        resEl.innerHTML = "❌ Ngày chuyển đi không hợp lệ (thuộc về quá khứ)!";
        resEl.classList.add('alert-danger');
    } else if (soNgayBaoTruoc >= 30) {
        resEl.innerHTML = `✅ Báo trước ${soNgayBaoTruoc} ngày (Đạt chuẩn).<br>Bạn sẽ được <b>hoàn 100% tiền cọc</b>.`;
        resEl.classList.add('alert-success');
    } else {
        resEl.innerHTML = `⚠️ Báo trước ${soNgayBaoTruoc} ngày (Báo gấp dưới 30 ngày).<br>Bạn sẽ bị <b>trừ 20% tiền cọc</b> theo quy định.`;
        resEl.classList.add('alert-warning');
    }
}

function xacNhanTraPhong() {
    const ngayChuyenInput = document.getElementById('ngayChuyenDi').value;
    if (!ngayChuyenInput) return alert("Vui lòng chọn ngày chuyển đi!");

    const ngayChuyen = new Date(ngayChuyenInput);
    const homNay = new Date();
    if (ngayChuyen.setHours(0,0,0,0) < homNay.setHours(0,0,0,0)) {
        return alert("Ngày chuyển không hợp lệ!");
    }

    const khachId = localStorage.getItem('khachId');
    
    fetch(`/api/nguoi-thue/${khachId}/bao-tra-phong?ngayChuyen=${ngayChuyenInput}`, {
        method: 'POST'
    })
    .then(async res => {
        if (res.ok) {
            alert("Đã gửi thông báo chuyển trọ thành công đến Chủ trọ!");
            bootstrap.Modal.getInstance(document.getElementById('modalBaoTraPhong')).hide();
            loadWidgetHopDong(); 
        } else {
            alert("Lỗi: " + await res.text());
        }
    }).catch(err => console.error(err));
}

//  HỦY YÊU CẦU BÁO TRẢ PHÒNG
function huyBaoTraPhong() {
    if (!confirm("Bạn muốn hủy thông báo chuyển trọ và tiếp tục ở lại?")) return;
    
    const khachId = localStorage.getItem('khachId');
    fetch(`/api/nguoi-thue/${khachId}/huy-bao-tra-phong`, { method: 'POST' })
    .then(async res => {
        if (res.ok) {
            alert("Đã hủy yêu cầu chuyển trọ thành công!");
            loadWidgetHopDong(); // Tải lại widget để giao diện tự cập nhật lại các nút bấm
        } else {
            alert("Lỗi: " + await res.text());
        }
    }).catch(err => console.error(err));
}

// ==========================================
// KHÁCH GỬI XÁC NHẬN GIA HẠN / TRẢ PHÒNG
// ==========================================
function guiPhanHoiGiaHan(isGiaHan) {
    const khachId = localStorage.getItem('khachId');
    let soThang = 0;
    
    // Nếu chọn Gia hạn thì lấy số tháng
    if (isGiaHan) {
        soThang = document.getElementById('soThangGiaHanInput').value;
        if (!soThang || isNaN(soThang) || parseInt(soThang) <= 0) {
            alert("Vui lòng chọn số tháng hợp lệ!");
            return;
        }
    } else {
        // Nếu chọn Không gia hạn thì hỏi lại cho chắc
        if (!confirm("Bạn có chắc chắn KHÔNG GIA HẠN và sẽ dọn đi khi hết hạn hợp đồng? Hệ thống sẽ báo cho Chủ trọ biết quyết định này.")) {
            return;
        }
    }
    
    // Gọi API gửi yêu cầu
    fetch(`/api/nguoi-thue/${khachId}/gui-yeu-cau-gia-han?isGiaHan=${isGiaHan}&soThang=${soThang}`, {
        method: 'POST'
    })
    .then(async res => {
        if (res.ok) {
            alert(isGiaHan ? "Đã gửi yêu cầu gia hạn đến Chủ trọ!" : "Đã thông báo KHÔNG GIA HẠN đến Chủ trọ!");
            
            // Ẩn modal sau khi thành công
            const modalEl = document.getElementById('modalYeuCauGiaHanUser');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            // Cập nhật lại giao diện ngay lập tức
            if (typeof loadThongBaoGop === 'function') loadThongBaoGop(); 
            if (typeof loadWidgetHopDong === 'function') loadWidgetHopDong(); 
        } else {
            alert("Có lỗi xảy ra: " + await res.text());
        }
    }).catch(err => console.error("Lỗi:", err));
}

// Khởi chạy đồng thời cả hợp đồng và widget khi trang tải xong
document.addEventListener("DOMContentLoaded", function() {
    loadHopDong();
    loadWidgetHopDong();
});