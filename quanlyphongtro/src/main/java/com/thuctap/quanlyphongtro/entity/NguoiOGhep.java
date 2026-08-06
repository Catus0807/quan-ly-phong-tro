package com.thuctap.quanlyphongtro.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nguoi_o_ghep")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NguoiOGhep {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String ten;
    private String cccd;
    private String sdt;
    private String ngaySinh;
    private String gioiTinh;
    private String queQuan;

    // Liên kết n-1: Nhiều người ở ghép phụ thuộc vào 1 người thuê chính (người ký Hợp đồng)
    @ManyToOne
    @JoinColumn(name = "nguoi_thue_id", nullable = false)
    @JsonIgnore 
    private NguoiThue nguoiThueChinh;
}