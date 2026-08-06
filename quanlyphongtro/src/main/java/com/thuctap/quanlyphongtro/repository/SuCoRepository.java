package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.SuCo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface SuCoRepository extends JpaRepository<SuCo, Long> {
    // Lọc sự cố theo địa chỉ phòng
    @Query("SELECT s FROM SuCo s WHERE s.phongTro.khuVuc.id = :khuVucId")
    List<SuCo> findByKhuVucId(@Param("khuVucId") Long khuVucId);

    List<SuCo> findByPhongTroIdOrderByIdDesc(Long phongId);

    // Lấy sự cố theo chi nhánh
    @Query("SELECT s FROM SuCo s WHERE (:khuVucId IS NULL OR s.phongTro.khuVuc.id = :khuVucId)")
    List<SuCo> findAllByKhuVucId(@Param("khuVucId") Long khuVucId);
}