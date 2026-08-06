package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tháng thu tiền (Ví dụ: "07/2026")
    @Column(name = "thang_thu")
    private String thangThu;

    // Ngày xuất hóa đơn
    @Column(name = "ngay_lap")
    private LocalDate ngayLap;

    // ĐIỆN 
    @Column(name = "so_dien_cu")
    private Integer soDienCu;

    @Column(name = "so_dien_moi")
    private Integer soDienMoi;

    @Column(name = "gia_dien")
    private Long giaDien;

    // NƯỚC 
    @Column(name = "so_nuoc_cu")
    private Integer soNuocCu;

    @Column(name = "so_nuoc_moi")
    private Integer soNuocMoi;

    @Column(name = "gia_nuoc")
    private Long giaNuoc;

    // CÁC KHOẢN KHÁC 
    @Column(name = "tien_phong")
    private Long tienPhong; // Lấy từ phòng trọ 

    @Column(name = "phu_phi")
    private Long phuPhi; // Tiền rác, mạng, vệ sinh...

    @Column(name = "tong_tien")
    private Long tongTien;

    // Trạng thái: CHUA_THU hoặc DA_THU
    @Column(name = "trang_thai")
    private String trangThai;

    @ManyToOne
    @JoinColumn(name = "phong_id", nullable = false)
    @JsonIgnoreProperties({"chuTro", "hibernateLazyInitializer", "handler"}) // Lấy phòng, nhưng không đào sâu vào khu vực/chủ trọ của phòng
    private PhongTro phongTro;

    @ManyToOne
    @JoinColumn(name = "chu_tro_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ChuTro chuTro;
}