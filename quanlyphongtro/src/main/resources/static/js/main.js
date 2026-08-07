const API_BASE_URL = '/api';
// KIỂM TRA ĐĂNG NHẬP NGAY LẬP TỨC TRƯỚC KHI TẢI TRANG
const adminSession = localStorage.getItem('adminUsername');
if (!adminSession) {
    window.location.href = '/login.html'; 
}
let roomModal;
let khachModal;
let adminModal;
let currentActiveTab = 'phong-tro'; // Biến lưu vết tab đang mở, mặc định là phòng trọ

// Khởi tạo khi tải trang
// Tự động khởi tạo Modal và gọi các luồng dữ liệu nền khi trang web vừa tải xong
document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo các Modal của Bootstrap để sử dụng chung, tránh tạo nhiều instance gây tràn bộ nhớ
    roomModal = new bootstrap.Modal(document.getElementById('roomModal'));
    khachModal = new bootstrap.Modal(document.getElementById('khachModal'));
    
    const adminModalEl = document.getElementById('thongTinAdminModal');
    if (adminModalEl) adminModal = new bootstrap.Modal(adminModalEl);
    
    // Khởi chạy các luồng dữ liệu ban đầu
    fetchDanhSachKhuVuc(); 
    fetchAdminProfile();   

    // Đọc lại vết tab đã lưu, nếu chưa có thì mặc định mở trang 'phong-tro'
    const savedTab = sessionStorage.getItem('adminActiveTab') || 'phong-tro';
    switchTab(savedTab); 
});

// Quản lý tab và menu hiển thị
// Xử lý chuyển đổi qua lại giữa các menu chức năng và lưu trạng thái vào bộ nhớ tạm
function switchTab(tabName) {
    currentActiveTab = tabName; 
    sessionStorage.setItem('adminActiveTab', tabName);
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none'; 
    });

    const menuEl = document.getElementById(`menu-${tabName}`);
    const secEl = document.getElementById(`sec-${tabName}`);
    
    if (menuEl) menuEl.classList.add('active');
    if (secEl) {
        secEl.classList.add('active');
        secEl.style.display = 'block'; 
    }

    reloadCurrentTab(); 
}

// Gọi đúng hàm tải dữ liệu tương ứng với màn hình Tab đang được mở
function reloadCurrentTab() {
    switch (currentActiveTab) {
        case 'phong-tro':
            if (typeof fetchRooms === 'function') fetchRooms();
            break;
        case 'khach-thue':
            if (typeof fetchNguoiThue === 'function') fetchNguoiThue();
            break;
        case 'hoa-don':
            if (typeof fetchHoaDon === 'function') fetchHoaDon();
            break;
        case 'su-co':
            if (typeof fetchSuCo === 'function') fetchSuCo();
            break;
        case 'thong-ke':
            if (typeof fetchThongKe === 'function') fetchThongKe();
            break;
        case 'tam-tru': 
            if (typeof loadDanhSachTamTru === 'function') loadDanhSachTamTru();
            break;
    }
}

// Bộ lọc chung
// Tải danh sách địa chỉ chi nhánh CỦA RIÊNG CHỦ TRỌ ĐANG ĐĂNG NHẬP
function fetchDanhSachKhuVuc() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    
    fetch(`${API_BASE_URL}/khu-vuc/chu-tro/${chuTroId}`)
        .then(res => {
            if (!res.ok) throw new Error("Lỗi lấy dữ liệu từ Server");
            return res.json();
        })
        .then(data => {
            const select = document.getElementById('globalKhuVucFilter');
            if (!select) return; 
            
            // Xóa sạch các option cũ một cách an toàn
            select.options.length = 0;
            
            // Tạo option mặc định "-- Tất cả khu vực --"
            const defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.text = "-- Tất cả khu vực --";
            select.appendChild(defaultOpt);
            
            // Thêm các chi nhánh từ Database vào
            if (Array.isArray(data)) {
                data.forEach(kv => {
                    const opt = document.createElement('option');
                    opt.value = kv.id; // Bắt buộc dùng ID để tránh lỗi trùng tên
                    opt.text = kv.tenKhuVuc || "Chưa đặt tên";
                    select.appendChild(opt);
                });
            }
            
            // Cập nhật lại màn hình hiện tại
            reloadCurrentTab();
        })
        .catch(err => {
            console.error("Lỗi tải danh sách địa chỉ:", err);
            // Phục hồi lại tùy chọn mặc định nếu bị lỗi mạng
            const select = document.getElementById('globalKhuVucFilter');
            if (select) {
                select.options.length = 0;
                const defaultOpt = document.createElement('option');
                defaultOpt.value = "";
                defaultOpt.text = "-- Tất cả khu vực --";
                select.appendChild(defaultOpt);
            }
        });
}

//  Quản lý tài khoản chủ trọ (Admin)
// Xóa sạch bộ nhớ đệm và chuyển hướng người dùng về trang Đăng nhập
function dangXuatAdmin() {
    localStorage.clear(); 
    window.location.href = 'login.html'; 
}

