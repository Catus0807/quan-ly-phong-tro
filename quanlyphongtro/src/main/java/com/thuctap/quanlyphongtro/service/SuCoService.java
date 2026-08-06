package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.entity.PhongTro;
import com.thuctap.quanlyphongtro.entity.SuCo;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import com.thuctap.quanlyphongtro.repository.SuCoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SuCoService {

    @Autowired
    private SuCoRepository suCoRepository;

    @Autowired
    private PhongTroRepository phongTroRepository;

    @Autowired
    private NguoiThueRepository nguoiThueRepository;

    @Autowired
    private ThongBaoService thongBaoService;

    // Lấy danh sách toàn bộ sự cố
    public List<SuCo> getAll() { return suCoRepository.findAll(); }

    // Lọc danh sách sự cố theo chi nhánh
    public List<SuCo> locTheoChiNhanh(Long khuVucId) { 
        return suCoRepository.findByKhuVucId(khuVucId); 
    }

    // Lấy danh sách sự cố do một khách thuê báo cáo
    public List<SuCo> getSuCoKhachThue(Long khachId) {
        NguoiThue khach = nguoiThueRepository.findById(khachId).orElse(null);
        if (khach != null && khach.getPhongTro() != null) {
            return suCoRepository.findByPhongTroIdOrderByIdDesc(khach.getPhongTro().getId());
        }
        return new ArrayList<>();
    }

    // Xóa thông tin một sự cố
    @Transactional
    public void delete(Long id) { suCoRepository.deleteById(id); }

    // Tạo mới hoặc Cập nhật sự cố (Dành cho Chủ trọ)
    @Transactional
    public SuCo createOrUpdate(SuCo suCo, Long id) {
        if (id != null) suCo.setId(id);
        SuCo savedSuCo = calculateAndSave(suCo);

        // GỬI THÔNG BÁO CHO KHÁCH THUÊ KHI CHỦ TRỌ CẬP NHẬT
        if (savedSuCo.getPhongTro() != null) {
            Long phongId = savedSuCo.getPhongTro().getId();
            List<NguoiThue> khachs = nguoiThueRepository.findByPhongTro_Id(phongId);
            
            if (khachs != null && !khachs.isEmpty()) {
                NguoiThue khachDaiDien = khachs.get(0);
                
                String tenTrangThai = savedSuCo.getTrangThai().equals("DANG_SUA") ? "Đang sửa chữa" : 
                                      savedSuCo.getTrangThai().equals("DA_HOAN_THANH") ? "Đã hoàn thành" : "Đang chờ xử lý";
                                      
                String tieuDe = "Cập nhật tiến độ sự cố";
                String noiDung = "Sự cố [" + savedSuCo.getTenSuCo() + "] của bạn đã được chuyển sang trạng thái: " + tenTrangThai;
                
                thongBaoService.taoThongBao(tieuDe, noiDung, "KHACH_THUE", khachDaiDien.getId(), "SU_CO");
            }
        }
        
        return savedSuCo;
    }

    // Khách thuê gửi phản ánh sự cố mới
    @Transactional
    public SuCo taoSuCoTuKhach(Long khachId, SuCo suCoKhachGui) {
        NguoiThue khach = nguoiThueRepository.findById(khachId)
                .orElseThrow(() -> new RuntimeException("Khách thuê không hợp lệ!"));
        if (khach.getPhongTro() == null) throw new RuntimeException("Khách thuê chưa được xếp phòng!");
        
        PhongTro phong = khach.getPhongTro();
        suCoKhachGui.setPhongTro(phong);
        
        if (phong.getChuTro() != null) {
            suCoKhachGui.setChuTro(phong.getChuTro());
        }
        
        suCoKhachGui.setViTri(phong.getSoPhong()); 
        suCoKhachGui.setChiNhanh(phong.getDiaChi()); 
        suCoKhachGui.setNgayBao(LocalDate.now());
        suCoKhachGui.setTrangThai("DANG_CHO"); 
        suCoKhachGui.setMienPhi(false); 
        suCoKhachGui.setChiPhiTong(0L);
        suCoKhachGui.setChiPhiNguoiThue(0L);
        
        SuCo savedSuCo = suCoRepository.save(suCoKhachGui);
        
        // GỬI THÔNG BÁO CHO CHỦ TRỌ
        if (phong.getChuTro() != null && phong.getChuTro().getId() != null) {
            Long idChuTro = phong.getChuTro().getId();
            
            // Lấy chi nhánh và ghép vào tiêu đề
            String chiNhanh = phong.getDiaChi() != null ? phong.getDiaChi() : "";
            String tieuDe = "Sự cố mới từ Phòng " + phong.getSoPhong() + " (" + chiNhanh + ")";
            
            String noiDung = "Khách báo cáo: " + savedSuCo.getTenSuCo();
            
            thongBaoService.taoThongBao(tieuDe, noiDung, "CHU_TRO", idChuTro, "SU_CO");
        }
        return savedSuCo;
    }

    // Tính toán chia sẻ chi phí sửa chữa sự cố và lưu vào cơ sở dữ liệu
    private SuCo calculateAndSave(SuCo suCo) {
        if (suCo.getPhongTro() != null && suCo.getPhongTro().getId() != null) {
            PhongTro phong = phongTroRepository.findById(suCo.getPhongTro().getId()).orElse(null);
            suCo.setPhongTro(phong);
            
            // Tự động gán Chủ trọ nếu sự cố thuộc về 1 phòng cụ thể
            if (phong != null && phong.getChuTro() != null) {
                suCo.setChuTro(phong.getChuTro());
            }
        }
        
        if (suCo.getNgayBao() == null) suCo.setNgayBao(LocalDate.now());
        if (Boolean.TRUE.equals(suCo.getMienPhi())) {
            if (suCo.getChiPhiTong() == null) suCo.setChiPhiTong(0L);
            suCo.setChiPhiNguoiThue(0L); 
        } else {
            if (suCo.getChiPhiTong() != null && suCo.getChiPhiTong() > 0) {
                suCo.setChiPhiNguoiThue(suCo.getChiPhiTong() / 2); 
            } else {
                suCo.setChiPhiTong(0L);
                suCo.setChiPhiNguoiThue(0L); 
            }
        }
        return suCoRepository.save(suCo);
    }
}