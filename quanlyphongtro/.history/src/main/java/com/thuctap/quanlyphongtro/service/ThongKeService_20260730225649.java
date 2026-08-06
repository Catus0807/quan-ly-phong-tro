package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.SuCo;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import com.thuctap.quanlyphongtro.repository.SuCoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ThongKeService {

    @Autowired
    private PhongTroRepository phongTroRepository;
    
    @Autowired
    private HoaDonRepository hoaDonRepository;
    
    @Autowired
    private SuCoRepository suCoRepository;

    public Map<String, Object> layBaoCaoTongQuan(Long chuTroId, Long khuVucId, String thangNam) {
        Map<String, Object> response = new HashMap<>();
        
        // 1. Xử lý thời gian (Nếu không chọn, mặc định lấy tháng hiện tại)
        LocalDate now = LocalDate.now();
        String currentMonthStr = (thangNam != null && !thangNam.isEmpty()) ? thangNam : String.format("%02d/%d", now.getMonthValue(), now.getYear());
        
        // Kiểm tra xem có phải đang xem cả năm không
        boolean isCaNam = currentMonthStr.startsWith("ALL/");
        int nam = Integer.parseInt(currentMonthStr.split("/")[1]);

        long soThue, soTrong, soBaoTri, tongPh;
        Long sumNo = 0L;
        List<Object[]> dsDoanhThu;
        List<SuCo> dsSuCo;
        
        // TRUY VẤN SỐ LIỆU PHÒNG & NỢ CƯỚC
        if (khuVucId == null) {
            // Lọc toàn bộ hệ thống
            soThue = phongTroRepository.countByChuTroIdAndTrangThai(chuTroId, "DANG_THUE");
            soTrong = phongTroRepository.countByChuTroIdAndTrangThai(chuTroId, "TRONG");
            soBaoTri = phongTroRepository.countByChuTroIdAndTrangThai(chuTroId, "BAO_TRI");
            
            // Chọn hàm dựa trên việc xem cả năm hay xem tháng
            if (isCaNam) {
                sumNo = hoaDonRepository.sumTienNoTheoNamThucTe(chuTroId, "/" + nam);
            } else {
                sumNo = hoaDonRepository.sumTienNoTheoThang(chuTroId, currentMonthStr);
            }
            
            dsDoanhThu = hoaDonRepository.thongKeDoanhThu(); 
            dsSuCo = suCoRepository.findAll();
        } else {
            // Lọc theo 1 chi nhánh cụ thể
            soThue = phongTroRepository.countByChuTroIdAndTrangThaiAndKhuVucId(chuTroId, "DANG_THUE", khuVucId);
            soTrong = phongTroRepository.countByChuTroIdAndTrangThaiAndKhuVucId(chuTroId, "TRONG", khuVucId);
            soBaoTri = phongTroRepository.countByChuTroIdAndTrangThaiAndKhuVucId(chuTroId, "BAO_TRI", khuVucId);
            
            //  Chọn hàm dựa trên việc xem cả năm hay xem tháng (Có xét khu vực)
            if (isCaNam) {
                sumNo = hoaDonRepository.sumTienNoTheoNamVaKhuVuc(khuVucId, "/" + nam);
            } else {
                sumNo = hoaDonRepository.sumTienNoTheoThangVaKhuVuc(khuVucId, currentMonthStr);
            }
            
            dsDoanhThu = hoaDonRepository.thongKeDoanhThuTheoKhuVucId(khuVucId);
            dsSuCo = suCoRepository.findAllByKhuVucId(khuVucId);
        }
        
        tongPh = soThue + soTrong + soBaoTri;
        Long tienNo = (sumNo != null) ? sumNo : 0L; 
        
        // Gán thông tin phòng và nợ vào response
        response.put("soPhongDaThue", soThue);
        response.put("soPhongTrong", soTrong);
        response.put("soPhongBaoTri", soBaoTri);
        response.put("tongSoPhong", tongPh);
        response.put("tyLeLapDay", tongPh > 0 ? Math.round(((double) soThue / tongPh) * 100) : 0);
        response.put("tienNo", tienNo); 
        
        response.put("thangThongKe", currentMonthStr); // Báo cho giao diện biết đang xem thời gian nào
        
        // XỬ LÝ DOANH THU THEO NĂM/THÁNG
        List<String> thangList = new ArrayList<>();
        List<Long> doanhThuList = new ArrayList<>();
        long doanhThuHienThi = 0L; 
        
        for (Object[] row : dsDoanhThu) {
            String thang = (String) row[0]; // Có dạng "MM/YYYY"
            Long dt = (Long) row[1];
            
            // Lọc doanh thu của các tháng thuộc năm đang xem
            if (thang.endsWith("/" + nam)) {
                thangList.add(thang);
                doanhThuList.add(dt);
                
                // Nếu xem cả năm, cộng dồn. Nếu xem từng tháng, lấy đúng tháng đó
                if (isCaNam) {
                    doanhThuHienThi += dt;
                } else if (thang.equals(currentMonthStr)) {
                    doanhThuHienThi = dt;
                }
            }
        }
        response.put("tongDoanhThuThang", doanhThuHienThi); 
        
        Long doanhThuNamData = hoaDonRepository.tinhTongDoanhThuTheoNam(chuTroId, nam);
        response.put("tongDoanhThuNam", doanhThuNamData != null ? doanhThuNamData : 0L);

        // XỬ LÝ CHI PHÍ SỰ CỐ THEO NĂM/THÁNG
        Map<String, Long> chiPhiMap = new HashMap<>();
        long chiPhiHienThi = 0L;
        
        for (SuCo sc : dsSuCo) {
            if (sc.getNgayBao() != null && sc.getNgayBao().getYear() == nam) {
                String thangBao = String.format("%02d/%d", sc.getNgayBao().getMonthValue(), nam);
                long tong = sc.getChiPhiTong() != null ? sc.getChiPhiTong() : 0L;
                long khachTra = sc.getChiPhiNguoiThue() != null ? sc.getChiPhiNguoiThue() : 0L;
                long chuTra = tong - khachTra; // Chỉ tính phần chi phí mà chủ trọ phải chịu
                
                chiPhiMap.put(thangBao, chiPhiMap.getOrDefault(thangBao, 0L) + chuTra);
                
                if (isCaNam) {
                    chiPhiHienThi += chuTra;
                } else if (thangBao.equals(currentMonthStr)) {
                    chiPhiHienThi += chuTra;
                }
            }
        }
        
        List<Long> chiPhiList = new ArrayList<>();
        for (String thang : thangList) {
            chiPhiList.add(chiPhiMap.getOrDefault(thang, 0L));
        }
        response.put("chiPhiSuCo", chiPhiHienThi);
        
        // Đóng gói biểu đồ
        Map<String, Object> bieuDo = new HashMap<>();
        bieuDo.put("thang", thangList);
        bieuDo.put("doanhThu", doanhThuList);
        bieuDo.put("chiPhi", chiPhiList);
        response.put("bieuDoDongTien", bieuDo);
        
        return response;
    }
}