package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import com.thuctap.quanlyphongtro.entity.KhuVuc;
import com.thuctap.quanlyphongtro.repository.KhuVucRepository;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/khu-vuc")
@CrossOrigin("*")
public class KhuVucController {

    @Autowired
    private KhuVucRepository khuVucRepository;

    @Autowired
    private ChuTroRepository chuTroRepository;

    @GetMapping
    public List<KhuVuc> getAll() {
        return khuVucRepository.findAll();
    }

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<KhuVuc>> getKhuVucByChuTro(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(khuVucRepository.findByChuTroId(chuTroId));
    }

    // API Thêm mới một khu vực CỦA 1 CHỦ TRỌ
    @PostMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<?> createKhuVuc(@PathVariable Long chuTroId, @RequestBody KhuVuc khuVuc) {
        Optional<ChuTro> chuTroOpt = chuTroRepository.findById(chuTroId);
        
        if (chuTroOpt.isPresent()) {
            khuVuc.setChuTro(chuTroOpt.get());
            KhuVuc savedKhuVuc = khuVucRepository.save(khuVuc);
            return ResponseEntity.ok(savedKhuVuc);
        } else {
            return ResponseEntity.badRequest().body("Lỗi: Không tìm thấy tài khoản chủ trọ!");
        }
    }

    // API Cập nhật (Sửa) thông tin Chi nhánh
    @PutMapping("/{id}")
    public ResponseEntity<?> updateKhuVuc(@PathVariable Long id, @RequestBody KhuVuc thongTinMoi) {
        Optional<KhuVuc> opt = khuVucRepository.findById(id);
        if (opt.isPresent()) {
            KhuVuc kv = opt.get();
            kv.setTenKhuVuc(thongTinMoi.getTenKhuVuc());
            kv.setDiaChi(thongTinMoi.getDiaChi());
            kv.setMoTa(thongTinMoi.getMoTa());
            return ResponseEntity.ok(khuVucRepository.save(kv));
        }
        return ResponseEntity.badRequest().body("Lỗi: Không tìm thấy chi nhánh cần sửa!");
    }
}