function loadLichSuSuCo() {
    const khachId = localStorage.getItem('khachId');
    if (!khachId) return;

    fetch(`/api/su-co/khach/${khachId}`)
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById('bangLichSuSuCo');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Phòng của bạn chưa có phản ánh nào.</td></tr>`;
            return;
        }

        data.forEach(sc => {
            let ngayBao = "?";
            if(sc.ngayBao) {
                if(Array.isArray(sc.ngayBao)) {
                    ngayBao = `${sc.ngayBao[2].toString().padStart(2,'0')}/${sc.ngayBao[1].toString().padStart(2,'0')}/${sc.ngayBao[0]}`;
                } else {
                    const d = new Date(sc.ngayBao);
                    ngayBao = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
                }
            }

            let badge = '';
            const trangThai = String(sc.trangThai || '').toLowerCase();
            if (trangThai.includes('chờ') || trangThai.includes('cho')) badge = '<span class="badge bg-danger">Chờ xử lý</span>';
            else if (trangThai.includes('đang') || trangThai.includes('dang')) badge = '<span class="badge bg-warning text-dark">Đang sửa</span>';
            else badge = '<span class="badge bg-success">Đã xong</span>';

            // Logic xử lý hiển thị tiền cho khách
            let textChiPhi = '<span class="text-muted fst-italic">Đang chờ thợ báo giá</span>';
            if (sc.mienPhi) {
                textChiPhi = '<span class="text-success fw-bold">0 đ (Miễn phí)</span>';
            } else if (sc.chiPhiNguoiThue !== null && sc.chiPhiNguoiThue !== undefined && sc.chiPhiTong > 0) {
                textChiPhi = `<span class="text-danger fw-bold">${sc.chiPhiNguoiThue.toLocaleString()} đ</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${ngayBao}</td>
                    <td class="fw-bold text-primary">${sc.tenSuCo}</td>
                    <td class="text-start">${sc.moTa || '<span class="text-muted fst-italic">Không có</span>'}</td>
                    <td>${textChiPhi}</td>
                    <td>${badge}</td>
                </tr>
            `;
        });
    }).catch(err => console.error("Lỗi:", err));
}

document.getElementById('formSuCo').addEventListener('submit', function(e) {
    e.preventDefault();
    const khachId = localStorage.getItem('khachId');

    const data = {
        tenSuCo: document.getElementById('tieuDeSuCo').value, 
        moTa: document.getElementById('moTaSuCo').value      
    };

    fetch(`/api/su-co/khach/${khachId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (res.ok) {
            alert("Gửi phản ánh thành công! Chủ trọ sẽ sớm xử lý.");
            document.getElementById('formSuCo').reset(); 
            loadLichSuSuCo(); 
        } else {
            alert("Có lỗi xảy ra. Khách thuê này có thể chưa được xếp phòng!");
        }
    }).catch(err => console.error("Lỗi:", err));
});

document.addEventListener("DOMContentLoaded", loadLichSuSuCo);