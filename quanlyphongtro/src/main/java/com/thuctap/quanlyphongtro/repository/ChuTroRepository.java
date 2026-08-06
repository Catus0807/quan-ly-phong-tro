package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChuTroRepository extends JpaRepository<ChuTro, Long> {
    List<ChuTro> findByTrangThai(String trangThai);

    // Hàm dùng để kiểm tra đăng nhập
    Optional<ChuTro> findByTenDangNhap(String tenDangNhap);
    
    // Hàm dùng để kiểm tra trùng lặp khi đăng ký
    boolean existsByTenDangNhap(String tenDangNhap);
}