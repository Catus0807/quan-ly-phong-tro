// Hàm sinh ra mã HTML cho tờ khai CT01
function getTemplateCT01(data) {
    // Tạo ô vuông cho CCCD Khách thuê
    let cccdBoxes = '';
    const cccdStr = data.cccd || '';
    for(let i = 0; i < 12; i++) {
        const char = cccdStr[i] || '';
        cccdBoxes += `<span style="display: inline-block; width: 20px; height: 25px; border: 1px solid black; text-align: center; line-height: 25px; margin-right: 2px;">${char}</span>`;
    }

    // Tạo ô vuông cho CCCD Chủ trọ
    let cccdChuTroBoxes = '';
    const cccdChuTroStr = data.cccdChuTro || '';
    for(let i = 0; i < 12; i++) {
        const char = cccdChuTroStr[i] || '';
        cccdChuTroBoxes += `<span style="display: inline-block; width: 20px; height: 25px; border: 1px solid black; text-align: center; line-height: 25px; margin-right: 2px;">${char}</span>`;
    }

    return `
    <div style="font-family: 'Times New Roman', Times, serif; color: black; padding: 20px 40px; background: white; width: 100%; max-width: 800px; margin: 0 auto; font-size: 13pt; line-height: 1.5;">
        
        <!-- Header -->
        <div style="text-align: right; font-size: 11pt; margin-bottom: 20px;">
            <p style="margin: 0;">Mẫu CT01 ban hành kèm theo Thông tư số 53/2025/TT-BCA</p>
            <p style="margin: 0;">ngày 01/7/2025 của Bộ trưởng Bộ Công an</p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
            <strong style="font-size: 14pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
            <strong style="font-size: 14pt; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</strong>
        </div>

        <!-- Tiêu đề -->
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-weight: bold; font-size: 16pt;">TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ</h2>
        </div>

        <!-- Nội dung (Đã sửa lỗi justify) -->
        <div style="text-align: left;">
            <p style="margin-bottom: 8px;">Kính gửi<sup>(1)</sup>: Công an quận <span style="font-weight: bold; text-transform: capitalize;">${data.kinhGui}</span></p>
            
            <p style="margin-bottom: 8px;">1. Họ, chữ đệm và tên khai sinh: <span style="text-transform: uppercase;">${data.hoTen}</span></p>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="width: 55%;">2. Ngày, tháng, năm sinh: ${data.ngaySinh}</div>
                <div style="width: 45%;">3. Giới tính: ${data.gioiTinh}</div>
            </div>

            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 15px;">4. Số định danh cá nhân:</span>
                <div>${cccdBoxes}</div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="width: 55%;">5. Số điện thoại liên hệ: ${data.sdt}</div>
                <div style="width: 45%;">6. Email: .....................................................</div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="width: 55%;">7. Họ, chữ đệm và tên chủ hộ: <span style="text-transform: uppercase; font-weight: bold;">${data.tenChuTro}</span></div>
                <div style="width: 45%;">8. Mối quan hệ với chủ hộ: <strong>Thuê nhà</strong></div>
            </div>

            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="margin-right: 15px;">9. Số định danh cá nhân của chủ hộ:</span>
                <div>${cccdChuTroBoxes}</div>
            </div>

            <p style="margin-bottom: 15px;">10. Nội dung đề nghị<sup>(2)</sup>: <span style="font-weight: bold;">Đăng ký tạm trú tại ${data.choOHienTai}</span></p>
            
            <p style="margin-bottom: 5px;">11. Những thành viên trong hộ gia đình cùng thay đổi:</p>
            
            <!-- Bảng thành viên -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center; font-size: 11pt;">
                <thead>
                    <tr>
                        <th style="border: 1px solid black; padding: 5px; width: 5%;">TT</th>
                        <th style="border: 1px solid black; padding: 5px; width: 30%;">Họ, chữ đệm<br>và tên</th>
                        <th style="border: 1px solid black; padding: 5px; width: 20%;">Ngày, tháng,<br>năm sinh</th>
                        <th style="border: 1px solid black; padding: 5px; width: 10%;">Giới<br>tính</th>
                        <th style="border: 1px solid black; padding: 5px; width: 20%;">Số định danh<br>cá nhân</th>
                        <th style="border: 1px solid black; padding: 5px; width: 15%;">Mối quan hệ<br>với chủ hộ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="border: 1px solid black; padding: 12px;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td></tr>
                    <tr><td style="border: 1px solid black; padding: 12px;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td></tr>
                    <tr><td style="border: 1px solid black; padding: 12px;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td><td style="border: 1px solid black;"></td></tr>
                </tbody>
            </table>
        </div>

        <!-- Chữ ký 4 bên -->
        <div style="display: flex; justify-content: space-between; text-align: center; font-size: 11pt; margin-top: 10px;">
            <div style="width: 24%;">
                <i style="font-size: 10pt;">Ngày ${data.ngayKhaiNgay} tháng ${data.ngayKhaiThang} năm ${data.ngayKhaiNam}</i><br>
                <strong>Ý KIẾN CỦA CHỦ HỘ<sup>(3)</sup></strong>
                <div style="height: 70px;"></div>
            </div>
            <div style="width: 26%;">
                <i style="font-size: 10pt;">Ngày ${data.ngayKhaiNgay} tháng ${data.ngayKhaiThang} năm ${data.ngayKhaiNam}</i><br>
                <strong>Ý KIẾN CỦA CHỦ SỞ HỮU<br>CHỖ Ở HỢP PHÁP<sup>(4)</sup></strong>
                <div style="height: 70px;"></div>
                <strong>${data.tenChuTro}</strong>
            </div>
            <div style="width: 25%;">
                <i style="font-size: 10pt;">Ngày ${data.ngayKhaiNgay} tháng ${data.ngayKhaiThang} năm ${data.ngayKhaiNam}</i><br>
                <strong>Ý KIẾN CỦA CHA, MẸ HOẶC<br>NGƯỜI GIÁM HỘ<sup>(5)</sup></strong>
                <div style="height: 70px;"></div>
            </div>
            <div style="width: 25%;">
                <i style="font-size: 10pt;">Ngày ${data.ngayKhaiNgay} tháng ${data.ngayKhaiThang} năm ${data.ngayKhaiNam}</i><br>
                <strong>NGƯỜI KÊ KHAI<sup>(6)</sup></strong>
                <div style="height: 70px;"></div>
                <strong style="text-transform: uppercase;">${data.hoTen}</strong>
            </div>
        </div>
    </div>
    `;
}