// Gửi yêu cầu cập nhật mật khẩu mới của Chủ trọ xuống Backend
function luuMatKhauAdmin() {
    const oldPass = document.getElementById('adminOldPass').value;
    const newPass = document.getElementById('adminNewPass').value;
    const username = localStorage.getItem('adminUsername'); 

    if (!oldPass || !newPass) { 
        alert("Vui lòng nhập đủ thông tin!"); 
        return; 
    }

    fetch(`${API_BASE_URL}/auth/admin/doi-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: username, 
            matKhauCu: oldPass, 
            matKhauMoi: newPass 
        })
    })
    .then(async res => {
        const msg = await res.text();
        alert(msg);
        if (res.ok) { 
            dangXuatAdmin(); // Yêu cầu đăng nhập lại để đảm bảo bảo mật
        }
    })
    .catch(err => console.error("Lỗi đổi mật khẩu:", err));
}

// Lấy thông tin cá nhân của Chủ trọ lưu vào LocalStorage
function fetchAdminProfile() {
    const username = localStorage.getItem('adminUsername');
    if (!username) return;
    fetch(`${API_BASE_URL}/auth/admin/thong-tin/${username}`)
        .then(res => res.json())
        .then(data => {
            localStorage.setItem('adminName', data.hoTen || '');
            localStorage.setItem('adminCCCD', data.cccd || '');
            localStorage.setItem('adminPhone', data.sdt || '');
            localStorage.setItem('adminEmail', data.email || ''); // Thêm dòng này
            localStorage.setItem('adminDiaChi', data.diaChi || ''); // Thêm dòng này
        })
        .catch(err => console.error("Lỗi lấy thông tin Chủ trọ:", err));
}

// Mở Modal và đổ dữ liệu hiện tại lên Form
function moModalThongTinAdmin() {
    document.getElementById('adminNameInput').value = localStorage.getItem('adminName') || '';
    document.getElementById('adminCCCDInput').value = localStorage.getItem('adminCCCD') || '';
    document.getElementById('adminPhoneInput').value = localStorage.getItem('adminPhone') || '';
    document.getElementById('adminEmailInput').value = localStorage.getItem('adminEmail') || '';
    document.getElementById('adminDiaChiInput').value = localStorage.getItem('adminDiaChi') || '';
    
    // Reset toàn bộ viền báo lỗi/hợp lệ khi mở lại modal
    ['adminCCCDInput', 'adminPhoneInput', 'adminEmailInput'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.remove('is-invalid', 'is-valid');
    });

    if (adminModal) adminModal.show();
}

// Hàm BẮT LỖI REAL-TIME cho CCCD và SĐT (Chỉ cho nhập số, đủ độ dài mới viền xanh)
function locKyTuSoAdmin(input, maxLength) {
    input.value = input.value.replace(/[^0-9]/g, ''); 
    if (input.value.length > maxLength) {
        input.value = input.value.slice(0, maxLength);
    }
    if (input.value.length === maxLength) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

// BẮT LỖI REAL-TIME cho Email
document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById('adminEmailInput');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            // Biểu thức chính quy (Regex) kiểm tra định dạng email chuẩn
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(this.value.trim())) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }
});

// Kiểm tra tính hợp lệ và gửi thông tin mới lưu vào Database
function luuThongTinAdmin() {
    const username = localStorage.getItem('adminUsername');
    if (!username) {
        alert("Phiên đăng nhập đã cũ hoặc bị lỗi. Vui lòng đăng nhập lại!");
        return;
    }
    
    // Lấy dữ liệu
    const hoTen = document.getElementById('adminNameInput').value.trim();
    const cccd = document.getElementById('adminCCCDInput').value.trim();
    const sdt = document.getElementById('adminPhoneInput').value.trim();
    const email = document.getElementById('adminEmailInput').value.trim();
    const diaChi = document.getElementById('adminDiaChiInput').value.trim();
    
    // Quét lỗi trước khi cho phép lưu
    const modalEl = document.getElementById('thongTinAdminModal');
    const errEls = modalEl.querySelectorAll('.is-invalid');
    
    if (!hoTen || !email || !cccd || !sdt) {
        alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
        return;
    }
    if (errEls.length > 0) {
        alert("Vui lòng sửa các thông tin chưa hợp lệ (đang báo viền đỏ) trước khi lưu!");
        return;
    }

    const dataToSend = { hoTen: hoTen, cccd: cccd, sdt: sdt, email: email, diaChi: diaChi };

    fetch(`${API_BASE_URL}/auth/admin/cap-nhat-thong-tin/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })
    .then(async res => {
        const msg = await res.text();
        if (res.ok) {
            alert(msg);
            // Cập nhật lại bộ nhớ tạm
            localStorage.setItem('adminName', hoTen);
            localStorage.setItem('adminCCCD', cccd);
            localStorage.setItem('adminPhone', sdt);
            localStorage.setItem('adminEmail', email);
            localStorage.setItem('adminDiaChi', diaChi);
            
            if (adminModal) adminModal.hide();
        } else {
            alert("Lỗi: " + msg);
        }
    })
    .catch(err => console.error("Lỗi cập nhật Chủ trọ:", err));
}

// Chuyển đổi qua lại giữa việc ẩn (****) và hiện chữ của ô nhập Mật khẩu
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
    }
}