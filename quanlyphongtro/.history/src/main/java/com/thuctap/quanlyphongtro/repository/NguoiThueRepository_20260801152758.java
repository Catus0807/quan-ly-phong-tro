package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.NguoiThue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import java.time.LocalDate;

@Repository
public interface NguoiThueRepository extends JpaRepository<NguoiThue, Long> {
    
    // Lấy toàn bộ khách của 1 chủ trọ
    List<NguoiThue> findByChuTroId(Long chuTroId);

    // Tìm khách thuê dựa vào ID phòng
    List<NguoiThue> findByPhongTro_Id(Long phongId);

    // Lọc khách thuê theo địa chỉ chi nhánh CỦA 1 CHỦ TRỌ
    @Query("SELECT n FROM NguoiThue n WHERE n.chuTro.id = :chuTroId AND n.phongTro.khuVuc.id = :khuVucId")
    List<NguoiThue> findByChuTroIdAndKhuVucId(@Param("chuTroId") Long chuTroId, @Param("khuVucId") Long khuVucId);
    
    Optional<NguoiThue> findBySdtAndMatKhau(String sdt, String matKhau);

    List<NguoiThue> findByNgayKetThucBetween(LocalDate tuNgay, LocalDate denNgay);

    boolean existsByCccd(String cccd);
    boolean existsBySdt(String sdt);

    List<NguoiThue> findByChuTroIdAndTrangThaiGiaHan(Long chuTroId, String trangThaiGiaHan);

    // Thêm hàm này vào trong interface NguoiThueRepository
    Optional findFirstByCccdOrderByIdDesc(String cccd);
    Optional findFirstBySdtOrderByIdDesc(String sdt);
}