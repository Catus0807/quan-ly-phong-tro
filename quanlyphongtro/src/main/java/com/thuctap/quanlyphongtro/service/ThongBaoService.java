package com.thuctap.quanlyphongtro.service;

import com.thuctap.quanlyphongtro.entity.ThongBao;
import com.thuctap.quanlyphongtro.repository.ThongBaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ThongBaoService {
    @Autowired
    private ThongBaoRepository thongBaoRepository;

    // Hàm tiện ích để các tính năng khác gọi và tạo thông báo nhanh
    public void taoThongBao(String tieuDe, String noiDung, String loaiNguoiNhan, Long nguoiNhanId, String loaiThongBao) {
        ThongBao tb = new ThongBao();
        tb.setTieuDe(tieuDe);
        tb.setNoiDung(noiDung);
        tb.setLoaiNguoiNhan(loaiNguoiNhan);
        tb.setNguoiNhanId(nguoiNhanId);
        tb.setLoaiThongBao(loaiThongBao);
        thongBaoRepository.save(tb);
    }

    public void taoThongBao(String tieuDe, String noiDung, String loaiNguoiNhan, Long nguoiNhanId, String loaiThongBao, Long thamChieuId) {
        ThongBao tb = new ThongBao();
        tb.setTieuDe(tieuDe);
        tb.setNoiDung(noiDung);
        tb.setLoaiNguoiNhan(loaiNguoiNhan);
        tb.setNguoiNhanId(nguoiNhanId);
        tb.setLoaiThongBao(loaiThongBao);
        tb.setThamChieuId(thamChieuId); 
        thongBaoRepository.save(tb);
    }

    public List<ThongBao> layDanhSachThongBao(String loaiNguoiNhan, Long nguoiNhanId) {
        return thongBaoRepository.findByLoaiNguoiNhanAndNguoiNhanIdOrderByNgayTaoDesc(loaiNguoiNhan, nguoiNhanId);
    }

    public long demThongBaoChuaDoc(String loaiNguoiNhan, Long nguoiNhanId) {
        return thongBaoRepository.countByLoaiNguoiNhanAndNguoiNhanIdAndDaDocFalse(loaiNguoiNhan, nguoiNhanId);
    }

    public void danhDauDaDoc(Long id) {
        thongBaoRepository.findById(id).ifPresent(tb -> {
            tb.setDaDoc(true);
            thongBaoRepository.save(tb);
        });
    }

    // Xóa 1 thông báo
    public void xoaThongBao(Long id) {
        thongBaoRepository.deleteById(id);
    }

    // Xóa tất cả thông báo của 1 người dùng
    public void xoaTatCaThongBao(String loaiNguoiNhan, Long nguoiNhanId) {
        thongBaoRepository.deleteByLoaiNguoiNhanAndNguoiNhanId(loaiNguoiNhan, nguoiNhanId);
    } 
}