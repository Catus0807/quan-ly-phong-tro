const API_QUAN_TRI = '/api/quan-tri';
let danhSachChuTro = []; // Biến lưu trữ dữ liệu để lọc

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'SUPER_ADMIN') {
        alert("Cảnh báo: Bạn không có quyền truy cập vào trang này!");
        window.location.href = 'login.html';
        return;
    }
    loadDanhSachChuTro();
});

function loadDanhSachChuTro() {
    fetch(`${API_QUAN_TRI}/danh-sach-chu-tro`)
        .then(res => res.json())
        .then(data => {
            danhSachChuTro = data;
            filterAndSort(); // Gọi hàm lọc và sắp xếp thay vì render trực tiếp
        })
        .catch(err => console.error("Lỗi:", err));
}

// HÀM TÌM KIẾM VÀ SẮP XẾP
function filterAndSort() {
    const keywordInput = document.getElementById('searchInput');
    const sortInput = document.getElementById('sortInput');
    
    const keyword = keywordInput ? keywordInput.value.toLowerCase() : '';
    const sortType = sortInput ? sortInput.value : 'newest';

    // Tìm kiếm đa luồng (Tên, SĐT, CCCD, Email, Username)
    let filtered = danhSachChuTro.filter(ct => {
        return (ct.hoTen && ct.hoTen.toLowerCase().includes(keyword)) ||
               (ct.sdt && ct.sdt.includes(keyword)) ||
               (ct.cccd && ct.cccd.includes(keyword)) ||
               (ct.email && ct.email.toLowerCase().includes(keyword)) ||
               (ct.tenDangNhap && ct.tenDangNhap.toLowerCase().includes(keyword));
    });

    // Sắp xếp
    if (sortType === 'newest') {
        filtered.sort((a, b) => b.id - a.id); // Mới nhất lên đầu
    } else {
        filtered.sort((a, b) => a.id - b.id); // Cũ nhất lên đầu
    }

    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('tableQuanTriBody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Không tìm thấy tài khoản chủ trọ nào phù hợp.</td></tr>';
        return;
    }
    
    data.forEach((chuTro, index) => {
        let badge = '';
        let actionButtons = '';
        
        if (chuTro.trangThai === 'CHO_DUYET') {
            badge = '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split"></i> Chờ duyệt</span>';
            actionButtons = `<button class="btn btn-sm btn-success w-100 mb-1 fw-bold" onclick="doiTrangThai(${chuTro.id}, 'HOAT_DONG')">DUYỆT NGAY</button>`;
        } else if (chuTro.trangThai === 'HOAT_DONG') {
            badge = '<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> Đang hoạt động</span>';
            actionButtons = `<button class="btn btn-sm btn-danger w-100 fw-bold" onclick="doiTrangThai(${chuTro.id}, 'KHOA')"><i class="bi bi-lock-fill"></i> KHÓA TÀI KHOẢN</button>`;
        } else if (chuTro.trangThai === 'KHOA') {
            badge = '<span class="badge bg-danger"><i class="bi bi-lock-fill"></i> Đã bị khóa</span>';
            actionButtons = `<button class="btn btn-sm btn-outline-success w-100 fw-bold" onclick="doiTrangThai(${chuTro.id}, 'HOAT_DONG')"><i class="bi bi-unlock-fill"></i> MỞ KHÓA</button>`;
        } else {
            badge = '<span class="badge bg-secondary">Chưa xác định</span>';
        }
        
        // Nút Cấp lại mật khẩu và Xóa cho mọi dòng
        actionButtons += `
            <button class="btn btn-sm btn-info w-100 mt-1 text-white fw-bold" onclick="resetMatKhau(${chuTro.id}, '${chuTro.tenDangNhap}')">
                <i class="bi bi-key-fill"></i> CẤP LẠI MK
            </button>
            <button class="btn btn-sm btn-dark w-100 mt-1" onclick="xoaChuTro(${chuTro.id})">
                <i class="bi bi-trash"></i> XÓA
            </button>
        `;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center fw-bold">${index + 1}</td>
            <td class="fw-bold text-primary">${chuTro.hoTen || '---'}</td>
            <td><strong>${chuTro.tenDangNhap}</strong></td>
            <td>${chuTro.email || '---'}</td>
            <td>${chuTro.sdt || '---'}</td>
            <td>${chuTro.cccd || '---'}</td>
            <td class="text-center">${badge}</td>
            <td>${chuTro.diaChi || '---'}</td>
            <td class="text-center" style="width: 150px;">${actionButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

function doiTrangThai(id, trangThaiMoi) {
    const hanhDong = trangThaiMoi === 'HOAT_DONG' ? 'cấp quyền hoạt động cho' : 'khóa';
    
    if (confirm(`Bạn có chắc chắn muốn ${hanhDong} tài khoản này?`)) {
        fetch(`${API_QUAN_TRI}/chu-tro/${id}/trang-thai`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trangThai: trangThaiMoi })
        })
        .then(async res => {
            if (res.ok) {
                alert("Cập nhật trạng thái thành công!");
                loadDanhSachChuTro(); 
            } else {
                alert("Lỗi: " + await res.text());
            }
        });
    }
}

function xoaChuTro(id) {
    if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Hành động này không thể hoàn tác!")) {
        fetch(`${API_QUAN_TRI}/chu-tro/${id}`, { method: 'DELETE' })
            .then(async res => {
                if (res.ok) {
                    alert("Đã xóa tài khoản thành công!");
                    loadDanhSachChuTro();
                } else {
                    alert("Lỗi: " + await res.text());
                }
            });
    }
}

// HÀM XỬ LÝ CẤP LẠI MẬT KHẨU
function resetMatKhau(id, username) {
    const matKhauMoi = prompt(`Tạo mật khẩu mới cho tài khoản [${username}]:\n(Vui lòng cung cấp mật khẩu này cho chủ trọ)`);
    
    if (matKhauMoi && matKhauMoi.trim() !== '') {
        fetch(`/api/chu-tro/${id}/reset-mat-khau`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matKhau: matKhauMoi })
        })
        .then(async res => {
            if (res.ok) alert(`✅ Cấp lại mật khẩu thành công!\n\nMật khẩu mới của [${username}] là: ${matKhauMoi}`);
            else alert("Lỗi: " + await res.text());
        })
        .catch(err => console.error(err));
    }
}

function dangXuat() {
    localStorage.clear();
    window.location.href = 'login.html';
}