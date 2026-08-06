package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "su_co")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuCo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chi_nhanh")
    private String chiNhanh; // Lưu khu vực (VD: Cơ sở 1, Cơ sở 2...)

    @Column(name = "vi_tri")
    private String viTri; // Lưu số phòng (101) hoặc tên khu vực (Hành lang, Nhà xe)

    @Column(name = "ten_su_co")
    private String tenSuCo;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "ngay_bao")
    private LocalDate ngayBao;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "chi_phi_tong")
    private Long chiPhiTong;

    @Column(name = "chi_phi_nguoi_thue")
    private Long chiPhiNguoiThue;

    @Column(name = "mien_phi")
    private Boolean mienPhi;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    @JsonIgnoreProperties({"chuTro", "hibernateLazyInitializer", "handler"}) 
    private PhongTro phongTro;

    @ManyToOne
    @JoinColumn(name = "chu_tro_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ChuTro chuTro;
}