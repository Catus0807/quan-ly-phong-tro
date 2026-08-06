package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "khai_bao_tam_tru")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhaiBaoTamTru {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "nguoi_thue_id")
    private NguoiThue nguoiThue;
    
    private String hoTen;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngaySinh;
    
    private String gioiTinh;
    private String cccd;
    private String sdt;
    
    @Column(name = "thuong_tru") 
    private String thuongTru;
    
    @Column(name = "cho_o_hien_tai") 
    private String choOHienTai;
    
    private String ngheNghiep;
    private String noiLamViec;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayKhai;
    
    private String trangThai; 
}