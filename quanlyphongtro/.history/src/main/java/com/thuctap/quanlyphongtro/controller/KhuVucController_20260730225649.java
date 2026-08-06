package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.KhuVuc;
import com.thuctap.quanlyphongtro.repository.KhuVucRepository;
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

    @GetMapping
    public List<KhuVuc> getAll() {
        return khuVucRepository.findAll();
    }

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<KhuVuc>> getKhuVucByChuTro(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(khuVucRepository.findByChuTroId(chuTroId));
    }
}