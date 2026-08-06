package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.SuCo;
import com.thuctap.quanlyphongtro.service.SuCoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/su-co")
@CrossOrigin("*")
public class SuCoController {
    @Autowired
    private SuCoService suCoService;

    // API Lấy danh sách toàn bộ sự cố
    @GetMapping
    public ResponseEntity<List<SuCo>> getAll() {
        return ResponseEntity.ok(suCoService.getAll());
    }

    // API Tạo sự cố mới (Dành cho Chủ trọ)
    @PostMapping
    public ResponseEntity<SuCo> create(@RequestBody SuCo suCo) {
        return ResponseEntity.ok(suCoService.createOrUpdate(suCo, null));
    }

    // API Cập nhật thông tin và chi phí sự cố
    @PutMapping("/{id}")
    public ResponseEntity<SuCo> update(@PathVariable Long id, @RequestBody SuCo suCo) {
        return ResponseEntity.ok(suCoService.createOrUpdate(suCo, id));
    }

    // API Xóa sự cố
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        suCoService.delete(id);
        return ResponseEntity.ok().build();
    }

    // API Lọc danh sách sự cố theo chi nhánh
    @GetMapping("/loc-chi-nhanh")
    public ResponseEntity<List<SuCo>> locTheoChiNhanh(@RequestParam Long khuVucId) {
        return ResponseEntity.ok(suCoService.locTheoChiNhanh(khuVucId));
    }

    // API Lấy danh sách sự cố của một khách thuê cụ thể
    @GetMapping("/khach/{khachId}")
    public ResponseEntity<?> getSuCoKhachThue(@PathVariable Long khachId) {
        return ResponseEntity.ok(suCoService.getSuCoKhachThue(khachId));
    }

    // API Gửi phản ánh sự cố mới (Dành cho Khách thuê)
    @PostMapping("/khach/{khachId}")
    public ResponseEntity<?> taoSuCoTuKhach(@PathVariable Long khachId, @RequestBody SuCo suCoKhachGui) {
        try {
            return ResponseEntity.ok(suCoService.taoSuCoTuKhach(khachId, suCoKhachGui));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}