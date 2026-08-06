package com.thuctap.quanlyphongtro.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void guiEmailThongBaoDuyet(String emailNhan, String hoTenChuTro) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailNhan);
        message.setSubject("🎉 Chúc mừng! Tài khoản Trọ Xanh của bạn đã được kích hoạt");
        
        String noiDung = "Kính chào " + hoTenChuTro + ",\n\n"
                + "Ban quản trị Trọ Xanh xin thông báo tài khoản quản lý nhà trọ của bạn đã được phê duyệt thành công.\n"
                + "Ngay bây giờ, bạn có thể đăng nhập vào hệ thống để bắt đầu quản lý phòng trọ, khách thuê và doanh thu.\n\n"
                + "Truy cập hệ thống tại: http://localhost:5500/login.html\n\n"
                + "Nếu cần hỗ trợ, vui lòng liên hệ Hotline: 0987.xxx.xxx\n\n"
                + "Trân trọng,\nBan quản trị Trọ Xanh.";
                
        message.setText(noiDung);
        
        // Gửi email trên một luồng riêng để không làm chậm trang web
        new Thread(() -> {
            try {
                mailSender.send(message);
            } catch (Exception e) {
                System.out.println("Lỗi khi gửi email: " + e.getMessage());
            }
        }).start();
    }
}