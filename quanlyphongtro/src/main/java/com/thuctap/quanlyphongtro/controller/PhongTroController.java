package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.PhongTro;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import com.thuctap.quanlyphongtro.service.PhongTroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phong-tro")
@CrossOrigin(origins = "*")
public class PhongTroController {

    @Autowired
    private PhongTroService phongTroService; 
    
    @Autowired
    private ChuTroRepository chuTroRepository; // Thêm Repository Chủ trọ

    // API Lấy danh sách toàn bộ phòng trọ CỦA 1 CHỦ TRỌ
    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<PhongTro>> getAllPhongTro(@PathVariable Long chuTroId) {
        // Lưu ý: Bạn cần cập nhật hàm getAllPhongTro trong Service để nhận tham số chuTroId
        return ResponseEntity.ok(phongTroService.getAllPhongTro(chuTroId));
    }

    // API Thêm mới một phòng trọ CỦA 1 CHỦ TRỌ
    @PostMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<?> createPhongTro(@PathVariable Long chuTroId, @Valid @RequestBody PhongTro phongTro) {
        return chuTroRepository.findById(chuTroId).map(chuTro -> {
            phongTro.setChuTro(chuTro); // Gắn phòng này cho Chủ trọ
            PhongTro saved = phongTroService.createPhongTro(phongTro);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }).orElse(ResponseEntity.badRequest().body(null));
    }

    // API Sửa thông tin phòng trọ (Giữ nguyên vì thao tác trên ID của phòng)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePhongTro(@PathVariable Long id, @Valid @RequestBody PhongTro phongTroDetails) {
        try {
            PhongTro updated = phongTroService.updatePhongTro(id, phongTroDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Xóa phòng trọ theo ID (Giữ nguyên)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePhong(@PathVariable Long id) {
        try {
            phongTroService.deletePhongTro(id);
            return ResponseEntity.ok().body("Xóa phòng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @GetMapping("/chu-tro/{chuTroId}/search")
    public ResponseEntity<List<PhongTro>> searchPhongTro(
            @PathVariable Long chuTroId,
            @RequestParam(required = false) Long minGia,
            @RequestParam(required = false) Long maxGia,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String soPhong,
            @RequestParam(required = false) Long khuVucId) { // ĐỔI SANG LONG

        if (minGia != null && maxGia != null) return ResponseEntity.ok(phongTroService.timKiemTheoKhoangGia(chuTroId, minGia, maxGia));
        if (trangThai != null) return ResponseEntity.ok(phongTroService.timKiemTheoTrangThai(chuTroId, trangThai));
        if (soPhong != null) return ResponseEntity.ok(phongTroService.timKiemTheoSoPhong(chuTroId, soPhong));
        
        // SỬA LẠI DÒNG NÀY:
        if (khuVucId != null) return ResponseEntity.ok(phongTroService.timKiemTheoKhuVuc(chuTroId, khuVucId));
        
        return ResponseEntity.ok(phongTroService.getAllPhongTro(chuTroId));
    }

}
    