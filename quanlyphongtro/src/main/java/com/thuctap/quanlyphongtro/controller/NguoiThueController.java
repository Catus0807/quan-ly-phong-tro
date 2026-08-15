package com.thuctap.quanlyphongtro.controller;

import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import com.thuctap.quanlyphongtro.service.NguoiThueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nguoi-thue")
@CrossOrigin(origins = "*")
public class NguoiThueController {

    @Autowired
    private NguoiThueService nguoiThueService;
    
    @Autowired
    private ChuTroRepository chuTroRepository;

    @GetMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<List<NguoiThue>> getAllNguoiThue(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(nguoiThueService.getAllNguoiThue(chuTroId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layKhachTheoId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(nguoiThueService.getKhachTheoId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/chu-tro/{chuTroId}/loc-chi-nhanh")
    public ResponseEntity<List<NguoiThue>> locTheoChiNhanh(@PathVariable Long chuTroId, @RequestParam Long khuVucId) {
        return ResponseEntity.ok(nguoiThueService.locTheoChiNhanh(chuTroId, khuVucId));
    }

    @PostMapping("/chu-tro/{chuTroId}")
    public ResponseEntity<?> createNguoiThue(@PathVariable Long chuTroId, @Valid @RequestBody NguoiThue nguoiThue) {
        return chuTroRepository.findById(chuTroId).map(chuTro -> {
            try {
                nguoiThue.setChuTro(chuTro);
                NguoiThue saved = nguoiThueService.createNguoiThue(nguoiThue);
                return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            } 
            catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.badRequest().body("Lỗi hệ thống: Căn cước công dân hoặc Số điện thoại này đã tồn tại!");
            } 
            catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            } 
            catch (Exception e) {
                return ResponseEntity.internalServerError().body("Lỗi máy chủ: " + e.getMessage());
            }
        }).orElse(ResponseEntity.badRequest().body("Không tìm thấy dữ liệu Chủ trọ!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNguoiThue(@PathVariable Long id, @RequestBody NguoiThue nguoiThue) {
        try {
            NguoiThue updated = nguoiThueService.updateNguoiThue(id, nguoiThue);
            return ResponseEntity.ok(updated);
        } 
        catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Cập nhật thất bại: CCCD hoặc Số điện thoại bị trùng với người khác!");
        } 
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/gui-yeu-cau-gia-han")
    public ResponseEntity<?> guiYeuCauGiaHan(
            @PathVariable Long id, 
            @RequestParam boolean isGiaHan, 
            @RequestParam(required = false, defaultValue = "0") int soThang) {
        try {
            nguoiThueService.guiYeuCauGiaHan(id, isGiaHan, soThang);
            return ResponseEntity.ok("Đã gửi phản hồi đến chủ trọ!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNguoiThue(@PathVariable Long id) {
        try {
            nguoiThueService.deleteNguoiThue(id);
            return ResponseEntity.ok("Đã xóa khách thuê thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/tao-tai-khoan")
    public ResponseEntity<?> capTaiKhoan(@PathVariable Long id, @RequestBody String matKhau) {
        try {
            nguoiThueService.capTaiKhoan(id, matKhau);
            return ResponseEntity.ok("Đã cấp tài khoản thành công! Tên đăng nhập là Số điện thoại của khách.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/doi-mat-khau")
    public ResponseEntity<?> doiMatKhau(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            nguoiThueService.doiMatKhau(id, request.get("matKhauCu"), request.get("matKhauMoi"));
            return ResponseEntity.ok("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/khach-tu-cap-nhat/{id}")
    public ResponseEntity<?> khachTuCapNhat(@PathVariable Long id, @RequestBody NguoiThue thongTinMoi) {
        try {
            NguoiThue updated = nguoiThueService.khachTuCapNhat(id, thongTinMoi);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/chu-tro/{chuTroId}/kiem-tra-danh-tinh")
    public ResponseEntity<?> kiemTraDanhTinhThongMinh(
            @PathVariable Long chuTroId, 
            @RequestParam(required = false) String cccd,
            @RequestParam(required = false) String sdt) {
        
        return ResponseEntity.ok(nguoiThueService.kiemTraDanhTinhThongMinh(chuTroId, cccd, sdt));
    }

    @PostMapping("/{id}/bao-tra-phong")
    public ResponseEntity<?> baoTraPhong(@PathVariable Long id, @RequestParam String ngayChuyen) {
        try {
            nguoiThueService.xuLyBaoTraPhong(id, ngayChuyen);
            return ResponseEntity.ok("Gửi yêu cầu trả phòng thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/huy-bao-tra-phong")
    public ResponseEntity<?> huyBaoTraPhong(@PathVariable Long id) {
        try {
            nguoiThueService.huyBaoTraPhong(id);
            return ResponseEntity.ok("Đã hủy thông báo chuyển trọ!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/phan-hoi-yeu-cau")
    public ResponseEntity<?> phanHoiYeuCau(
            @PathVariable Long id,
            @RequestParam boolean isChapNhan,
            @RequestParam String lyDo) {
        try {
            nguoiThueService.phanHoiYeuCau(id, isChapNhan, lyDo);
            return ResponseEntity.ok("Đã gửi phản hồi cho khách thuê!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/chu-tro/{chuTroId}/lich-su-thanh-ly")
    public ResponseEntity<List<NguoiThue>> getLichSuThanhLy(@PathVariable Long chuTroId) {
        return ResponseEntity.ok(nguoiThueService.getLichSuThanhLy(chuTroId));
    }

    //  XÁC NHẬN GIA HẠN HỢP ĐỒNG 
    @PutMapping("/{id}/gia-han")
    public ResponseEntity<?> giaHanHopDong(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String ngayKetThucMoi = payload.get("ngayKetThucMoi");
            String phuLucHtml = payload.get("phuLucHtml");
            
            nguoiThueService.giaHanHopDong(id, ngayKetThucMoi, phuLucHtml);
            
            return ResponseEntity.ok("Đã gia hạn và tạo phụ lục thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}