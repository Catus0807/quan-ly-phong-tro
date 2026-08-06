package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.HoaDon;
import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AutoNotificationService {

    @Autowired
    private NguoiThueRepository nguoiThueRepository;
    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private ThongBaoService thongBaoService;

    // QUÉT HỢP ĐỒNG SẮP HẾT HẠN
    // @Scheduled(cron = "0 1 0 * * ?") 
    //@Scheduled(fixedRate = 10000)
    public void quetHopDongSapHetHan() {
        System.out.println("Đang chạy luồng quét Hợp đồng sắp hết hạn...");
        
        LocalDate homNay = LocalDate.now();
        LocalDate hanChot = homNay.plusDays(15); 
        
        List<NguoiThue> danhSachSapHetHan = nguoiThueRepository.findByNgayKetThucBetween(homNay, hanChot);
        for (NguoiThue khach : danhSachSapHetHan) {
            String tenPhong = (khach.getPhongTro() != null) ? khach.getPhongTro().getSoPhong() : "Chưa rõ";
            Long chuTroId = (khach.getChuTro() != null) ? khach.getChuTro().getId() : null;
            long soNgayConLai = java.time.temporal.ChronoUnit.DAYS.between(homNay, khach.getNgayKetThuc());
            String chuoiNgay = (soNgayConLai == 0) ? "vào HÔM NAY" : "sau " + soNgayConLai + " ngày nữa";

            String tbKhach = "Hợp đồng thuê phòng " + tenPhong + " của bạn sẽ hết hạn " + chuoiNgay + " (ngày " + khach.getNgayKetThuc() + "). Bạn có muốn gia hạn không?";
            thongBaoService.taoThongBao("Hợp đồng sắp hết hạn", tbKhach, "KHACH_THUE", khach.getId(), "HOP_DONG_SAP_HET_HAN", khach.getId());

            if (chuTroId != null) {
                String tbChuTro = "Hợp đồng của khách " + khach.getTenKhach() + " (Phòng " + tenPhong + ") sẽ hết hạn " + chuoiNgay + ".";
                thongBaoService.taoThongBao("Cảnh báo Hợp đồng", tbChuTro, "CHU_TRO", chuTroId, "HOP_DONG", khach.getId());
            }
        }
    }

    // NHẮC NHỞ TRƯỚC HẠN 3 NGÀY (Chạy lúc 8h sáng ngày mùng 3 hàng tháng)
    @Scheduled(cron = "0 0 8 3 * ?")
    public void nhacNhoTruocHan() {
        System.out.println("Đang chạy luồng nhắc nhở Hóa đơn trước hạn...");
        List<HoaDon> danhSachNo = hoaDonRepository.findByTrangThai("CHUA_THU");
        for (HoaDon hd : danhSachNo) {
            if (hd.getPhongTro() != null) {
                Long phongId = hd.getPhongTro().getId();
                List<NguoiThue> khachs = nguoiThueRepository.findByPhongTro_Id(phongId);
                
                if (!khachs.isEmpty()) {
                    NguoiThue khachDaiDien = khachs.get(0);
                    String tieuDe = "Sắp đến hạn thanh toán hóa đơn " + hd.getThangThu();
                    String noiDung = "Chỉ còn 3 ngày nữa là đến hạn thanh toán hóa đơn tháng " + hd.getThangThu() + " với tổng tiền " + hd.getTongTien() + "đ. Vui lòng thanh toán trước ngày mùng 6 để tránh gián đoạn dịch vụ.";
                    
                    thongBaoService.taoThongBao(tieuDe, noiDung, "KHACH_THUE", khachDaiDien.getId(), "HOA_DON", hd.getId());
                }
            }
        }
    }

    // NHẮC NHỞ NGÀY HẾT HẠN (Chạy lúc 8h sáng ngày mùng 6 hàng tháng)
    @Scheduled(cron = "0 0 8 6 * ?")
    public void nhacNhoNgayHetHan() {
        System.out.println("Đang chạy luồng nhắc nhở Hóa đơn đến hạn/quá hạn...");
        List<HoaDon> danhSachNo = hoaDonRepository.findByTrangThai("CHUA_THU");
        for (HoaDon hd : danhSachNo) {
            if (hd.getPhongTro() != null) {
                String soPhong = hd.getPhongTro().getSoPhong();
                Long chuTroId = hd.getPhongTro().getChuTro().getId();
                String soTien = String.format("%,d", hd.getTongTien()) + " đ";
                
                // Gửi thông báo cho Chủ trọ
                thongBaoService.taoThongBao(
                    "⚠️ Phòng " + soPhong + " chưa thanh toán!",
                    "Hôm nay là hạn chót. Phòng " + soPhong + " vẫn chưa đóng tiền tháng " + hd.getThangThu() + " (" + soTien + ").",
                    "CHU_TRO", chuTroId, "NO_TIEN_PHONG", hd.getId()
                );

                // Gửi thông báo cho Khách thuê
                List<NguoiThue> khachs = nguoiThueRepository.findByPhongTro_Id(hd.getPhongTro().getId());
                if (!khachs.isEmpty()) {
                    NguoiThue khachDaiDien = khachs.get(0);
                    String tieuDe = "🚨 HÔM NAY là hạn chót thanh toán!";
                    String noiDung = "Hóa đơn tháng " + hd.getThangThu() + " (" + soTien + ") của bạn sẽ hết hạn thanh toán vào HÔM NAY. Vui lòng thanh toán ngay để không bị gián đoạn dịch vụ!";
                    
                    thongBaoService.taoThongBao(tieuDe, noiDung, "KHACH_THUE", khachDaiDien.getId(), "HOA_DON", hd.getId());
                }
            }
        }
    }
}