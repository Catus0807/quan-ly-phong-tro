package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.SuCo;
import com.thuctap.quanlyphongtro.repository.HoaDonRepository;
import com.thuctap.quanlyphongtro.repository.PhongTroRepository;
import com.thuctap.quanlyphongtro.repository.SuCoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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
        
        LocalDate now = LocalDate.now();
        String currentMonthStr = (thangNam != null && !thangNam.isEmpty()) ? thangNam : String.format("%02d/%d", now.getMonthValue(), now.getYear());
        
        boolean isCaNam = currentMonthStr.startsWith("ALL/");
        int nam = Integer.parseInt(currentMonthStr.split("/")[1]);
        
        long soThue, soTrong, soBaoTri, tongPh;
        Long sumNo = 0L;
        List<Object[]> dsDoanhThu;
        List<SuCo> dsSuCo;
        
        // TRUY VẤN SỐ LIỆU PHÒNG & NỢ CƯỚC
        if (khuVucId == null) {
            soThue = phongTroRepository.countByChuTroIdAndTrangThai(chuTroId, "DANG_THUE");
            soTrong = phongTroRepository.countByChuTroIdAndTrangThai(chuTroId, "TRONG");
            soBaoTri = phongTroRepository.countByChuTroIdAndTrangThai(chuTroId, "BAO_TRI");
            
            if (isCaNam) {
                sumNo = hoaDonRepository.sumTienNoTheoNamThucTe(chuTroId, "/" + nam);
            } else {
                sumNo = hoaDonRepository.sumTienNoTheoThang(chuTroId, currentMonthStr);
            }
            
            //  Gọi hàm mới đã lọc theo chuTroId
            dsDoanhThu = hoaDonRepository.thongKeDoanhThuTheoChuTroId(chuTroId); 
            dsSuCo = suCoRepository.findAll();
        } else {
            soThue = phongTroRepository.countByChuTroIdAndTrangThaiAndKhuVucId(chuTroId, "DANG_THUE", khuVucId);
            soTrong = phongTroRepository.countByChuTroIdAndTrangThaiAndKhuVucId(chuTroId, "TRONG", khuVucId);
            soBaoTri = phongTroRepository.countByChuTroIdAndTrangThaiAndKhuVucId(chuTroId, "BAO_TRI", khuVucId);
            
            if (isCaNam) {
                //  Gọi hàm mới đã lọc theo chuTroId + khuVucId
                sumNo = hoaDonRepository.sumTienNoTheoNamVaKhuVuc(chuTroId, khuVucId, "/" + nam);
            } else {
                sumNo = hoaDonRepository.sumTienNoTheoThangVaKhuVuc(chuTroId, khuVucId, currentMonthStr);
            }
            
            dsDoanhThu = hoaDonRepository.thongKeDoanhThuTheoChuTroIdVaKhuVucId(chuTroId, khuVucId);
            dsSuCo = suCoRepository.findAllByKhuVucId(khuVucId);
        }

        //  Lọc sạch mảng Sự cố, bắt buộc phải thuộc về Chủ trọ đang đăng nhập
        dsSuCo = dsSuCo.stream().filter(sc -> {
            if (sc.getChuTro() != null && sc.getChuTro().getId().equals(chuTroId)) return true;
            if (sc.getPhongTro() != null && sc.getPhongTro().getChuTro() != null && sc.getPhongTro().getChuTro().getId().equals(chuTroId)) return true;
            return false;
        }).collect(Collectors.toList());
        
        tongPh = soThue + soTrong + soBaoTri;
        Long tienNo = (sumNo != null) ? sumNo : 0L; 
        
        response.put("soPhongDaThue", soThue);
        response.put("soPhongTrong", soTrong);
        response.put("soPhongBaoTri", soBaoTri);
        response.put("tongSoPhong", tongPh);
        response.put("tyLeLapDay", tongPh > 0 ? Math.round(((double) soThue / tongPh) * 100) : 0);
        response.put("tienNo", tienNo); 
        
        response.put("thangThongKe", currentMonthStr); 
        
        // XỬ LÝ DOANH THU THEO NĂM/THÁNG
        List<String> thangList = new ArrayList<>();
        List<Long> doanhThuList = new ArrayList<>();
        long doanhThuHienThi = 0L; 
        
        for (Object[] row : dsDoanhThu) {
            String thang = (String) row[0]; 
            Long dt = (Long) row[1];
            
            if (thang.endsWith("/" + nam)) {
                thangList.add(thang);
                doanhThuList.add(dt);
                
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
                long chuTra = tong - khachTra; 
                
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
        
        Map<String, Object> bieuDo = new HashMap<>();
        bieuDo.put("thang", thangList);
        bieuDo.put("doanhThu", doanhThuList);
        bieuDo.put("chiPhi", chiPhiList);
        response.put("bieuDoDongTien", bieuDo);
        
        return response;
    }
}