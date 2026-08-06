package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.KhaiBaoTamTru;
import com.thuctap.quanlyphongtro.service.KhaiBaoTamTruService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tam-tru")
@CrossOrigin("*")
public class KhaiBaoTamTruController {

    @Autowired
    private KhaiBaoTamTruService tamTruService;

    // API Lấy danh sách theo CHỦ TRỌ
    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<KhaiBaoTamTru>> getAllTamTru(
            @PathVariable Long chuTroId,
            @RequestParam(required = false) Long khuVucId) { // Nhận thêm tham số lọc
            
        if (khuVucId != null) {
            return ResponseEntity.ok(tamTruService.locTheoChiNhanh(chuTroId, khuVucId));
        }
        return ResponseEntity.ok(tamTruService.getAllTamTru(chuTroId));
    }

    // API Lấy danh sách theo KHÁCH THUÊ
    @GetMapping("/khach/{khachId}")
    public ResponseEntity<List<KhaiBaoTamTru>> getTamTruByKhachId(@PathVariable Long khachId) {
        return ResponseEntity.ok(tamTruService.getTamTruByKhachId(khachId));
    }

    // API Tạo mới tờ khai
    @PostMapping
    public ResponseEntity<KhaiBaoTamTru> createTamTru(@RequestBody KhaiBaoTamTru tamTru) {
        return ResponseEntity.ok(tamTruService.createTamTru(tamTru));
    }

    // API Cập nhật trạng thái
    @PutMapping("/{id}/trang-thai")
    public ResponseEntity<?> updateTrangThai(@PathVariable Long id, @RequestBody String trangThaiMoi) {
        try {
            return ResponseEntity.ok(tamTruService.updateTrangThai(id, trangThaiMoi.replace("\"", "")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Xóa tờ khai
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTamTru(@PathVariable Long id) {
        tamTruService.deleteTamTru(id);
        return ResponseEntity.ok("Xóa thành công!");
    }
}