package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.HoSoThue;
import com.thuctap.quanlyphongtro.service.HoSoThueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thue")
@CrossOrigin("*")
public class HoSoThueController {

    @Autowired
    private HoSoThueService hoSoThueService;

    // Lấy lịch sử nộp thuế của Chủ trọ
    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<HoSoThue>> layLichSuThue(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(hoSoThueService.layLichSuThue(chuTroId));
    }

    // Bấm nút "Đồng bộ doanh thu năm nay"
    @PostMapping("/chu-tro/{chuTroId}/dong-bo")
    public ResponseEntity<?> dongBoVaTinhThue(@PathVariable Long chuTroId, @RequestParam int nam) {
        try {
            return ResponseEntity.ok(hoSoThueService.dongBoDoanhThuVaTinhThue(chuTroId, nam));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Bấm nút "Xác nhận đã Khai báo" 
    @PutMapping("/{id}/trang-thai")
    public ResponseEntity<?> capNhatTrangThai(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(hoSoThueService.capNhatTrangThai(id, request.get("trangThai")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}