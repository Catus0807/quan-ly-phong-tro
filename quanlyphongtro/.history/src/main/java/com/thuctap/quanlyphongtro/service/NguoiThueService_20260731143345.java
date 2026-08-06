package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.entity.PhongTro;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import com.thuctap.quanlyphongtro.repository.NguoiOGhepRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    
    @Autowired
    private NguoiOGhepRepository nguoiOGhepRepository; 

    // ĐÃ SỬA: Lọc bỏ người đã thanh lý khỏi danh sách tổng
    public List<NguoiThue> getAllNguoiThue(Long chuTroId) {
        return nguoiThueRepository.findByChuTroId(chuTroId).stream()
                .filter(nt -> !"DA_THANH_LY".equals(nt.getTrangThaiGiaHan()))
                .collect(Collectors.toList());
    }

    // ĐÃ SỬA: Lọc bỏ người đã thanh lý khỏi danh sách tìm theo chi nhánh
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
        if (nguoiThueRepository.existsByCccd(nguoiThue.getCccd()) || nguoiOGhepRepository.existsByCccd(nguoiThue.getCccd())) {
            throw new RuntimeException("Lỗi: Căn cước công dân này đã tồn tại trong hệ thống (đại diện hoặc ở ghép)!");
        }
        
        if (nguoiThueRepository.existsBySdt(nguoiThue.getSdt()) || nguoiOGhepRepository.existsBySdt(nguoiThue.getSdt())) {
            throw new RuntimeException("Lỗi: Số điện thoại này đã được sử dụng bởi một người thuê khác!");
        }
        PhongTro phongTro = phongTroRepository.findById(nguoiThue.getPhongTro().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy phòng trọ này trong hệ thống!"));
                
        if (!phongTro.getTrangThai().equals("TRONG")) {
            throw new RuntimeException("Hệ thống từ chối: Phòng này hiện không trống, không thể làm hợp đồng!");
        }
        
        phongTro.setTrangThai("DANG_THUE");
        phongTroRepository.save(phongTro);
        return nguoiThueRepository.save(nguoiThue);
    }

    // ĐÃ SỬA: CƠ CHẾ SOFT DELETE (THANH LÝ)
    // ĐÃ SỬA: CƠ CHẾ SOFT DELETE (THANH LÝ)
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
        
        // SỬA LỖI TẠI ĐÂY: Truyền thẳng LocalDate.now() thay vì toString()
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
            String tieuDe = isGiaHan ? "Yêu cầu gia hạn hợp đồng" : "Thông báo TRẢ PHÒNG (Không gia hạn)";
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
            String noiDung = "Khách phòng " + soPhong + " (" + khach.getTenKhach() + ") vừa báo sẽ chuyển đi vào ngày " 
                           + ngayChuyenDate.toString() + ". Tình trạng cọc: " + thongTinCoc;
                           
            thongBaoService.taoThongBao("🚨 Khách báo chuyển trọ", noiDung, "CHU_TRO", chuTroId, "KHONG_GIA_HAN", khachId);
        }
    }

    public boolean checkCccdExists(String cccd) {
        return nguoiThueRepository.existsByCccd(cccd) || nguoiOGhepRepository.existsByCccd(cccd);
    }
    public boolean checkSdtExists(String sdt) {
        return nguoiThueRepository.existsBySdt(sdt) || nguoiOGhepRepository.existsBySdt(sdt);
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
        
        String noiDung = "Chủ trọ đã " + (isChapNhan ? "CHẤP NHẬN" : "TỪ CHỐI") + " yêu cầu [" + loaiYeuCau + "] của bạn.";
        if (lyDo != null && !lyDo.trim().isEmpty()) {
            noiDung += " Lý do: " + lyDo;
        }
        
        if ("HUY_TRA_PHONG".equals(trangThaiHienTai)) {
            if (isChapNhan) {
                khach.setTrangThaiGiaHan(null);
            } else {
                khach.setTrangThaiGiaHan("KHONG_GIA_HAN"); 
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
}