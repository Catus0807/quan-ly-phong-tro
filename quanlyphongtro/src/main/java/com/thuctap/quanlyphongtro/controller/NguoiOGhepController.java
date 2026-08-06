package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.NguoiOGhep;
import com.thuctap.quanlyphongtro.service.NguoiOGhepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nguoi-o-ghep")
@CrossOrigin("*")
public class NguoiOGhepController {
    @Autowired
    private NguoiOGhepService nguoiOGhepService;

    // API Thêm người ở ghép cho một Khách thuê chính
    @PostMapping("/khach/{khachId}")
    public ResponseEntity<?> themNguoiGhep(@PathVariable Long khachId, @RequestBody NguoiOGhep nguoiGhep) {
        try {
            return ResponseEntity.ok(nguoiOGhepService.themNguoiGhep(khachId, nguoiGhep));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Xóa thông tin người ở ghép
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaNguoiGhep(@PathVariable Long id) {
        try {
            nguoiOGhepService.xoaNguoiGhep(id);
            return ResponseEntity.ok("Đã xóa thông tin người ở ghép thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Sửa thông tin người ở ghép
    @PutMapping("/{id}")
    public ResponseEntity<?> suaNguoiGhep(@PathVariable Long id, @RequestBody NguoiOGhep newData) {
        try {
            return ResponseEntity.ok(nguoiOGhepService.suaNguoiGhep(id, newData));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}