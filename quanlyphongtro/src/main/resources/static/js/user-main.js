const API_BASE_URL = '/api';

const role = localStorage.getItem('userRole');
const khachId = localStorage.getItem('khachId');
const tenKhach = localStorage.getItem('tenKhach');

// Nếu không phải Khách thuê, trở về trang Login
if (role !== 'USER' || !khachId) {
    alert("Bạn chưa đăng nhập hoặc không có quyền truy cập!");
    window.location.href = 'login.html';
}

// Khởi tạo khi tải trang
document.addEventListener("DOMContentLoaded", function() {
    const welcomeEl = document.getElementById('welcomeText');
    if (welcomeEl) {
        welcomeEl.innerText = 'Xin chào, ' + tenKhach;
    }

    // Đọc lại vết, nếu không có thì mở 'hop-dong'
    const savedTab = sessionStorage.getItem('userActiveTab') || 'hop-dong';
    switchTab(savedTab);

    // Bắt sự kiện Cập nhật thông tin cá nhân
    const formCaNhan = document.getElementById('formCaNhan');
    if (formCaNhan) {
        formCaNhan.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const sdtValue = document.getElementById('cnSdt').value.trim();

            // Kiểm tra luật độ dài số điện thoại
            if (sdtValue.length !== 10) {
                alert("Lỗi: Số điện thoại phải bao gồm đúng 10 chữ số!");
                return;
            }

            // Xử lý ngày sinh: Đảo từ DD/MM/YYYY (Form) sang YYYY-MM-DD (Backend)
            let nsInput = document.getElementById('cnNgaySinh').value;
            let nsBackend = null;
            if (nsInput.length === 10) {
                let parts = nsInput.split('/');
                nsBackend = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            
            const data = {
                tenKhach: document.getElementById('cnTenKhach').value,
                sdt: sdtValue,
                ngaySinh: nsBackend, // Gửi chuẩn Quốc tế xuống DB
                gioiTinh: document.getElementById('cnGioiTinh').value,
                queQuan: document.getElementById('cnQueQuan').value
            };

            // Gọi API lưu dữ liệu
            fetch(`${API_BASE_URL}/nguoi-thue/khach-tu-cap-nhat/${khachId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(res => {
                if (res.ok) {
                    alert("Cập nhật thông tin thành công!");
                    // Cập nhật lại tên trên thanh Header và bộ nhớ
                    if (welcomeEl) welcomeEl.innerText = 'Xin chào, ' + data.tenKhach;
                    localStorage.setItem('tenKhach', data.tenKhach);
                } else {
                    alert("Lỗi khi cập nhật, vui lòng thử lại!");
                }
            }).catch(err => console.error("Lỗi:", err));
        });
    }
});

// Quản lý chuyển tab
let currentActiveTab = 'hop-dong'; 

function switchTab(tabName) {
    currentActiveTab = tabName;
    sessionStorage.setItem('userActiveTab', tabName);

    document.querySelectorAll('.sidebar .nav-link').forEach(el => {
        el.classList.remove('active');
    });

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

    if (tabName === 'ca-nhan') {
        loadThongTinCaNhan();
    }
}

// Load thông tin cá nhân từ database
function loadThongTinCaNhan() {
    if (!khachId) return;

    fetch(`${API_BASE_URL}/nguoi-thue/${khachId}`)
        .then(res => res.json())
        .then(data => {
            if (data) {
                document.getElementById('cnTenKhach').value = data.tenKhach || '';
                document.getElementById('cnSdt').value = data.sdt || '';
                document.getElementById('cnGioiTinh').value = data.gioiTinh || '';
                document.getElementById('cnQueQuan').value = data.queQuan || '';
                document.getElementById('cnCccd').value = data.cccd || '';

                // Xử lý ngày sinh: Đảo từ YYYY-MM-DD (Backend) sang DD/MM/YYYY (Form)
                let ns = data.ngaySinh || '';
                if (ns.includes('-')) {
                    let parts = ns.split('-');
                    ns = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                document.getElementById('cnNgaySinh').value = ns;
            }
        }).catch(err => console.error("Lỗi:", err));
}

// Đăng xuất, đổi mật khẩu (người thuê)
function dangXuat() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function luuMatKhauUser() {
    const oldPass = document.getElementById('userOldPass').value;
    const newPass = document.getElementById('userNewPass').value;

    if (!oldPass || !newPass) { 
        alert("Vui lòng nhập đủ thông tin!"); 
        return; 
    }

    fetch(`${API_BASE_URL}/nguoi-thue/${khachId}/doi-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matKhauCu: oldPass, matKhauMoi: newPass })
    })
    .then(async res => {
        const msg = await res.text();
        alert(msg);
        if (res.ok) {
            dangXuat(); // Bắt đăng nhập lại sau khi đổi pass thành công
        }
    })
    .catch(err => console.error("Lỗi:", err));
}

