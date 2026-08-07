package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.HoaDon;
import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.entity.PhongTro;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HoaDonService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private PhongTroRepository phongTroRepository;

    @Autowired
    private NguoiThueRepository nguoiThueRepository;

    @Autowired
    private ThongBaoService thongBaoService;

    // Lấy danh sách toàn bộ hóa đơn
    public List<HoaDon> getAll() { return hoaDonRepository.findAll(); }

    // Lọc hóa đơn theo địa chỉ chi nhánh
    public List<HoaDon> locTheoChiNhanh(Long khuVucId) { 
        return hoaDonRepository.findByKhuVucId(khuVucId); 
    }

    // Lấy hóa đơn mới nhất của một phòng cụ thể
    public HoaDon getLatestByPhong(Long phongId) {
        return hoaDonRepository.findTopByPhongTroIdOrderByIdDesc(phongId).orElse(null);
    }

    // Lấy toàn bộ hóa đơn của một khách thuê (dành cho trang User)
    public List<HoaDon> layHoaDonTheoKhach(Long khachId) {
        NguoiThue khach = nguoiThueRepository.findById(khachId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy dữ liệu khách thuê!"));
        if (khach.getPhongTro() == null) return new ArrayList<>();
        return hoaDonRepository.findByPhongTroId(khach.getPhongTro().getId());
    }

    // Xóa một hóa đơn theo ID
    @Transactional
    public void delete(Long id) {
        if (!hoaDonRepository.existsById(id)) throw new RuntimeException("Hóa đơn không tồn tại!");
        hoaDonRepository.deleteById(id);
    }

// Tạo mới hoặc Cập nhật hóa đơn
    @Transactional
    public HoaDon createOrUpdate(HoaDon hd, Long id) {
        boolean isNew = (id == null);

        if (id != null) {
            if (!hoaDonRepository.existsById(id)) throw new RuntimeException("Hóa đơn không tồn tại!");
            hd.setId(id);
        }
        HoaDon savedHoaDon = calculateAndSave(hd);
        
        // GỬI THÔNG BÁO CHO KHÁCH THUÊ SAU KHI LƯU
        if (savedHoaDon.getPhongTro() != null) {
            Long phongId = savedHoaDon.getPhongTro().getId();
            List<NguoiThue> khachs = nguoiThueRepository.findByPhongTro_Id(phongId);
            
            if (khachs != null && !khachs.isEmpty()) {
                NguoiThue khachDaiDien = khachs.get(0);
                String tieuDe = "";
                String noiDung = "";

                //  Ưu tiên bắt trạng thái ĐÃ THU lên đầu tiên
                if ("DA_THU".equals(savedHoaDon.getTrangThai())) {
                    tieuDe = "✅ Đã thanh toán tháng " + savedHoaDon.getThangThu();
                    noiDung = "Chủ trọ đã xác nhận thu tiền hóa đơn tháng " + savedHoaDon.getThangThu() + 
                              " (Tổng: " + savedHoaDon.getTongTien() + "đ). Cảm ơn bạn!";
                } else if (isNew) {
                    tieuDe = "Hóa đơn mới tháng " + savedHoaDon.getThangThu();
                    noiDung = "Chủ trọ vừa chốt tiền phòng và điện nước tháng " + savedHoaDon.getThangThu() + 
                              ". Tổng cộng: " + savedHoaDon.getTongTien() + "đ. Vui lòng kiểm tra!";
                } else {
                    tieuDe = "🔄 Cập nhật hóa đơn tháng " + savedHoaDon.getThangThu();
                    noiDung = "Chủ trọ vừa cập nhật lại số liệu hóa đơn tháng " + savedHoaDon.getThangThu() + 
                              ". Tổng cộng: " + savedHoaDon.getTongTien() + "đ. Vui lòng kiểm tra lại!";
                }
                
                thongBaoService.taoThongBao(tieuDe, noiDung, "KHACH_THUE", khachDaiDien.getId(), "HOA_DON");
            }
        }
        return savedHoaDon;
    }

    // Tính toán tiền điện nước, tổng tiền và lưu hóa đơn vào cơ sở dữ liệu
    private HoaDon calculateAndSave(HoaDon hd) {
        PhongTro phong = phongTroRepository.findById(hd.getPhongTro().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ này trong hệ thống."));
        hd.setPhongTro(phong);
        hd.setTienPhong(phong.getGiaThue());
        if (hd.getSoDienMoi() < hd.getSoDienCu()) throw new RuntimeException("Lỗi: Chỉ số điện mới không thể nhỏ hơn chỉ số cũ!");
        if (hd.getSoNuocMoi() < hd.getSoNuocCu()) throw new RuntimeException("Lỗi: Chỉ số nước mới không thể nhỏ hơn chỉ số cũ!");
        long soKwhDien = hd.getSoDienMoi() - hd.getSoDienCu();
        long soKhoiNuoc = hd.getSoNuocMoi() - hd.getSoNuocCu();
        long tong = hd.getTienPhong() + (soKwhDien * hd.getGiaDien()) + (soKhoiNuoc * hd.getGiaNuoc()) + hd.getPhuPhi();
        
        hd.setTongTien(tong);
        if (hd.getNgayLap() == null) hd.setNgayLap(LocalDate.now());
        return hoaDonRepository.save(hd);
    }
}