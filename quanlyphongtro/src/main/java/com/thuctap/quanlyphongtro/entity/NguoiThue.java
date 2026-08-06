package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Entity
@Table(name = "nguoi_thue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NguoiThue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Tên khách thuê không được để trống")
    @Column(name = "ten_khach", nullable = false)
    private String tenKhach;
    
    @NotBlank(message = "CCCD/CMND không được để trống")
    @Pattern(regexp = "^\\d{12}$", message = "Căn cước công dân phải bao gồm đúng 12 chữ số")
    // ĐÃ GỠ BỎ unique = true CHO CCCD
    @Column(name = "cccd", nullable = false) 
    private String cccd;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại phải bao gồm đúng 10 chữ số")
    // CHẮC CHẮN KHÔNG CÓ unique = true CHO SĐT
    @Column(name = "sdt")
    private String sdt;
    
    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;
    
    @Column(name = "gioi_tinh")
    private String gioiTinh; 
    
    @Column(name = "que_quan")
    private String queQuan;
    
    @NotNull(message = "Tiền cọc không được để trống")
    @Column(name = "tien_coc")
    private Long tienCoc;
    
    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;
    
    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;
    
    @Column(name = "noi_dung_hop_dong", columnDefinition = "LONGTEXT")
    private String noiDungHopDong;
    
    @Column(name = "trang_thai_gia_han")
    private String trangThaiGiaHan;
    
    @ManyToOne
    @JoinColumn(name = "phong_id", nullable = false)
    private PhongTro phongTro;
    
    @Column(name = "mat_khau")
    private String matKhau;
    
    @OneToMany(mappedBy = "nguoiThueChinh", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<NguoiOGhep> danhSachNguoiOGhep;
    
    @ManyToOne
    @JoinColumn(name = "chu_tro_id")
    private ChuTro chuTro;
}