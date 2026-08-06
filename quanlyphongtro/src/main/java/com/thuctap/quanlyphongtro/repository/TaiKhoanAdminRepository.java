package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.TaiKhoanAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaiKhoanAdminRepository extends JpaRepository<TaiKhoanAdmin, Long> {
    // Tìm tài khoản admin dựa trên tên đăng nhập
    Optional<TaiKhoanAdmin> findByUsername(String username);
}