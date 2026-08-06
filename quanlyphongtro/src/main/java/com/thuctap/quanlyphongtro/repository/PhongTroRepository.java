package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.PhongTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List; 

@Repository
public interface PhongTroRepository extends JpaRepository<PhongTro, Long> {
    
    // Các hàm truy vấn dữ liệu theo chủ trọ
    List<PhongTro> findByChuTroId(Long chuTroId);
    
    List<PhongTro> findByChuTroIdAndGiaThueBetween(Long chuTroId, Long min, Long max);
    
    List<PhongTro> findByChuTroIdAndTrangThai(Long chuTroId, String trangThai);

    List<PhongTro> findByChuTroIdAndKhuVuc_Id(Long chuTroId, Long khuVucId);
    
    List<PhongTro> findByChuTroIdAndSoPhongContainingIgnoreCase(Long chuTroId, String soPhong);
    
    List<PhongTro> findByChuTroIdAndDiaChiContainingIgnoreCase(Long chuTroId, String diaChi);
    
    @Query("SELECT DISTINCT p.diaChi FROM PhongTro p WHERE p.chuTro.id = :chuTroId AND p.diaChi IS NOT NULL AND p.diaChi != ''")
    List<String> findDistinctDiaChiByChuTroId(@Param("chuTroId") Long chuTroId);


    // Các hàm thống kê
    @Query("SELECT COUNT(p) FROM PhongTro p WHERE p.chuTro.id = :chuTroId AND p.trangThai = :trangThai")
    long countByChuTroIdAndTrangThai(@Param("chuTroId") Long chuTroId, @Param("trangThai") String trangThai);

    @Query("SELECT COUNT(p) FROM PhongTro p WHERE p.chuTro.id = :chuTroId AND (:khuVucId IS NULL OR p.khuVuc.id = :khuVucId) AND p.trangThai = :trangThai")
    long countByChuTroIdAndTrangThaiAndKhuVucId(@Param("chuTroId") Long chuTroId, @Param("trangThai") String trangThai, @Param("khuVucId") Long khuVucId);
}