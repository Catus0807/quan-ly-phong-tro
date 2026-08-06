package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private ChuTroRepository chuTroRepository;
    
    @Autowired
    private NguoiThueRepository nguoiThueRepository;

    // Hàm kiểm tra tên đăng nhập đã tồn tại hay chưa (phục vụ validation frontend)
    public boolean checkUsernameExists(String username) {
        return chuTroRepository.existsByTenDangNhap(username);
    }

    // Xác thực thông tin đăng nhập và trả về phân quyền
    public Map<String, Object> authenticate(String username, String password) {
        
        // TÀI KHOẢN QUẢN TRỊ VIÊN HỆ THỐNG (SUPER ADMIN)
        if ("quantrihethong".equals(username) && "admin123456".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("role", "SUPER_ADMIN");
            response.put("username", username);
            response.put("redirect", "quan-tri.html"); // Chuyển thẳng tới trang phê duyệt
            return response;
        }

        // Kiểm tra xem có phải Chủ trọ đăng nhập không
        ChuTro admin = chuTroRepository.findByTenDangNhap(username).orElse(null);
        if (admin != null && admin.getMatKhau().equals(password)) {
            
            // Chặn nếu Chủ trọ chưa được duyệt
            if ("CHO_DUYET".equals(admin.getTrangThai())) {
                throw new RuntimeException("Tài khoản đang chờ Ban quản trị phê duyệt. Vui lòng liên hệ Hotline!");
            }
            if ("KHOA".equals(admin.getTrangThai())) {
                throw new RuntimeException("Tài khoản của bạn đã bị khóa!");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("role", "ADMIN");
            response.put("username", username);
            response.put("chuTroId", admin.getId()); 
            response.put("redirect", "index.html");
            return response;
        }

        // Kiểm tra xem có phải Khách thuê đăng nhập không
        NguoiThue khach = nguoiThueRepository.findBySdtAndMatKhau(username, password).orElse(null);
        if (khach != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("role", "USER");
            response.put("khachId", khach.getId());
            response.put("tenKhach", khach.getTenKhach());
            
            Long chuTroIdCuaKhach = (khach.getChuTro() != null) ? khach.getChuTro().getId() : null;
            response.put("chuTroId", chuTroIdCuaKhach);
            
            response.put("redirect", "user-dashboard.html");
            return response;
        }
        
        throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác!");
    }

    // Xử lý đăng ký tài khoản Chủ trọ mới
    @Transactional
    public ChuTro dangKyChuTro(ChuTro chuTro) {
        if (chuTroRepository.existsByTenDangNhap(chuTro.getTenDangNhap())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
        }
        // GÁN TRẠNG THÁI MẶC ĐỊNH
        chuTro.setTrangThai("CHO_DUYET");
        return chuTroRepository.save(chuTro);
    }

    // Lấy thông tin cá nhân của Chủ trọ theo tên đăng nhập
    public ChuTro getAdminInfo(String username) {
        return chuTroRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu Chủ trọ!"));
    }

    // Cập nhật thông tin cá nhân của Chủ trọ
    @Transactional
    public void updateAdminInfo(String username, ChuTro data) {
        ChuTro admin = getAdminInfo(username);
        admin.setHoTen(data.getHoTen());
        admin.setCccd(data.getCccd());
        admin.setSdt(data.getSdt());
        admin.setDiaChi(data.getDiaChi()); 
        admin.setEmail(data.getEmail());
        chuTroRepository.save(admin);
    }

    // Xử lý đổi mật khẩu cho Chủ trọ
    @Transactional
    public void doiMatKhauAdmin(String username, String oldPass, String newPass) {
        ChuTro admin = getAdminInfo(username);
        if (!admin.getMatKhau().equals(oldPass)) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }
        admin.setMatKhau(newPass);
        chuTroRepository.save(admin);
    }
}