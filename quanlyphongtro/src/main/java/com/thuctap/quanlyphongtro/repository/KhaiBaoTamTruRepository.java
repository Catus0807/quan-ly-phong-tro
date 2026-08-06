package com.thuctap.quanlyphongtro.repository;

import com.thuctap.quanlyphongtro.entity.KhaiBaoTamTru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhaiBaoTamTruRepository extends JpaRepository<KhaiBaoTamTru, Long> {
    
    // Tìm toàn bộ tờ khai của một khách thuê cụ thể
    List<KhaiBaoTamTru> findByNguoiThueId(Long nguoiThueId);
    
    // Lọc danh sách tờ khai theo trạng thái 
    List<KhaiBaoTamTru> findByTrangThai(String trangThai);

    // Lấy toàn bộ tờ khai CỦA 1 CHỦ TRỌ
    @Query("SELECT k FROM KhaiBaoTamTru k WHERE k.nguoiThue.chuTro.id = :chuTroId")
    List<KhaiBaoTamTru> findByChuTroId(@Param("chuTroId") Long chuTroId);

    // Lọc tờ khai theo trạng thái CỦA 1 CHỦ TRỌ (VD: Tìm tờ khai chờ xử lý của Chủ trọ A)
    @Query("SELECT k FROM KhaiBaoTamTru k WHERE k.nguoiThue.chuTro.id = :chuTroId AND k.trangThai = :trangThai")
    List<KhaiBaoTamTru> findByChuTroIdAndTrangThai(@Param("chuTroId") Long chuTroId, @Param("trangThai") String trangThai);

    @Query("SELECT t FROM KhaiBaoTamTru t WHERE t.nguoiThue.chuTro.id = :chuTroId AND t.nguoiThue.phongTro.khuVuc.id = :khuVucId")
    List<KhaiBaoTamTru> findByChuTroIdAndKhuVucId(@Param("chuTroId") Long chuTroId, @Param("khuVucId") Long khuVucId);
}