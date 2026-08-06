package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "khu_vuc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KhuVuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_khu_vuc", nullable = false)
    private String tenKhuVuc; // Ví dụ: Cơ sở 1 - Cầu Giấy, Tòa A...

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "mo_ta")
    private String moTa;

    // LIÊN KẾT VỚI CHỦ TRỌ
    @ManyToOne
    @JoinColumn(name = "chu_tro_id")
    private ChuTro chuTro;
}