// Hàm tiện ích khác
// Ẩn/Hiện mật khẩu
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

// Lọc ký tự (Chỉ cho phép nhập số)
function locKyTuSo(input, maxLength) {
    input.value = input.value.replace(/[^0-9]/g, ''); 
    if (input.value.length === maxLength) {
        input.classList.remove('is-invalid');
    }
}

// Khóa không cho chuyển ô nếu nhập thiếu số
function khoaOChuaHopLe(input, exactLength, errorMsg) {
    if (input.value.length > 0 && input.value.length !== exactLength) {
        input.classList.add('is-invalid');
        if(input.nextElementSibling && input.nextElementSibling.classList.contains('invalid-feedback')) {
            input.nextElementSibling.innerText = errorMsg;
        }
        setTimeout(() => { input.focus(); }, 10);
    } else {
        input.classList.remove('is-invalid');
    }
}

// Tự động gạch chéo Ngày Sinh (Gõ 25082002 -> 25/08/2002)
function formatDateInput(input) {
    let val = input.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.substring(0, 8); 

    if (val.length >= 5) {
        input.value = val.substring(0, 2) + '/' + val.substring(2, 4) + '/' + val.substring(4, 8);
    } else if (val.length >= 3) {
        input.value = val.substring(0, 2) + '/' + val.substring(2, val.length);
    } else {
        input.value = val;
    }
}

// Tính năng quản lý người ở ghép
let nguoiGhepUserModalInstance;

document.addEventListener("DOMContentLoaded", () => {
    const ngUserModalEl = document.getElementById('nguoiGhepUserModal');
    if (ngUserModalEl) nguoiGhepUserModalInstance = new bootstrap.Modal(ngUserModalEl);
    
    // Gọi hàm tải người ở ghép khi trang load xong
    loadNguoiOGhepCuaToi();
});

