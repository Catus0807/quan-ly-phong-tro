package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.ThongBao;
import com.thuctap.quanlyphongtro.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thong-bao")
@CrossOrigin("*")
public class ThongBaoController {
    
    @Autowired
    private ThongBaoService thongBaoService;

    // API tải toàn bộ thông báo của 1 người
    @GetMapping("/{loaiNguoiNhan}/{nguoiNhanId}")
    public ResponseEntity<List<ThongBao>> layThongBao(@PathVariable String loaiNguoiNhan, @PathVariable Long nguoiNhanId) {
        return ResponseEntity.ok(thongBaoService.layDanhSachThongBao(loaiNguoiNhan, nguoiNhanId));
    }

    // API lấy con số màu đỏ gắn lên chuông
    @GetMapping("/{loaiNguoiNhan}/{nguoiNhanId}/chua-doc")
    public ResponseEntity<?> demChuaDoc(@PathVariable String loaiNguoiNhan, @PathVariable Long nguoiNhanId) {
        long count = thongBaoService.demThongBaoChuaDoc(loaiNguoiNhan, nguoiNhanId);
        return ResponseEntity.ok(Map.of("soLuong", count));
    }

    // API click vào để tắt bôi đậm (đã đọc)
    @PutMapping("/{id}/da-doc")
    public ResponseEntity<?> danhDauDaDoc(@PathVariable Long id) {
        thongBaoService.danhDauDaDoc(id);
        return ResponseEntity.ok("Đã đánh dấu đọc");
    }

    // API Xóa 1 thông báo
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaThongBao(@PathVariable Long id) {
        thongBaoService.xoaThongBao(id);
        return ResponseEntity.ok("Đã xóa thông báo!");
    }

    // API Xóa tất cả thông báo
    @DeleteMapping("/{loaiNguoiNhan}/{nguoiNhanId}/xoa-tat-ca")
    public ResponseEntity<?> xoaTatCaThongBao(@PathVariable String loaiNguoiNhan, @PathVariable Long nguoiNhanId) {
        thongBaoService.xoaTatCaThongBao(loaiNguoiNhan, nguoiNhanId);
        return ResponseEntity.ok("Đã dọn dẹp tất cả thông báo!");
    }
}