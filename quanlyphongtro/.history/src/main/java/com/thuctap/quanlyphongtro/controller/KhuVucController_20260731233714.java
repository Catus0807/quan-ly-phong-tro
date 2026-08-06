package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.KhuVuc;
import com.thuctap.quanlyphongtro.repository.KhuVucRepository;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khu-vuc")
@CrossOrigin("*")
public class KhuVucController {

    @Autowired
    private KhuVucRepository khuVucRepository;

    @Autowired
    private ChuTroRepository chuTroRepository; // Cần dùng để gán chủ trọ

    @GetMapping
    public List<KhuVuc> getAll() {
        return khuVucRepository.findAll();
    }

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<KhuVuc>> getKhuVucByChuTro(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(khuVucRepository.findByChuTroId(chuTroId));
    }

    // ĐÃ THÊM: API Tạo mới Chi nhánh cho Chủ trọ
    @PostMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<?> createKhuVuc(@PathVariable Long chuTroId, @RequestBody KhuVuc khuVuc) {
        return chuTroRepository.findById(chuTroId).map(chuTro -> {
            khuVuc.setChuTro(chuTro);
            KhuVuc savedKhuVuc = khuVucRepository.save(khuVuc);
            return ResponseEntity.ok(savedKhuVuc);
        }).orElse(ResponseEntity.badRequest().body("Lỗi: Không tìm thấy tài khoản chủ trọ!"));
    }
}