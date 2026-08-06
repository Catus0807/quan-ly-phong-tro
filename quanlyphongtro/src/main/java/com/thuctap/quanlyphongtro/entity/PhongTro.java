package com.thuctap.quanlyphongtro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity // Đánh dấu class này là một Entity (thực thể) để map với bảng trong database
@Table(name = "phong_tro") // Tên bảng sẽ được tạo trong MySQL
@Data // Của Lombok: Tự động sinh ra các hàm Getter, Setter, toString...
@NoArgsConstructor // Của Lombok: Tự động tạo hàm khởi tạo (constructor) không tham số
@AllArgsConstructor // Của Lombok: Tự động tạo hàm khởi tạo có đầy đủ tham số
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PhongTro {

    @Id // Khóa chính (Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Khóa chính tự động tăng (Auto Increment)
    private Long id;

    // Luật: Không được để trống
    @NotBlank(message = "Số phòng không được để trống")
    @Column(name = "so_phong", nullable = false, length = 50)
    private String soPhong;

    @Column(name = "dien_tich")
    private Double dienTich;

    // Luật: Không được để trống và phải >= 0
    @NotNull(message = "Giá thuê không được để trống")
    @Min(value = 0, message = "Giá thuê không được là số âm")
    @Column(name = "gia_thue")
    private Long giaThue; // Dùng Long thay vì Double cho tiền VNĐ để tránh sai số
    
    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "trang_thai")
    private String trangThai; // Ví dụ: "TRỐNG", "ĐÃ THUÊ", "ĐANG BẢO TRÌ"

    // Liên kết Phòng với Khu Vực
    @ManyToOne
    @JoinColumn(name = "khu_vuc_id")
    @JsonIgnoreProperties({"danhSachPhongTro", "chuTro", "hibernateLazyInitializer", "handler"})
    private KhuVuc khuVuc;

    @ManyToOne
    @JoinColumn(name = "chu_tro_id")
    private ChuTro chuTro;
}