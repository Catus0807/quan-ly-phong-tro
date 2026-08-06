package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.HoaDon;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import com.thuctap.quanlyphongtro.service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
@CrossOrigin("*")
public class HoaDonController {
    @Autowired
    private HoaDonService hoaDonService;
    @Autowired
    private HoaDonRepository hoaDonRepository;

    // API Lấy danh sách toàn bộ hóa đơn
    @GetMapping
    public ResponseEntity<List<HoaDon>> getAll() {
        return ResponseEntity.ok(hoaDonService.getAll());
    }

    // API Lập hóa đơn mới
    @PostMapping
    public ResponseEntity<?> create(@RequestBody HoaDon hoaDon) {
        try { return ResponseEntity.ok(hoaDonService.createOrUpdate(hoaDon, null)); } 
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // API Cập nhật hóa đơn đã có
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody HoaDon hoaDon) {
        try { return ResponseEntity.ok(hoaDonService.createOrUpdate(hoaDon, id)); } 
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // API Xóa hóa đơn
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            hoaDonService.delete(id);
            return ResponseEntity.ok("Đã xóa hóa đơn thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Lấy hóa đơn gần nhất của một phòng
    @GetMapping("/phong/{phongId}/latest")
    public ResponseEntity<?> getLatestByPhong(@PathVariable Long phongId) {
        return ResponseEntity.ok(hoaDonService.getLatestByPhong(phongId));
    }

    // API Lấy danh sách hóa đơn của một khách thuê
    @GetMapping("/khach/{khachId}")
    public ResponseEntity<?> layHoaDonTheoKhach(@PathVariable Long khachId) {
        try { return ResponseEntity.ok(hoaDonService.layHoaDonTheoKhach(khachId)); } 
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // API Lọc danh sách hóa đơn theo chi nhánh
    @GetMapping("/loc-chi-nhanh")
    public ResponseEntity<List<HoaDon>> locTheoChiNhanh(@RequestParam Long khuVucId) {
        return ResponseEntity.ok(hoaDonService.locTheoChiNhanh(khuVucId));
    }

    // API Thống kê doanh thu các tháng (Toàn hệ thống)
    @GetMapping("/thong-ke")
    public ResponseEntity<List<Object[]>> getThongKe() {
        return ResponseEntity.ok(hoaDonRepository.thongKeDoanhThu());
    }

    // API Thống kê doanh thu các tháng (Theo chi nhánh)
    @GetMapping("/thong-ke-chi-nhanh")
    public ResponseEntity<List<Object[]>> getThongKeTheoChiNhanh(@RequestParam Long khuVucId) {
        return ResponseEntity.ok(hoaDonRepository.thongKeDoanhThuTheoKhuVucId(khuVucId));
    }

    // API Lấy danh sách hóa đơn dựa theo ID Phòng Trọ
    @GetMapping("/phong/{phongId}")
    public ResponseEntity<?> getHoaDonByPhongId(@PathVariable Long phongId) {
        try {
            // hoaDonRepository đã có sẵn hàm findByPhongTroId ở Code_2.docx
            return ResponseEntity.ok(hoaDonRepository.findByPhongTroId(phongId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
}