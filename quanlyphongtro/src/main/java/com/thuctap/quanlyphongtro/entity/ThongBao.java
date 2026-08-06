package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "thong_bao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tieuDe;
    private String noiDung;
    
    // Phân loại: "CHU_TRO" hoặc "KHACH_THUE"
    private String loaiNguoiNhan; 
    
    // ID của Chủ trọ hoặc ID của Khách thuê
    private Long nguoiNhanId; 
    
    // Phân loại: "HOA_DON", "HOP_DONG", "SU_CO", "TAM_TRU", "HE_THONG"
    private String loaiThongBao; 
    
    private boolean daDoc = false;
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    @Column(name = "tham_chieu_id")
    private Long thamChieuId;
}