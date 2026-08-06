package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import com.thuctap.quanlyphongtro.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quan-tri")
@CrossOrigin("*")
public class QuanTriController {

    @Autowired
    private ChuTroRepository chuTroRepository;

    @Autowired
    private EmailService emailService;

    // Lấy danh sách tất cả Chủ trọ
    @GetMapping("/danh-sach-chu-tro")
    public ResponseEntity<List<ChuTro>> layDanhSachChuTro() {
        return ResponseEntity.ok(chuTroRepository.findAll());
    }

    // Cập nhật trạng thái của Chủ trọ (Duyệt / Khóa) và gửi Email
    @PutMapping("/chu-tro/{id}/trang-thai")
    public ResponseEntity<?> capNhatTrangThai(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            ChuTro chuTro = chuTroRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản này!"));
            
            String trangThaiMoi = body.get("trangThai");
            chuTro.setTrangThai(trangThaiMoi);
            chuTroRepository.save(chuTro);
            
            // Gửi email tự động nếu được duyệt
            if ("HOAT_DONG".equals(trangThaiMoi) && chuTro.getEmail() != null && !chuTro.getEmail().isEmpty()) {
                emailService.guiEmailThongBaoDuyet(chuTro.getEmail(), chuTro.getHoTen());
            }
            
            return ResponseEntity.ok("Cập nhật trạng thái thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Xóa vĩnh viễn Chủ trọ
    @DeleteMapping("/chu-tro/{id}")
    public ResponseEntity<?> xoaChuTro(@PathVariable Long id) {
        try {
            chuTroRepository.deleteById(id);
            return ResponseEntity.ok("Đã xóa vĩnh viễn tài khoản chủ trọ!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa. Chủ trọ này đã có dữ liệu phòng/khách!");
        }
    }
}