// Tải và hiển thị dữ liệu
function loadNguoiOGhepCuaToi() {
    // Lấy ID khách từ bộ nhớ 
    const khachId = localStorage.getItem('khachId'); 
    if (!khachId) return;

    fetch(`/api/nguoi-thue/${khachId}?t=${new Date().getTime()}`)
    .then(res => res.json())
    .then(khach => {
        const danhSach = khach.danhSachNguoiOGhep || [];
        const khung = document.getElementById('khungNguoiGhep');
        const btnContainer = document.getElementById('btnThemNguoiGhepContainer');
        
        if(!khung || !btnContainer) return;

        // Nếu chưa có người ghép -> Hiện nút Thêm
        if (danhSach.length < 1) {
            btnContainer.innerHTML = `<button class="btn btn-sm btn-light text-info fw-bold shadow-sm" onclick="moModalThemNguoiGhepUser()"><i class="bi bi-plus-circle"></i> Khai báo người ở ghép</button>`;
            khung.innerHTML = `<div class="text-center text-muted py-3">Bạn chưa khai báo người ở ghép nào.</div>`;
        } else {
            btnContainer.innerHTML = ''; 
            const ng = danhSach[0]; // tối đa 1 người ghép
            
            let ns = ng.ngaySinh ? (ng.ngaySinh.includes('-') ? ng.ngaySinh.split('-').reverse().join('/') : ng.ngaySinh) : 'Chưa cập nhật';
            
            khung.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="text-info fw-bold mb-2">${ng.ten} <span class="badge bg-secondary fs-6 align-middle ms-2">Ở ghép</span></h5>
                        <p class="mb-1"><strong><i class="bi bi-person-vcard text-primary"></i> CCCD:</strong> ${ng.cccd}</p>
                        <p class="mb-1"><strong><i class="bi bi-telephone text-success"></i> SĐT:</strong> ${ng.sdt || '---'}</p>
                        <p class="mb-1"><strong><i class="bi bi-calendar-event text-warning"></i> Ngày sinh:</strong> ${ns}</p>
                        <p class="mb-1"><strong><i class="bi bi-gender-ambiguous text-info"></i> Giới tính:</strong> ${ng.gioiTinh || '---'}</p>
                        <p class="mb-0"><strong><i class="bi bi-house text-danger"></i> Quê quán:</strong> ${ng.queQuan || '---'}</p>
                    </div>
                    <div class="col-md-4 text-end mt-3 mt-md-0 border-start">
                        <button class="btn btn-outline-warning btn-sm mb-2 w-100 fw-bold" onclick='moModalSuaNguoiGhepUser(${JSON.stringify(ng).replace(/'/g, "&#39;")})'>
                            <i class="bi bi-pencil"></i> Sửa thông tin
                        </button>
                        <button class="btn btn-outline-danger btn-sm w-100 fw-bold" onclick="xoaNguoiGhepUser(${ng.id})">
                            <i class="bi bi-trash"></i> Xóa người này
                        </button>
                    </div>
                </div>
            `;
        }
    })
    .catch(err => console.error("Lỗi tải người ở ghép:", err));
}

// Thêm người ở ghép
function moModalThemNguoiGhepUser() {
    const form = document.getElementById('nguoiGhepUserForm');
    if (form) form.reset();
    
    document.getElementById('nguoiGhepUserTitle').innerText = "Khai Báo Người Ở Ghép";
    document.getElementById('ngGhepUserId').value = ''; 
    if (nguoiGhepUserModalInstance) nguoiGhepUserModalInstance.show();
}

// Sửa thông tin người ở ghép
function moModalSuaNguoiGhepUser(obj) {
    const form = document.getElementById('nguoiGhepUserForm');
    if (form) form.reset();
    
    document.getElementById('nguoiGhepUserTitle').innerText = "Cập Nhật Thông Tin Người Ghép";
    document.getElementById('ngGhepUserId').value = obj.id;
    
    document.getElementById('ngTenUser').value = obj.ten;
    document.getElementById('ngCccdUser').value = obj.cccd;
    document.getElementById('ngCccdUser').disabled = true;

    document.getElementById('ngSdtUser').value = obj.sdt || '';
    
    let ns = obj.ngaySinh || '';
    if (ns.includes('-')) {
        ns = ns.split('-').reverse().join('/');
    }
    document.getElementById('ngNgaySinhUser').value = ns;
    document.getElementById('ngGioiTinhUser').value = obj.gioiTinh || '';
    document.getElementById('ngQueQuanUser').value = obj.queQuan || '';

    if (nguoiGhepUserModalInstance) nguoiGhepUserModalInstance.show();
}

// LƯU THÔNG TIN 
function saveNguoiGhepUser() {
    const khachId = localStorage.getItem('khachId');
    const ghepId = document.getElementById('ngGhepUserId').value; 
    
    const ten = document.getElementById('ngTenUser').value.trim();
    const cccd = document.getElementById('ngCccdUser').value.trim();
    const sdt = document.getElementById('ngSdtUser').value.trim();

    if (!ten || !cccd || !sdt) {
        alert("Vui lòng điền đầy đủ Tên, CCCD và Số điện thoại!"); 
        return;
    }

    let nsInput = document.getElementById('ngNgaySinhUser')?.value || '';
    let nsBackend = nsInput.length === 10 ? `${nsInput.split('/')[2]}-${nsInput.split('/')[1]}-${nsInput.split('/')[0]}` : null;

    const data = { 
        ten: ten, 
        cccd: cccd, 
        sdt: sdt,
        ngaySinh: nsBackend,
        gioiTinh: document.getElementById('ngGioiTinhUser')?.value,
        queQuan: document.getElementById('ngQueQuanUser')?.value.trim()
    };

    const url = ghepId ? `/api/nguoi-o-ghep/${ghepId}` : `/api/nguoi-o-ghep/khach/${khachId}`;
    const method = ghepId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async res => {
        if (res.ok) {
            alert(ghepId ? "Cập nhật thành công!" : "Khai báo thành công!");
            if (nguoiGhepUserModalInstance) nguoiGhepUserModalInstance.hide();
            loadNguoiOGhepCuaToi(); 
        } else {
            alert("Lỗi: " + await res.text()); 
        }
    });
}

// XÓA NGƯỜI GHÉP
function xoaNguoiGhepUser(id) {
    if (confirm("Bạn có chắc chắn muốn xóa thông tin người ở ghép này?")) {
        fetch(`/api/nguoi-o-ghep/${id}`, { method: 'DELETE' })
        .then(async res => {
            if (res.ok) {
                alert("Đã xóa người ở ghép!");
                setTimeout(() => loadNguoiOGhepCuaToi(), 300);
            } else {
                alert("Lỗi khi xóa!");
            }
        });
    }
}

// Kiểm tra dữ liệu rỗng (Nếu ô trống thì hiện viền đỏ và câu cảnh báo)
function kiemTraRong(input) {
    if (!input.value || input.value.trim() === "") {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}
