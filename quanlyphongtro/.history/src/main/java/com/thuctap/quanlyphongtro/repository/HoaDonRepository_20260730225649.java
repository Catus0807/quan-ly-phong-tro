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
    
    // Tìm hóa đơn mới nhất của một phòng dựa vào ID phòng
    Optional<HoaDon> findTopByPhongTroIdOrderByIdDesc(Long phongId);
    
    // Lấy danh sách hóa đơn theo ID phòng
    List<HoaDon> findByPhongTroId(Long phongId);
    
    // Lọc danh sách hóa đơn theo ID Khu Vực
    @Query("SELECT h FROM HoaDon h WHERE h.phongTro.khuVuc.id = :khuVucId")
    List<HoaDon> findByKhuVucId(@Param("khuVucId") Long khuVucId);

    // Tìm danh sách hóa đơn theo trạng thái (Dùng cho nhắc nợ chung chung)
    List<HoaDon> findByTrangThai(String trangThai);
    
    // Tìm hóa đơn theo trạng thái và tháng
    List<HoaDon> findByTrangThaiAndThangThu(String trangThai, String thangThu);

    // Tính tổng tiền nợ toàn hệ thống (Hóa đơn ở trạng thái CHUA_THU)
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU'")
    Long sumTienNo();
    
    // Thống kê biểu đồ doanh thu toàn hệ thống (Hóa đơn DA_THU) gom theo tháng
    @Query("SELECT h.thangThu, SUM(h.tongTien) FROM HoaDon h WHERE h.trangThai = 'DA_THU' GROUP BY h.thangThu ORDER BY h.thangThu ASC")
    List<Object[]> thongKeDoanhThu();
    
    // Tính tổng tiền nợ theo từng chi nhánh cụ thể
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND (:khuVucId IS NULL OR h.phongTro.khuVuc.id = :khuVucId)")
    Long sumTienNoTheoKhuVucId(@Param("khuVucId") Long khuVucId);
    
    // Thống kê biểu đồ doanh thu theo từng chi nhánh (Hóa đơn DA_THU) gom theo tháng
    @Query("SELECT h.thangThu, SUM(h.tongTien) FROM HoaDon h WHERE h.trangThai = 'DA_THU' AND (:khuVucId IS NULL OR h.phongTro.khuVuc.id = :khuVucId) GROUP BY h.thangThu ORDER BY h.thangThu ASC")
    List<Object[]> thongKeDoanhThuTheoKhuVucId(@Param("khuVucId") Long khuVucId);
    
    // Tính tổng doanh thu của 1 chủ trọ trong 1 năm cụ thể (Dựa vào các hóa đơn ĐÃ THU)
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.phongTro.chuTro.id = :chuTroId AND h.trangThai = 'DA_THU' AND YEAR(h.ngayLap) = :nam")
    Long tinhTongDoanhThuTheoNam(@Param("chuTroId") Long chuTroId, @Param("nam") int nam);
    
    // Tính nợ của 1 tháng cụ thể (Toàn bộ chi nhánh)
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu = :thangThu AND h.phongTro.chuTro.id = :chuTroId")
    Long sumTienNoTheoThang(@Param("chuTroId") Long chuTroId, @Param("thangThu") String thangThu);

    // Tính nợ của 1 tháng cụ thể (Theo từng chi nhánh)
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu = :thangThu AND h.phongTro.khuVuc.id = :khuVucId")
    Long sumTienNoTheoThangVaKhuVuc(@Param("khuVucId") Long khuVucId, @Param("thangThu") String thangThu);

    // Tính nợ của cả 1 năm (Dành cho nút gạt "Xem Cả Năm" - Toàn hệ thống)
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu LIKE %:nam AND h.phongTro.chuTro.id = :chuTroId")
    Long sumTienNoTheoNamThucTe(@Param("chuTroId") Long chuTroId, @Param("nam") String nam);

    // Tính nợ của cả 1 năm (Dành cho nút gạt "Xem Cả Năm" - Theo từng chi nhánh)
    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE h.trangThai = 'CHUA_THU' AND h.thangThu LIKE %:nam AND h.phongTro.khuVuc.id = :khuVucId")
    Long sumTienNoTheoNamVaKhuVuc(@Param("khuVucId") Long khuVucId, @Param("nam") String nam);

}