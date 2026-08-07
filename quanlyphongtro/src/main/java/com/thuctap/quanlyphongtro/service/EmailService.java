package com.thuctap.quanlyphongtro.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    // Sử dụng @Async của Spring Boot thay vì tự tạo Thread thủ công
    @Async
    public void guiEmailThongBaoDuyet(String emailNhan, String hoTenChuTro) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(emailNhan);
            message.setSubject("🎉 Chúc mừng! Tài khoản Trọ Xanh của bạn đã được kích hoạt");
            
            String noiDung = "Kính chào " + hoTenChuTro + ",\n\n"
                    + "Ban quản trị Trọ Xanh xin thông báo tài khoản quản lý nhà trọ của bạn đã được phê duyệt thành công.\n"
                    + "Ngay bây giờ, bạn có thể đăng nhập vào hệ thống để bắt đầu quản lý phòng trọ, khách thuê và doanh thu.\n\n"
                    + "Truy cập hệ thống tại: https://quan-ly-phong-tro-w33k.onrender.com/login.html\n\n"
                    + "Nếu cần hỗ trợ, vui lòng liên hệ Hotline: 0869 081 854\n\n"
                    + "Trân trọng,\nBan quản trị Trọ Xanh.";
                    
            message.setText(noiDung);
            mailSender.send(message);
            
            logger.info("✅ Đã gửi email thành công tới: {}", emailNhan);
            
        } catch (Exception e) {
            // Ghi log lỗi chi tiết ra hệ thống để kiểm tra trên Render
            logger.error("❌ LỖI GỬI EMAIL tới {}: {}", emailNhan, e.getMessage());
        }
    }
}