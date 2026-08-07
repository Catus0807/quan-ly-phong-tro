const API_URL_THUE = '/api/thue';

// Format tiền tệ
function formatTien(soTien) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTien || 0);
}

// Lấy và hiển thị dữ liệu
function fetchLichSuThue() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;

    fetch(`${API_URL_THUE}/chu-tro/${chuTroId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('bangHoSoThue');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-muted">Chưa có hồ sơ thuế nào. Hãy nhấn "Đồng bộ".</td></tr>';
                capNhatThanhTienDo(0); // Reset thanh tiến độ
                return;
            }

            // Lấy năm đang được chọn trên giao diện để cập nhật thanh tiến độ
            const namDangChon = parseInt(document.getElementById('chonNamThue').value);
            let timThayNamChon = false;

            data.forEach(hs => {
                // Cập nhật thanh tiến độ nếu đúng năm
                if (hs.nam === namDangChon) {
                    capNhatThanhTienDo(hs.tongDoanhThu);
                    timThayNamChon = true;
                }

                // Vẽ Huy hiệu trạng thái
                let badgeClass = 'bg-secondary';
                let tenTrangThai = 'Chưa khai báo';
                if (hs.trangThai === 'DA_KHAI_BAO') { badgeClass = 'bg-info text-dark'; tenTrangThai = 'Đã khai báo (Chưa nộp)'; }
                if (hs.trangThai === 'DA_NOP_THUE') { badgeClass = 'bg-success'; tenTrangThai = 'Đã hoàn thành nộp thuế'; }
                
                // Nếu doanh thu <= 500tr
                if (hs.tongDoanhThu <= 500000000) {
                    badgeClass = 'bg-success';
                    tenTrangThai = 'Miễn nộp thuế';
                }

                // Vẽ Nút hành động (CÓ NÚT MỞ KHÓA)
                let actionBtns = '';
                if (hs.trangThai === 'CHUA_KHAI_BAO') {
                    if (hs.tongDoanhThu > 500000000) {
                        actionBtns = `<button class="btn btn-sm btn-info fw-bold w-100 mb-1" onclick="capNhatTrangThaiThue(${hs.id}, 'DA_KHAI_BAO')">Xác nhận đã Khai</button>`;
                    } else {
                        actionBtns = `<button class="btn btn-sm btn-outline-success w-100" onclick="capNhatTrangThaiThue(${hs.id}, 'DA_NOP_THUE')">Lưu HS Miễn Thuế</button>`;
                    }
                } 
                else if (hs.trangThai === 'DA_KHAI_BAO') {
                    actionBtns = `
                        <button class="btn btn-sm btn-success fw-bold w-100 mb-1" onclick="capNhatTrangThaiThue(${hs.id}, 'DA_NOP_THUE')">Xác nhận đã Nộp</button>
                        <button class="btn btn-sm btn-outline-danger w-100" onclick="capNhatTrangThaiThue(${hs.id}, 'CHUA_KHAI_BAO')" title="Hủy khai báo">
                            <i class="bi bi-arrow-counterclockwise"></i> Mở khóa
                        </button>
                    `;
                } 
                else if (hs.trangThai === 'DA_NOP_THUE') {
                    actionBtns = `
                        <span class="d-block mb-1 text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Hoàn tất</span>
                        <button class="btn btn-sm btn-outline-danger w-100" onclick="capNhatTrangThaiThue(${hs.id}, 'CHUA_KHAI_BAO')" title="Hoàn tác">
                            <i class="bi bi-arrow-counterclockwise"></i> Mở khóa
                        </button>
                    `;
                }

                tbody.innerHTML += `
                    <tr class="align-middle">
                        <td class="fw-bold fs-5 text-primary">${hs.nam}</td>
                        <td class="fw-bold">${formatTien(hs.tongDoanhThu)}</td>
                        <td>${formatTien(hs.thueGTGT)}</td>
                        <td>${formatTien(hs.thueTNCN)}</td>
                        <td class="fw-bold text-danger fs-6">${formatTien(hs.tongThue)}</td>
                        <td><span class="badge ${badgeClass} fs-6">${tenTrangThai}</span></td>
                        <td>${actionBtns}</td> <!-- Chèn biến actionBtns vào đây -->
                    </tr>
                `;
            });

            if(!timThayNamChon) capNhatThanhTienDo(0);
        })
        .catch(err => console.error("Lỗi lấy dữ liệu thuế:", err));
}

// Cập nhật thanh tiến độ (Progress Bar)
function capNhatThanhTienDo(doanhThu) {
    const nam = document.getElementById('chonNamThue').value;
    document.getElementById('lblNamTienDo').innerText = nam;

    const bar = document.getElementById('thanhTienDoThue');
    const txtCanhBao = document.getElementById('txtCanhBaoThue');
    const mucMienThue = 500000000;
    
    let phanTram = (doanhThu / mucMienThue) * 100;
    
    bar.innerText = formatTien(doanhThu);

    if (phanTram > 100) {
        bar.style.width = '100%';
        bar.classList.replace('bg-success', 'bg-danger');
        txtCanhBao.classList.remove('d-none');
    } else {
        bar.style.width = phanTram + '%';
        bar.classList.replace('bg-danger', 'bg-success');
        txtCanhBao.classList.add('d-none');
    }
}

// Đồng bộ dữ liệu năm nay
function dongBoThue() {
    const chuTroId = localStorage.getItem('chuTroId');
    const nam = document.getElementById('chonNamThue').value;
    
    fetch(`${API_URL_THUE}/chu-tro/${chuTroId}/dong-bo?nam=${nam}`, { method: 'POST' })
        .then(async res => {
            if (res.ok) {
                alert(`Đã tính toán xong dữ liệu doanh thu năm ${nam}!`);
                fetchLichSuThue();
            } else {
                alert("Lỗi: " + await res.text());
            }
        })
        .catch(err => console.error(err));
}

// Cập nhật trạng thái
function capNhatTrangThaiThue(id, trangThaiMoi) {
    let msg = "";
    
    // Tự động đổi câu hỏi tùy theo nút mà user bấm
    if (trangThaiMoi === 'DA_KHAI_BAO') {
        msg = "Xác nhận bạn ĐÃ NỘP TỜ KHAI cho cơ quan thuế?";
    } else if (trangThaiMoi === 'DA_NOP_THUE') {
        msg = "Xác nhận bạn ĐÃ HOÀN THÀNH ĐÓNG THUẾ (Hoặc Lưu HS Miễn Thuế)?";
    } else if (trangThaiMoi === 'CHUA_KHAI_BAO') {
        msg = "Bạn có chắc chắn muốn MỞ KHÓA hồ sơ này? Hành động này cho phép hệ thống tính toán và đồng bộ lại doanh thu.";
    }
    
    if (confirm(msg)) {
        fetch(`${API_URL_THUE}/${id}/trang-thai`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trangThai: trangThaiMoi })
        })
        .then(res => {
            if (res.ok) fetchLichSuThue();
        });
    }
}

// Lắng nghe sự kiện đổi năm trên giao diện
document.addEventListener("DOMContentLoaded", () => {
    const selectNam = document.getElementById('chonNamThue');
    if(selectNam) {
        selectNam.addEventListener('change', fetchLichSuThue);
    }
});