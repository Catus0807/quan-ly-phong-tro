package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.ChuTro;
import com.thuctap.quanlyphongtro.entity.HoSoThue;
import com.thuctap.quanlyphongtro.repository.ChuTroRepository;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import com.thuctap.quanlyphongtro.repository.HoSoThueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HoSoThueService {

    @Autowired
    private HoSoThueRepository hoSoThueRepository;
    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private ChuTroRepository chuTroRepository;

    private static final long MUC_MIEN_THUE = 500_000_000L; // 500 triệu VNĐ theo luật 2026

    public List<HoSoThue> layLichSuThue(Long chuTroId) {
        return hoSoThueRepository.findByChuTroIdOrderByNamDesc(chuTroId);
    }

    // Nút bấm: "Tính toán & Cập nhật số liệu Thuế năm nay"
    @Transactional
    public HoSoThue dongBoDoanhThuVaTinhThue(Long chuTroId, int nam) {
        ChuTro chuTro = chuTroRepository.findById(chuTroId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ trọ"));

        // Lấy tổng doanh thu thực tế trong năm
        Long tongDoanhThu = hoaDonRepository.tinhTongDoanhThuTheoNam(chuTroId, nam);
        
        long thueGTGT = 0L;
        long thueTNCN = 0L;

        // Áp dụng Luật thuế 2026
        if (tongDoanhThu > MUC_MIEN_THUE) {
            // Thuế GTGT: 5% * Tổng doanh thu
            thueGTGT = (long) (tongDoanhThu * 0.05);
            // Thuế TNCN: 5% * (Doanh thu - 500 triệu)
            thueTNCN = (long) ((tongDoanhThu - MUC_MIEN_THUE) * 0.05);
        }

        // Tìm xem hồ sơ năm nay đã có chưa, nếu chưa thì tạo mới
        HoSoThue hoSo = hoSoThueRepository.findByChuTroIdAndNam(chuTroId, nam)
                .orElse(new HoSoThue());

        // Nếu đã khai báo hoặc đã nộp thì không cho tự động sửa số liệu nữa
        if ("DA_KHAI_BAO".equals(hoSo.getTrangThai()) || "DA_NOP_THUE".equals(hoSo.getTrangThai())) {
            throw new RuntimeException("Hồ sơ thuế năm " + nam + " đã được chốt (Đã khai báo/Đã nộp), không thể tự động thay đổi số liệu!");
        }

        hoSo.setChuTro(chuTro);
        hoSo.setNam(nam);
        hoSo.setTongDoanhThu(tongDoanhThu);
        hoSo.setThueGTGT(thueGTGT);
        hoSo.setThueTNCN(thueTNCN);
        hoSo.setTongThue(thueGTGT + thueTNCN);
        hoSo.setTrangThai("CHUA_KHAI_BAO");
        hoSo.setNgayCapNhat(LocalDate.now());

        return hoSoThueRepository.save(hoSo);
    }

    // Nút bấm: Cập nhật trạng thái (Xác nhận Đã Khai Báo / Đã Nộp Thuế)
    @Transactional
    public HoSoThue capNhatTrangThai(Long id, String trangThaiMoi) {
        HoSoThue hoSo = hoSoThueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ thuế!"));
        
        hoSo.setTrangThai(trangThaiMoi);
        hoSo.setNgayCapNhat(LocalDate.now());
        return hoSoThueRepository.save(hoSo);
    }
}