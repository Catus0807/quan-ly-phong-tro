package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tai_khoan_admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoanAdmin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    
    @Column(name = "ho_ten")
    private String hoTen;
    
    @Column(name = "cccd")
    private String cccd;
    
    @Column(name = "sdt")
    private String sdt;
}