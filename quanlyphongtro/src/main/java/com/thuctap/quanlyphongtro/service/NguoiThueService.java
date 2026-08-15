package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.entity.PhongTro;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;
import com.thuctap.quanlyphongtro.entity.HoaDon;
import java.util.List;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class NguoiThueService {

    @Autowired
    private NguoiThueRepository nguoiThueRepository;
    
    @Autowired
    private PhongTroRepository phongTroRepository;
    
    @Autowired
    private ThongBaoService thongBaoService;

    //Lọc bỏ người đã thanh lý khỏi danh sách tổng
    public List<NguoiThue> getAllNguoiThue(Long chuTroId) {
        return nguoiThueRepository.findByChuTroId(chuTroId).stream()
                .filter(nt -> !"DA_THANH_LY".equals(nt.getTrangThaiGiaHan()))
                .collect(Collectors.toList());
    }

    // Lọc bỏ người đã thanh lý khỏi danh sách tìm theo chi nhánh
    public List<NguoiThue> locTheoChiNhanh(Long chuTroId, Long khuVucId) {
        return nguoiThueRepository.findByChuTroIdAndKhuVucId(chuTroId, khuVucId).stream()
                .filter(nt -> !"DA_THANH_LY".equals(nt.getTrangThaiGiaHan()))
                .collect(Collectors.toList());
    }

    public NguoiThue getKhachTheoId(Long id) {
        return nguoiThueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy dữ liệu khách thuê!"));
    }

    @Transactional
    public NguoiThue createNguoiThue(NguoiThue nguoiThue) {
        PhongTro phongTro = phongTroRepository.findById(nguoiThue.getPhongTro().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy phòng trọ này trong hệ thống!"));
                
        if (!phongTro.getTrangThai().equals("TRONG")) {
            throw new RuntimeException("Hệ thống từ chối: Phòng này hiện không trống, không thể làm hợp đồng!");
        }
        
        phongTro.setTrangThai("DANG_THUE");
        phongTroRepository.save(phongTro);
        return nguoiThueRepository.save(nguoiThue);
    }

    // CƠ CHẾ SOFT DELETE (THANH LÝ)
    @Transactional
    public void deleteNguoiThue(Long id) {
        NguoiThue nt = getKhachTheoId(id);
        
        // Giải phóng phòng trọ về trạng thái TRỐNG
        PhongTro pt = nt.getPhongTro();
        if (pt != null) {
            pt.setTrangThai("TRONG");
            phongTroRepository.save(pt);
        }
        
        // Thuật toán Soft Delete: Đổi trạng thái, giữ nguyên Hóa đơn & Sự cố
        nt.setTrangThaiGiaHan("DA_THANH_LY");
        
        nt.setNgayKetThuc(LocalDate.now()); 
        
        nt.setMatKhau(null); // Thu hồi quyền đăng nhập
        
        nguoiThueRepository.save(nt);
    }

    @Transactional
    public NguoiThue updateNguoiThue(Long id, NguoiThue nguoiThueUpdate) {
        NguoiThue existing = getKhachTheoId(id);
        existing.setTenKhach(nguoiThueUpdate.getTenKhach());
        existing.setSdt(nguoiThueUpdate.getSdt());
        existing.setCccd(nguoiThueUpdate.getCccd());
        existing.setNgaySinh(nguoiThueUpdate.getNgaySinh());
        existing.setGioiTinh(nguoiThueUpdate.getGioiTinh());
        existing.setQueQuan(nguoiThueUpdate.getQueQuan());
        return nguoiThueRepository.save(existing);
    }

    @Transactional
    public void capTaiKhoan(Long id, String matKhau) {
        NguoiThue khach = getKhachTheoId(id);
        khach.setMatKhau(matKhau.replace("\"", ""));
        nguoiThueRepository.save(khach);
    }

    @Transactional
    public void doiMatKhau(Long id, String matKhauCu, String matKhauMoi) {
        NguoiThue khach = getKhachTheoId(id);
        if (khach.getMatKhau() == null || !khach.getMatKhau().equals(matKhauCu)) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }
        khach.setMatKhau(matKhauMoi);
        nguoiThueRepository.save(khach);
    }

    @Transactional
    public NguoiThue khachTuCapNhat(Long id, NguoiThue thongTinMoi) {
        NguoiThue khachHienTai = getKhachTheoId(id);
        khachHienTai.setTenKhach(thongTinMoi.getTenKhach());
        khachHienTai.setSdt(thongTinMoi.getSdt());
        khachHienTai.setNgaySinh(thongTinMoi.getNgaySinh());
        khachHienTai.setGioiTinh(thongTinMoi.getGioiTinh());
        khachHienTai.setQueQuan(thongTinMoi.getQueQuan());
        return nguoiThueRepository.save(khachHienTai);
    }

    @Transactional
    public void guiYeuCauGiaHan(Long id, boolean isGiaHan, int soThang) {
        NguoiThue khach = getKhachTheoId(id);
        
        if (isGiaHan) {
            khach.setTrangThaiGiaHan("DANG_YEU_CAU");
        } else {
            khach.setTrangThaiGiaHan("KHONG_GIA_HAN");
        }
        nguoiThueRepository.save(khach); 
        if (khach.getChuTro() != null) {
            // Lấy tên chi nhánh
            String chiNhanh = (khach.getPhongTro() != null && khach.getPhongTro().getDiaChi() != null) 
                            ? khach.getPhongTro().getDiaChi() : "Chưa rõ chi nhánh";
                            
            // Gắn chi nhánh vào tiêu đề
            String tieuDe = isGiaHan ? "Yêu cầu gia hạn hợp đồng (" + chiNhanh + ")" 
                                    : "Thông báo TRẢ PHÒNG (" + chiNhanh + ")";
            String noiDung;
            String loaiThongBao = isGiaHan ? "YEU_CAU_GIA_HAN" : "KHONG_GIA_HAN"; 
            
            if (isGiaHan) {
                noiDung = "Khách thuê " + khach.getTenKhach() + " (Phòng " + khach.getPhongTro().getSoPhong() + 
                        ") muốn gia hạn hợp đồng thêm " + soThang + " tháng. Nhấn vào đây để duyệt ngay!";
            } else {
                noiDung = "Khách thuê " + khach.getTenKhach() + " (Phòng " + khach.getPhongTro().getSoPhong() + 
                        ") xác nhận KHÔNG GIA HẠN. Hợp đồng sẽ kết thúc đúng hạn vào ngày " + khach.getNgayKetThuc() + ".";
            }
            
            thongBaoService.taoThongBao(tieuDe, noiDung, "CHU_TRO", khach.getChuTro().getId(), loaiThongBao, khach.getId());
        }
    }

    // Xử lý khách trả phòng
    @Transactional
    public void xuLyBaoTraPhong(Long khachId, String ngayChuyenStr) {
        NguoiThue khach = getKhachTheoId(khachId);
        khach.setTrangThaiGiaHan("KHONG_GIA_HAN");
        nguoiThueRepository.save(khach);
        LocalDate ngayChuyenDate = LocalDate.parse(ngayChuyenStr);
        long soNgayBaoTruoc = ChronoUnit.DAYS.between(LocalDate.now(), ngayChuyenDate);
        
        String thongTinCoc = soNgayBaoTruoc >= 30 
                ? "Hoàn 100% cọc (Báo trước " + soNgayBaoTruoc + " ngày)." 
                : "Trừ 20% cọc (Báo gấp trước " + soNgayBaoTruoc + " ngày).";
        String soPhong = khach.getPhongTro() != null ? khach.getPhongTro().getSoPhong() : "---";
        Long chuTroId = khach.getPhongTro() != null && khach.getPhongTro().getChuTro() != null 
                        ? khach.getPhongTro().getChuTro().getId() : null;
        if (chuTroId != null) {
            // Lấy tên chi nhánh
            String chiNhanh = khach.getPhongTro() != null ? khach.getPhongTro().getDiaChi() : "";
            
            String noiDung = "Khách phòng " + soPhong + " (" + khach.getTenKhach() + ") vừa báo sẽ chuyển đi vào ngày " 
                        + ngayChuyenDate.toString() + ". Tình trạng cọc: " + thongTinCoc;
                        
            // Gắn chi nhánh vào tiêu đề thông báo
            thongBaoService.taoThongBao("🚨 Khách báo chuyển trọ (" + chiNhanh + ")", noiDung, "CHU_TRO", chuTroId, "KHONG_GIA_HAN", khachId);
        }
    }

    @Autowired
    private HoaDonRepository hoaDonRepository; 

    public Map<String, Object> kiemTraDanhTinhThongMinh(Long chuTroId, String cccd, String sdt) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("loaiTrung", "KHONG_TRUNG");
        
        Optional<NguoiThue> khachTimThay = Optional.empty();
        
        // Ưu tiên tìm theo CCCD trước, nếu không có mới tìm bằng SĐT
        if (cccd != null && !cccd.trim().isEmpty()) {
            khachTimThay = nguoiThueRepository.findFirstByCccdOrderByIdDesc(cccd);
        } else if (sdt != null && !sdt.trim().isEmpty()) {
            khachTimThay = nguoiThueRepository.findFirstBySdtOrderByIdDesc(sdt);
        }

        if (khachTimThay.isPresent()) {
            NguoiThue khach = khachTimThay.get();
            
            // Nếu khách này ĐÃ TỪNG ở trọ của chính Chủ trọ đang thao tác
            if (khach.getChuTro() != null && khach.getChuTro().getId().equals(chuTroId)) {
                result.put("loaiTrung", "TRUNG_NOI_BO");
                result.put("data", khach); // Gửi thông tin về để Frontend Auto-fill
                
                // Cảnh báo nhẹ nếu số điện thoại này đang được dùng cho phòng khác (chưa dọn đi)
                if (!"DA_THANH_LY".equals(khach.getTrangThaiGiaHan()) && khach.getPhongTro() != null) {
                    result.put("canhBao", "Phòng " + khach.getPhongTro().getSoPhong());
                }
            } 
            // Nếu khách này đã/đang ở hệ thống trọ của người khác (Xuyên hệ thống)
            else {
                result.put("loaiTrung", "TRUNG_HETHONG");
                
                // Kiểm tra xem khách này có đang nợ tiền ở phòng cũ không?
                if (khach.getPhongTro() != null) {
                    List<HoaDon> noCuoc = hoaDonRepository.findByTrangThai("CHUA_THU").stream()
                            .filter(hd -> hd.getPhongTro() != null && hd.getPhongTro().getId().equals(khach.getPhongTro().getId()))
                            .collect(java.util.stream.Collectors.toList());
                    
                    if (!noCuoc.isEmpty()) {
                        result.put("noXau", true);
                    }
                }
            }
        }
        return result;
    }

    // Xử lý Khách hủy báo trả phòng
    @Transactional
    public void huyBaoTraPhong(Long khachId) {
        NguoiThue khach = getKhachTheoId(khachId);
        
        khach.setTrangThaiGiaHan("HUY_TRA_PHONG"); 
        nguoiThueRepository.save(khach);
        if (khach.getChuTro() != null) {
            String noiDung = "Khách phòng " + (khach.getPhongTro() != null ? khach.getPhongTro().getSoPhong() : "") 
                        + " (" + khach.getTenKhach() + ") đã HỦY yêu cầu trả phòng và muốn tiếp tục ở. Vui lòng xác nhận!";
            thongBaoService.taoThongBao("✅ Khách quay xe (Xin hủy trả phòng)", noiDung, "CHU_TRO", khach.getChuTro().getId(), "HOP_DONG", khachId);
        }
    }

    // Xử lý Chủ trọ phản hồi
    @Transactional
    public void phanHoiYeuCau(Long khachId, boolean isChapNhan, String lyDo) {
        NguoiThue khach = getKhachTheoId(khachId);
        String trangThaiHienTai = khach.getTrangThaiGiaHan(); 
        
        String tieuDe = isChapNhan ? "✅ Yêu cầu được chấp nhận" : "❌ Yêu cầu bị từ chối";
        
        String loaiYeuCau = "Gia hạn hợp đồng"; 
        if ("KHONG_GIA_HAN".equals(trangThaiHienTai)) {
            loaiYeuCau = "Trả phòng / Chuyển đi";
        } else if ("HUY_TRA_PHONG".equals(trangThaiHienTai)) {
            loaiYeuCau = "Hủy trả phòng (Tiếp tục ở)";
        }
        
        //  Dùng từ "Lời nhắn" nếu Chấp nhận, "Lý do" nếu Từ chối
        String noiDung = "Chủ trọ đã " + (isChapNhan ? "CHẤP NHẬN" : "TỪ CHỐI") + " yêu cầu [" + loaiYeuCau + "] của bạn.";
        if (lyDo != null && !lyDo.trim().isEmpty()) {
            noiDung += (isChapNhan ? " Lời nhắn: " : " Lý do: ") + lyDo;
        }
        
        if ("HUY_TRA_PHONG".equals(trangThaiHienTai)) {
            if (isChapNhan) {
                khach.setTrangThaiGiaHan(null);
            } else {
                khach.setTrangThaiGiaHan("KHONG_GIA_HAN"); 
            }
        } else if ("KHONG_GIA_HAN".equals(trangThaiHienTai)) {
            if (isChapNhan) {
                // Sinh ra trạng thái mới để Frontend biết là đã duyệt
                khach.setTrangThaiGiaHan("DA_DUYET_TRA_PHONG"); 
            } else {
                khach.setTrangThaiGiaHan(null);
            }
        } else {
            if (!isChapNhan) {
                khach.setTrangThaiGiaHan(null);
            }
        }
        nguoiThueRepository.save(khach);
        thongBaoService.taoThongBao(tieuDe, noiDung, "KHACH_THUE", khach.getId(), "HOP_DONG", khach.getId());
    }

    public List<NguoiThue> getLichSuThanhLy(Long chuTroId) {
        return nguoiThueRepository.findByChuTroIdAndTrangThaiGiaHan(chuTroId, "DA_THANH_LY");
    }

    // LOGIC XỬ LÝ GIA HẠN & TẠO PHỤ LỤC HỢP ĐỒNG 
    @Transactional
    public void giaHanHopDong(Long id, String ngayKetThucMoiStr, String phuLucHtml) {
        NguoiThue khach = getKhachTheoId(id);
        
        // 1. Cập nhật ngày kết thúc mới cho hợp đồng
        LocalDate ngayKetThucMoi = LocalDate.parse(ngayKetThucMoiStr);
        khach.setNgayKetThuc(ngayKetThucMoi);
        
        // 2. Chèn đoạn HTML Phụ Lục vào cuối Hợp đồng gốc hiện tại
        String hopDongGoc = khach.getNoiDungHopDong();
        if (hopDongGoc == null) {
            hopDongGoc = ""; // Đảm bảo không bị null pointer
        }
        // Gắn nối tiếp bản HTML cũ với bản HTML phụ lục mới
        khach.setNoiDungHopDong(hopDongGoc + phuLucHtml);
        
        // 3. Xóa trạng thái "Chờ gia hạn" / "Đang yêu cầu" để đưa hợp đồng về hoạt động bình thường
        khach.setTrangThaiGiaHan(null);
        
        // 4. Lưu thay đổi xuống CSDL
        nguoiThueRepository.save(khach);
        
        // 5. Tự động bắn thông báo cho khách thuê biết Chủ trọ đã duyệt
        if (khach.getChuTro() != null) {
            String noiDungThongBao = "Chủ trọ đã gia hạn hợp đồng của bạn đến ngày " 
                    + ngayKetThucMoi.toString() 
                    + ". Vui lòng mở xem Phụ lục gia hạn ở cuối Hợp đồng gốc.";
            thongBaoService.taoThongBao(
                    "🎉 Hợp đồng đã được gia hạn", 
                    noiDungThongBao, 
                    "KHACH_THUE", 
                    khach.getId(), 
                    "HOP_DONG", 
                    khach.getId()
            );
        }
    }
}