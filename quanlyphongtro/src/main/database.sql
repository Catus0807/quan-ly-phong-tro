-- Tạo database nếu chưa tồn tại (Hỗ trợ tiếng Việt UTF-8)
CREATE DATABASE IF NOT EXISTS quanlyphongtro
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bắt đầu sử dụng database vừa tạo
USE quanlyphongtro;

-- Tắt kiểm tra khóa ngoại để xóa bảng an toàn (Tránh lỗi khi chạy file nhiều lần)
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa bảng cũ nếu có 
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS nguoi_o_ghep;
DROP TABLE IF EXISTS nguoi_thue;
DROP TABLE IF EXISTS phong_tro;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. TẠO CẤU TRÚC CÁC BẢNG (TABLES)
-- ==========================================

-- Bảng Phòng Trọ
CREATE TABLE phong_tro (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    so_phong VARCHAR(50) NOT NULL,
    dien_tich DOUBLE,
    gia_thue BIGINT NOT NULL,
    dia_chi VARCHAR(255),
    trang_thai VARCHAR(50),
    mo_ta TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Người Thuê (Người đại diện ký hợp đồng)
CREATE TABLE nguoi_thue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_khach VARCHAR(100) NOT NULL,
    cccd VARCHAR(12) NOT NULL,
    sdt VARCHAR(10) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(20),
    que_quan VARCHAR(255),
    tien_coc DOUBLE,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    noi_dung_hop_dong LONGTEXT,
    mat_khau VARCHAR(255), -- Dùng cho tính năng "Cấp tài khoản" để người thuê đăng nhập
    phong_tro_id BIGINT,
    CONSTRAINT fk_phong_tro FOREIGN KEY (phong_tro_id) REFERENCES phong_tro(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Người Ở Ghép
CREATE TABLE nguoi_o_ghep (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    cccd VARCHAR(12) NOT NULL,
    sdt VARCHAR(10),
    ngay_sinh DATE,
    gioi_tinh VARCHAR(20),
    que_quan VARCHAR(255),
    nguoi_thue_id BIGINT,
    CONSTRAINT fk_nguoi_thue FOREIGN KEY (nguoi_thue_id) REFERENCES nguoi_thue(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Admin (Tài khoản Chủ Trọ)
CREATE TABLE admin (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(100),
    cccd VARCHAR(12),
    sdt VARCHAR(10),
    role VARCHAR(20) DEFAULT 'ADMIN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 2. THÊM DỮ LIỆU MẪU (MOCK DATA)
-- ==========================================

-- Thêm dữ liệu Phòng trọ
INSERT INTO phong_tro (so_phong, dien_tich, gia_thue, dia_chi, trang_thai, mo_ta) VALUES
('P101', 15.0, 2500000, 'Ngõ 1, Cầu Giấy, Hà Nội', 'TRONG', 'Phòng tầng 1, khép kín, phù hợp 1 người ở.'),
('P102', 20.0, 3200000, 'Ngõ 1, Cầu Giấy, Hà Nội', 'DANG_THUE', 'Có gác xép, ban công phơi đồ.'),
('P201', 25.0, 4000000, 'Khu đô thị Mỹ Đình, Nam Từ Liêm', 'TRONG', 'Dạng Studio, đầy đủ nội thất cơ bản.'),
('P305', 18.0, 2800000, 'Ngõ 175 Xuân Thủy, Cầu Giấy', 'BAO_TRI', 'Đang sửa lại đường ống nước ngầm.');

-- Thêm tài khoản Chủ trọ mặc định 
-- (Lưu ý: Nếu API Login của bạn dùng mã hóa BCrypt, hãy thay chuỗi '123456' bằng mã Hash BCrypt của nó)
INSERT INTO admin (username, password, ho_ten, cccd, sdt, role) VALUES
('admin', '123456', 'Phạm Quỳnh Chi', '012345678901', '0987654321', 'ADMIN');