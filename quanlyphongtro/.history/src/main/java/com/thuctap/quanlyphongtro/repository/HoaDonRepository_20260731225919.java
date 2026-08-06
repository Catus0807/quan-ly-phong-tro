package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    
    Optional<HoaDon> findTopByPhongTroIdOrderByIdDesc(Long phongId);
    
    List<HoaDon> findByPhongTroId(Long phongId);
    
    @Query("SELECT h FROM HoaDon h WHERE h.phongTro.khuVuc.id = :khuVucId")
    List<HoaDon> findByKhuVucId(@Param("khuVucId") Long khuVucId);

    List<HoaDon> findByTrangThai(String trangThai);
    
    List<HoaDon> findByTrangThaiAndThangThu(String trangThai, String thangThu);

    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU'")
    Long sumTienNo();
    
    // ĐÃ SỬA: Lọc doanh thu theo Chủ Trọ
    @Query("SELECT h.thangThu, SUM(h.tongTien) FROM HoaDon h WHERE h.trangThai = 'DA_THU' AND h.phongTro.chuTro.id = :chuTroId GROUP BY h.thangThu ORDER BY h.thangThu ASC")
    List<Object[]> thongKeDoanhThuTheoChuTroId(@Param("chuTroId") Long chuTroId);
    
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND (:khuVucId IS NULL OR h.phongTro.khuVuc.id = :khuVucId)")
    Long sumTienNoTheoKhuVucId(@Param("khuVucId") Long khuVucId);
    
    // ĐÃ SỬA: Lọc doanh thu theo Chủ trọ + Chi nhánh
    @Query("SELECT h.thangThu, SUM(h.tongTien) FROM HoaDon h WHERE h.trangThai = 'DA_THU' AND h.phongTro.chuTro.id = :chuTroId AND (:khuVucId IS NULL OR h.phongTro.khuVuc.id = :khuVucId) GROUP BY h.thangThu ORDER BY h.thangThu ASC")
    List<Object[]> thongKeDoanhThuTheoChuTroIdVaKhuVucId(@Param("chuTroId") Long chuTroId, @Param("khuVucId") Long khuVucId);
    
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.phongTro.chuTro.id = :chuTroId AND h.trangThai = 'DA_THU' AND YEAR(h.ngayLap) = :nam")
    Long tinhTongDoanhThuTheoNam(@Param("chuTroId") Long chuTroId, @Param("nam") int nam);
    
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu = :thangThu AND h.phongTro.chuTro.id = :chuTroId")
    Long sumTienNoTheoThang(@Param("chuTroId") Long chuTroId, @Param("thangThu") String thangThu);

    // ĐÃ SỬA: Lọc nợ cước theo Chủ trọ + Chi nhánh
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu = :thangThu AND h.phongTro.chuTro.id = :chuTroId AND h.phongTro.khuVuc.id = :khuVucId")
    Long sumTienNoTheoThangVaKhuVuc(@Param("chuTroId") Long chuTroId, @Param("khuVucId") Long khuVucId, @Param("thangThu") String thangThu);

    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu LIKE %:nam AND h.phongTro.chuTro.id = :chuTroId")
    Long sumTienNoTheoNamThucTe(@Param("chuTroId") Long chuTroId, @Param("nam") String nam);

    // ĐÃ SỬA: Lọc nợ cước năm theo Chủ trọ + Chi nhánh
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu LIKE %:nam AND h.phongTro.chuTro.id = :chuTroId AND h.phongTro.khuVuc.id = :khuVucId")
    Long sumTienNoTheoNamVaKhuVuc(@Param("chuTroId") Long chuTroId, @Param("khuVucId") Long khuVucId, @Param("nam") String nam);
}