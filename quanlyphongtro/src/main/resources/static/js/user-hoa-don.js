// Tải và hiển thị lịch sử hóa đơn của người thuê
function loadHoaDon() {
    const idNguoiThue = localStorage.getItem('khachId');
    if (!idNguoiThue) return;

    fetch(`/api/hoa-don/khach/${idNguoiThue}`)
    .then(res => {
        if (!res.ok) throw new Error("Lỗi kết nối máy chủ");
        return res.json();
    })
    .then(data => {
        const tbody = document.getElementById('bangHoaDonKhach');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Bạn chưa có hóa đơn nào</td></tr>`;
            return;
        }

        const rowsHtml = data.map(hd => {
            const formatTien = (tien) => (tien || 0).toLocaleString('vi-VN') + ' đ';
            
            let thangNam = hd.thangThu || "?/?";
            if (!hd.thangThu && hd.ngayLap) {
                if (Array.isArray(hd.ngayLap)) {
                    thangNam = `${hd.ngayLap[1].toString().padStart(2, '0')}/${hd.ngayLap[0]}`;
                } else {
                    const dateObj = new Date(hd.ngayLap);
                    thangNam = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
                }
            }

            const soKýDien = Math.max(0, (hd.soDienMoi || 0) - (hd.soDienCu || 0));
            const giaDien = hd.giaDien || 3500;
            const hienThiDien = `
                <div class="td-dien-nuoc">
                    <strong>${soKýDien} ký</strong><br>
                    <span class="gia-dien">${giaDien.toLocaleString('vi-VN')} đ/ký</span><br>
                    <span class="chi-so">(${hd.soDienCu || 0} &rarr; ${hd.soDienMoi || 0})</span>
                </div>`;

            const soKhoiNuoc = Math.max(0, (hd.soNuocMoi || 0) - (hd.soNuocCu || 0));
            const giaNuoc = hd.giaNuoc || 20000;
            const hienThiNuoc = `
                <div class="td-dien-nuoc">
                    <strong>${soKhoiNuoc} khối</strong><br>
                    <span class="gia-nuoc">${giaNuoc.toLocaleString('vi-VN')} đ/khối</span><br>
                    <span class="chi-so">(${hd.soNuocCu || 0} &rarr; ${hd.soNuocMoi || 0})</span>
                </div>`;

            const giaTriTrangThai = hd.trangThai || hd.tinhTrang || hd.daThanhToan || '';
            const strTrangThai = String(giaTriTrangThai).toLowerCase().trim();
            const isDaThanhToan = (strTrangThai === 'da_thu' || strTrangThai === '1' || strTrangThai === 'true' || strTrangThai.includes('đã thanh toán') || strTrangThai.includes('đã thu'));

            const htmlTrangThai = isDaThanhToan 
                ? '<span class="badge bg-success">Đã thanh toán</span>' 
                : '<span class="badge bg-danger">Chưa thanh toán</span>';

            return `
                <tr class="align-middle">
                    <td class="fw-bold text-center">${thangNam}</td>
                    <td class="text-center">${formatTien(hd.tienPhong)}</td>
                    <td>${hienThiDien}</td>
                    <td>${hienThiNuoc}</td>
                    <td class="text-center">${formatTien(hd.phuPhi)}</td>
                    <td class="fw-bold text-danger text-center fs-6">${formatTien(hd.tongTien)}</td>
                    <td class="text-center">${htmlTrangThai}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml.join('');
    })
    .catch(err => {
        console.error("Lỗi tải hóa đơn:", err);
        document.getElementById('bangHoaDonKhach').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger py-4">Có lỗi xảy ra khi tải dữ liệu hóa đơn. Vui lòng thử lại sau!</td></tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", loadHoaDon);