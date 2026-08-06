package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.PhongTro;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service 
public class PhongTroService {
    
    @Autowired
    private PhongTroRepository phongTroRepository;

    // Lấy danh sách toàn bộ phòng trọ CỦA 1 CHỦ TRỌ
    public List<PhongTro> getAllPhongTro(Long chuTroId) {
        return phongTroRepository.findByChuTroId(chuTroId);
    }

    // Tạo mới một phòng trọ 
    public PhongTro createPhongTro(PhongTro phongTro) {
        return phongTroRepository.save(phongTro);
    }

    // Cập nhật thông tin phòng trọ 
    public PhongTro updatePhongTro(Long id, PhongTro phongTroDetails) {
        PhongTro phongTroCu = phongTroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy thông tin phòng!"));
        if ("DANG_THUE".equals(phongTroCu.getTrangThai())) {
            throw new RuntimeException("Hệ thống từ chối thao tác: Không thể sửa phòng đang có khách thuê.");
        }
        phongTroCu.setSoPhong(phongTroDetails.getSoPhong());
        phongTroCu.setDienTich(phongTroDetails.getDienTich());
        phongTroCu.setGiaThue(phongTroDetails.getGiaThue());
        phongTroCu.setDiaChi(phongTroDetails.getDiaChi());
        phongTroCu.setTrangThai(phongTroDetails.getTrangThai());
        
        return phongTroRepository.save(phongTroCu);
    }

    // Xóa phòng trọ 
    public void deletePhongTro(Long id) {
        if (!phongTroRepository.existsById(id)) throw new RuntimeException("Lỗi: Không tìm thấy phòng trọ này để xóa!");
        try {
            phongTroRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Không thể xóa! Phòng này đang có Khách thuê hoặc Hóa đơn liên quan. Vui lòng kiểm tra lại.");
        }
    }

    // Tìm kiếm phòng trọ theo khoảng giá thuê CỦA 1 CHỦ TRỌ
    public List<PhongTro> timKiemTheoKhoangGia(Long chuTroId, Long min, Long max) {
        // Đã sửa thành GiaThue
        return phongTroRepository.findByChuTroIdAndGiaThueBetween(chuTroId, min, max); 
    }

    // Tìm kiếm phòng trọ theo trạng thái CỦA 1 CHỦ TRỌ
    public List<PhongTro> timKiemTheoTrangThai(Long chuTroId, String trangThai) {
        return phongTroRepository.findByChuTroIdAndTrangThai(chuTroId, trangThai);
    }

    // Tìm kiếm gần đúng phòng trọ theo số phòng CỦA 1 CHỦ TRỌ
    public List<PhongTro> timKiemTheoSoPhong(Long chuTroId, String soPhong) {
        return phongTroRepository.findByChuTroIdAndSoPhongContainingIgnoreCase(chuTroId, soPhong);
    }

    // Tìm kiếm gần đúng phòng trọ theo địa chỉ/chi nhánh CỦA 1 CHỦ TRỌ
    public List<PhongTro> timKiemTheoDiaChi(Long chuTroId, String diaChi) {
        return phongTroRepository.findByChuTroIdAndDiaChiContainingIgnoreCase(chuTroId, diaChi);
    }

    public List<PhongTro> timKiemTheoKhuVuc(Long chuTroId, Long khuVucId) {
        return phongTroRepository.findByChuTroIdAndKhuVuc_Id(chuTroId, khuVucId);
    }
}