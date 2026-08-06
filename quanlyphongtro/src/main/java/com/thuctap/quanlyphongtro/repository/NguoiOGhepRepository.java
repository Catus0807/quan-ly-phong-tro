package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.NguoiOGhep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NguoiOGhepRepository extends JpaRepository<NguoiOGhep, Long> {
    
    // Hàm đếm số lượng người ở ghép theo ID người thuê chính
    long countByNguoiThueChinhId(Long nguoiThueId);

    boolean existsByCccd(String cccd);
    boolean existsBySdt(String sdt);
}