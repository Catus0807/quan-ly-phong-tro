package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/chu-tro")
@CrossOrigin("*") 
public class ChuTroController {

    @Autowired
    private ChuTroRepository chuTroRepository;

    // 1. API ĐĂNG KÝ
    @PostMapping("/dang-ky")
    public ResponseEntity<?> dangKy(@RequestBody ChuTro chuTro) {
        if (chuTroRepository.existsByTenDangNhap(chuTro.getTenDangNhap())) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
        }
        
        ChuTro savedChuTro = chuTroRepository.save(chuTro);
        return ResponseEntity.ok(savedChuTro);
    }

    // 2. API ĐĂNG NHẬP
    @PostMapping("/dang-nhap")
    public ResponseEntity<?> dangNhap(@RequestBody ChuTro loginRequest) {
        Optional<ChuTro> chuTroOpt = chuTroRepository.findByTenDangNhap(loginRequest.getTenDangNhap());
        
        if (chuTroOpt.isPresent()) {
            ChuTro chuTro = chuTroOpt.get();
            // So sánh mật khẩu
            if (chuTro.getMatKhau().equals(loginRequest.getMatKhau())) {
                return ResponseEntity.ok(chuTro); // Trả về thông tin chủ trọ nếu thành công
            }
        }
        return ResponseEntity.status(401).body("Sai tên đăng nhập hoặc mật khẩu!");
    }

    // 3. LẤY THÔNG TIN CHỦ TRỌ THEO ID (Dùng để in hợp đồng, tờ khai CT01)
    @GetMapping("/{id}")
    public ResponseEntity<?> layThongTin(@PathVariable Long id) {
        return chuTroRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. API CẤP LẠI MẬT KHẨU (Dành cho Admin)
    @PutMapping("/{id}/reset-mat-khau")
    public ResponseEntity<?> resetMatKhau(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        
        // Bổ sung <ChuTro> vào Optional
        Optional<ChuTro> chuTroOpt = chuTroRepository.findById(id);
        
        if (chuTroOpt.isPresent()) {
            ChuTro chuTro = chuTroOpt.get();
            String matKhauMoi = body.get("matKhau");
            
            chuTro.setMatKhau(matKhauMoi); // Ghi đè mật khẩu mới
            chuTroRepository.save(chuTro); // Lưu vào DB
            
            return ResponseEntity.ok("Cấp lại mật khẩu thành công!");
        }
        
        return ResponseEntity.badRequest().body("Không tìm thấy chủ trọ này trong hệ thống!");
    }
}