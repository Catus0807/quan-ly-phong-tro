package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "ho_so_thue")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoSoThue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "chu_tro_id", nullable = false)
    private ChuTro chuTro;
    
    private int nam; // Năm tính thuế (VD: 2026)
    
    @Column(name = "tong_doanh_thu")
    private Long tongDoanhThu;
    
    @Column(name = "thue_gtgt")
    private Long thueGTGT;
    
    @Column(name = "thue_tncn")
    private Long thueTNCN;
    
    @Column(name = "tong_thue")
    private Long tongThue;
    
    // Trạng thái: "CHUA_KHAI_BAO", "DA_KHAI_BAO", "DA_NOP_THUE"
    private String trangThai; 
    
    @Column(name = "ngay_cap_nhat")
    private LocalDate ngayCapNhat;
}