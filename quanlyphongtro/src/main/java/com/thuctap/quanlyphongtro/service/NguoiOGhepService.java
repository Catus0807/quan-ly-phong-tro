package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.NguoiOGhep;
import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.repository.NguoiOGhepRepository;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NguoiOGhepService {
    @Autowired
    private NguoiOGhepRepository nguoiOGhepRepository;
    
    @Autowired
    private NguoiThueRepository nguoiThueRepository;

    @Autowired
    private ThongBaoService thongBaoService;

    // Thêm người ở ghép mới (kiểm tra giới hạn tối đa 1 người)
    @Transactional
    public NguoiOGhep themNguoiGhep(Long khachId, NguoiOGhep nguoiGhep) {
        // Tránh trùng lặp CCCD và SĐT
        if (nguoiThueRepository.existsByCccd(nguoiGhep.getCccd()) || nguoiOGhepRepository.existsByCccd(nguoiGhep.getCccd())) {
            throw new RuntimeException("Lỗi: Căn cước công dân của người ở ghép này đã tồn tại!");
        }
        
        if (nguoiThueRepository.existsBySdt(nguoiGhep.getSdt()) || nguoiOGhepRepository.existsBySdt(nguoiGhep.getSdt())) {
            throw new RuntimeException("Lỗi: Số điện thoại của người ở ghép này đã được đăng ký!");
        }

        NguoiThue khachChinh = nguoiThueRepository.findById(khachId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Khách thuê này!"));
                
        long soLuongHienTai = nguoiOGhepRepository.countByNguoiThueChinhId(khachId);
        if (soLuongHienTai >= 1) {
            throw new RuntimeException("Lỗi: Phòng này đã đạt giới hạn tối đa (1 Người chính + 1 Người ghép). Không thể thêm!");
        }
        
        nguoiGhep.setNguoiThueChinh(khachChinh);
        NguoiOGhep savedGhep = nguoiOGhepRepository.save(nguoiGhep);

        // LOGIC GỬI THÔNG BÁO CHO CHỦ TRỌ
        if (khachChinh.getPhongTro() != null && khachChinh.getPhongTro().getChuTro() != null) {
        Long chuTroId = khachChinh.getPhongTro().getChuTro().getId();
        String soPhong = khachChinh.getPhongTro().getSoPhong();
        String chiNhanh = khachChinh.getPhongTro().getDiaChi(); // Lấy tên chi nhánh
        
        // Đưa chi nhánh vào tiêu đề 
        String tieuDe = "🚨 Khách mới ở ghép P." + soPhong + " (" + chiNhanh + ")";
        String noiDung = "Khách thuê chính [" + khachChinh.getTenKhach() + 
                         "] vừa khai báo thêm 1 người ở ghép: " + nguoiGhep.getTen() + 
                         " (SĐT: " + nguoiGhep.getSdt() + "). Vui lòng kiểm tra.";
        
        thongBaoService.taoThongBao(tieuDe, noiDung, "CHU_TRO", chuTroId, "NGUOI_GHEP", khachChinh.getId());
        }

        return savedGhep;
    }

    // Xóa người ở ghép
    @Transactional
    public void xoaNguoiGhep(Long id) {
        NguoiOGhep nguoiGhep = nguoiOGhepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Dữ liệu người ở ghép không tồn tại!"));
        NguoiThue khachChinh = nguoiGhep.getNguoiThueChinh();
        if (khachChinh != null) {
            khachChinh.getDanhSachNguoiOGhep().remove(nguoiGhep);
            nguoiThueRepository.save(khachChinh); 
        } else {
            nguoiOGhepRepository.deleteById(id);
        }
    }

    // Cập nhật thông tin của người ở ghép
    @Transactional
    public NguoiOGhep suaNguoiGhep(Long id, NguoiOGhep newData) {
        NguoiOGhep old = nguoiOGhepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người ở ghép!"));
        old.setTen(newData.getTen());
        old.setCccd(newData.getCccd());
        old.setSdt(newData.getSdt());
        old.setNgaySinh(newData.getNgaySinh());
        old.setGioiTinh(newData.getGioiTinh());
        old.setQueQuan(newData.getQueQuan());
        return nguoiOGhepRepository.save(old);
    }
}