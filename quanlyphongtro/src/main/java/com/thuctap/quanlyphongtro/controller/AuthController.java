package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import com.thuctap.quanlyphongtro.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    // API Kiểm tra trùng lặp tên đăng nhập (Real-time)
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean exists = authService.checkUsernameExists(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // API Đăng nhập chung cho cả Chủ trọ và Người thuê
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        try {
            return ResponseEntity.ok(authService.authenticate(creds.get("username"), creds.get("password")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // API Đăng ký tài khoản Chủ trọ mới
    @PostMapping("/dang-ky")
    public ResponseEntity<?> dangKy(@RequestBody ChuTro chuTro) {
        try {
            return ResponseEntity.ok(authService.dangKyChuTro(chuTro));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Lấy thông tin cá nhân của Chủ trọ
    @GetMapping("/admin/thong-tin/{username}")
    public ResponseEntity<?> getAdminInfo(@PathVariable String username) {
        try { 
            return ResponseEntity.ok(authService.getAdminInfo(username)); 
        } catch (RuntimeException e) { 
            return ResponseEntity.badRequest().body(e.getMessage()); 
        }
    }

    // API Cập nhật thông tin cá nhân của Chủ trọ
    @PutMapping("/admin/cap-nhat-thong-tin/{username}")
    public ResponseEntity<?> updateAdminInfo(@PathVariable String username, @RequestBody ChuTro dataReq) {
        try { 
            authService.updateAdminInfo(username, dataReq);
            return ResponseEntity.ok("Cập nhật thông tin thành công!");
        } catch (RuntimeException e) { 
            return ResponseEntity.badRequest().body(e.getMessage()); 
        }
    }

    // API Đổi mật khẩu của Chủ trọ
    @PostMapping("/admin/doi-mat-khau")
    public ResponseEntity<?> doiMatKhauAdmin(@RequestBody Map<String, String> req) {
        try {
            authService.doiMatKhauAdmin(req.get("username"), req.get("matKhauCu"), req.get("matKhauMoi"));
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}