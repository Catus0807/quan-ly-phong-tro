package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    // Lấy danh sách thông báo mới nhất
    List<ThongBao> findByLoaiNguoiNhanAndNguoiNhanIdOrderByNgayTaoDesc(String loaiNguoiNhan, Long nguoiNhanId);
    
    // Đếm số chuông chưa đọc
    long countByLoaiNguoiNhanAndNguoiNhanIdAndDaDocFalse(String loaiNguoiNhan, Long nguoiNhanId);
    
    // Xóa thông báo
    @Transactional
    void deleteByLoaiNguoiNhanAndNguoiNhanId(String loaiNguoiNhan, Long nguoiNhanId);
}