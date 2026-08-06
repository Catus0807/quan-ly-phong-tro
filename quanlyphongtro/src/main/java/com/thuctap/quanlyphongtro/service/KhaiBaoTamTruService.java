package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.KhaiBaoTamTru;
import com.thuctap.quanlyphongtro.entity.NguoiThue;
import com.thuctap.quanlyphongtro.repository.KhaiBaoTamTruRepository;
import com.thuctap.quanlyphongtro.repository.NguoiThueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class KhaiBaoTamTruService {

    @Autowired
    private KhaiBaoTamTruRepository tamTruRepository;

    @Autowired
    private ThongBaoService thongBaoService;

    @Autowired
    private NguoiThueRepository nguoiThueRepository;

    // Lấy danh sách tạm trú CỦA 1 CHỦ TRỌ
    public List<KhaiBaoTamTru> getAllTamTru(Long chuTroId) {
        return tamTruRepository.findByChuTroId(chuTroId);
    }

    // Lấy danh sách tạm trú CỦA 1 KHÁCH THUÊ (Dùng cho trang Khách)
    public List<KhaiBaoTamTru> getTamTruByKhachId(Long khachId) {
        return tamTruRepository.findByNguoiThueId(khachId);
    }

    public List<KhaiBaoTamTru> locTheoChiNhanh(Long chuTroId, Long khuVucId) {
        return tamTruRepository.findByChuTroIdAndKhuVucId(chuTroId, khuVucId);
    }

    // Khách thuê hoặc Chủ trọ tạo tờ khai mới
    @Transactional
    public KhaiBaoTamTru createTamTru(KhaiBaoTamTru tamTru) {
        tamTru.setTrangThai("CHO_XU_LY");
        KhaiBaoTamTru savedTamTru = tamTruRepository.save(tamTru);

        if (savedTamTru.getNguoiThue() != null) {
            NguoiThue khach = nguoiThueRepository.findById(savedTamTru.getNguoiThue().getId()).orElse(null);
            
            if (khach != null && khach.getPhongTro() != null && khach.getPhongTro().getChuTro() != null) {
                Long chuTroId = khach.getPhongTro().getChuTro().getId();
                
                // Lấy chi nhánh và ghép vào tiêu đề
                String chiNhanh = khach.getPhongTro().getDiaChi();
                String tieuDe = "Tờ khai tạm trú mới (" + chiNhanh + ")";
                
                String noiDung = "Khách thuê phòng " + khach.getPhongTro().getSoPhong() + " vừa gửi một tờ khai tạm trú mới chờ bạn duyệt.";
                
                thongBaoService.taoThongBao(tieuDe, noiDung, "CHU_TRO", chuTroId, "TAM_TRU");
            }
        }
        return savedTamTru;
    }

    // Chủ trọ cập nhật trạng thái (VD: Từ CHO_XU_LY sang DA_HOAN_THANH)
    @Transactional
    public KhaiBaoTamTru updateTrangThai(Long id, String trangThaiMoi) {
        KhaiBaoTamTru tamTru = tamTruRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tờ khai!"));
        
        tamTru.setTrangThai(trangThaiMoi);
        KhaiBaoTamTru updatedTamTru = tamTruRepository.save(tamTru);

        // Kích hoạt thông báo (Cách 1)
        if (updatedTamTru.getNguoiThue() != null && "DA_HOAN_THANH".equals(trangThaiMoi)) {
            Long khachId = updatedTamTru.getNguoiThue().getId();
            String tieuDe = "Tạm trú đã được duyệt";
            String noiDung = "Tờ khai tạm trú của " + updatedTamTru.getHoTen() + " đã được Chủ trọ hoàn tất thủ tục khai báo.";
            
            thongBaoService.taoThongBao(tieuDe, noiDung, "KHACH_THUE", khachId, "TAM_TRU");
        }

        return updatedTamTru;
    }

    // Xóa tờ khai
    @Transactional
    public void deleteTamTru(Long id) {
        tamTruRepository.deleteById(id);
    }
}