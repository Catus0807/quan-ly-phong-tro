package com.thuctap.quanlyphongtro.service;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // DÁN URL GOOGLE APPS SCRIPT 
    private static final String WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxcU4jVMeO4LQIRTxUoFPnIfjP6ee1HUGm1LMRhpc2Kr04XDe4VZKjlZLPFAwykllyx/exec";

    @Async
    public void guiEmailThongBaoDuyet(String emailNhan, String hoTenChuTro) {
        try {
            String noiDung = "Kính chào " + hoTenChuTro + ",\n\n"
                    + "Ban quản trị Trọ Xanh xin thông báo tài khoản quản lý nhà trọ của bạn đã được phê duyệt thành công.\n"
                    + "Ngay bây giờ, bạn có thể đăng nhập vào hệ thống để bắt đầu quản lý phòng trọ, khách thuê và doanh thu.\n\n"
                    + "Truy cập hệ thống tại: https://quan-ly-phong-tro-w33k.onrender.com/login.html\n\n"
                    + "Nếu cần hỗ trợ, vui lòng liên hệ Hotline: 0869 081 854\n\n"
                    + "Trân trọng,\nBan quản trị Trọ Xanh.";

            // Đóng gói dữ liệu thành chuẩn JSON (Xử lý cả ký tự xuống dòng)
            String jsonInputString = "{"
                    + "\"to\": \"" + emailNhan + "\","
                    + "\"subject\": \"🎉 Chúc mừng! Tài khoản Trọ Xanh của bạn đã được kích hoạt\","
                    + "\"body\": \"" + noiDung.replace("\n", "\\n") + "\""
                    + "}";

            // Mở cổng HTTPS (Port 443) tới Google để lách tường lửa Render
            URL url = java.net.URI.create(WEBHOOK_URL).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; utf-8");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);

            // Bắn JSON đi
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            logger.info("✅ Đã gọi Serverless Webhook gửi mail tới: {} (HTTP Code: {})", emailNhan, responseCode);

        } catch (Exception e) {
            logger.error("❌ Lỗi hệ thống khi gọi Webhook gửi email tới {}: {}", emailNhan, e.getMessage());
        }
    }
}