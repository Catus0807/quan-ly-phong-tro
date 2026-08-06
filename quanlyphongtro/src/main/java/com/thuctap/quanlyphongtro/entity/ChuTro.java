package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "chu_tro")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChuTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String tenDangNhap; 
    
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String matKhau;
    
    private String hoTen;
    private String cccd;
    private String sdt;
    private String diaChi;
    
    @Column(name = "email")
    private String email; 
    
    @Column(name = "trang_thai")
    private String trangThai;
}