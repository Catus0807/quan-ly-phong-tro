package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thong-ke")
@CrossOrigin(origins = "*")
public class ThongKeController {
    
    @Autowired
    private ThongKeService thongKeService;

    // API Lấy toàn bộ dữ liệu thống kê tổng quan (có lọc theo ID Chủ trọ và chi nhánh)
    @GetMapping("/chu-tro/{chuTroId}/tong-quan")
    public ResponseEntity<?> getThongKeTongQuan(
            @PathVariable Long chuTroId, 
            @RequestParam(required = false) Long khuVucId,
            @RequestParam(required = false) String thangNam) { // Thêm bộ lọc thời gian
        
        return ResponseEntity.ok(thongKeService.layBaoCaoTongQuan(chuTroId, khuVucId, thangNam));
    }
    
}