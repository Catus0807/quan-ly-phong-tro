// Hàm phụ trợ: Đảo ngược YYYY-MM-DD thành DD/MM/YYYY
function formatNgayVN(dateStr) {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    let parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function taoNoiDungHopDong(data, soPhong, dienTich, giaThue, diaChi, tienCocFormat) {
    // Lật ngược các ngày tháng sang chuẩn Việt Nam
    let nsHopDong = data.ngaySinh ? data.ngaySinh.split('-').reverse().join('/') : '.............................................';
    let ngayBD = formatNgayVN(data.ngayBatDau);
    let ngayKT = formatNgayVN(data.ngayKetThuc);

    // Lấy thông tin Chủ trọ (Bên A) từ bộ nhớ đệm
    let tenChuTro = localStorage.getItem('adminName') || '.............................................';
    let cccdChuTro = localStorage.getItem('adminCCCD') || '.............................................';
    let sdtChuTro = localStorage.getItem('adminPhone') || '.............................................';

    return `
        <div style="font-family: 'Times New Roman', Times, serif; padding: 30px; font-size: 18px; line-height: 1.6; color: #000;">
            <!-- QUỐC HIỆU & TIÊU NGỮ -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0; font-size: 22px;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <h4 style="margin: 5px 0 0 0; font-size: 20px; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</h4>
            </div>

            <!-- TIÊU ĐỀ HỢP ĐỒNG -->
            <h2 style="text-align: center; font-size: 28px; margin-bottom: 25px;">HỢP ĐỒNG THUÊ PHÒNG TRỌ</h2>
            
            <p style="font-style: italic; text-align: right; margin-bottom: 25px; font-size: 17px;">
                Thời hạn thuê: Từ ngày <strong>${ngayBD}</strong> đến ngày <strong>${ngayKT}</strong>
            </p>

            <!-- THÔNG TIN HAI BÊN -->
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 15px; font-size: 20px;">ĐẠI DIỆN HAI BÊN GỒM CÓ:</h4>
                
                <p style="margin: 5px 0;"><strong>BÊN A (BÊN CHO THUÊ): ${tenChuTro.toUpperCase()}</strong></p>
                <table style="width: 100%; border: none; margin-bottom: 15px;">
                    <tr>
                        <td style="width: 50%; padding: 5px 0;">- CCCD/CMND: <strong>${cccdChuTro}</strong></td>
                        <td style="width: 50%; padding: 5px 0;">- Số điện thoại: <strong>${sdtChuTro}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 5px 0;">- Địa chỉ khu trọ: ${diaChi}</td>
                    </tr>
                </table>
                
                <p style="margin: 20px 0 5px 0;"><strong>BÊN B (BÊN THUÊ): ${data.tenKhach.toUpperCase()}</strong></p>
                <table style="width: 100%; border: none; margin-bottom: 15px;">
                    <tr>
                        <td style="width: 50%; padding: 5px 0;">- Ngày sinh: ${nsHopDong}</td>
                        <td style="width: 50%; padding: 5px 0;">- Giới tính: ${data.gioiTinh || '.............................................'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;">- CCCD/CMND: <strong>${data.cccd}</strong></td>
                        <td style="padding: 5px 0;">- Số điện thoại: <strong>${data.sdt}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 5px 0;">- Quê quán: ${data.queQuan || '.......................................................................................'}</td>
                    </tr>
                </table>
            </div>

            <!-- THÔNG TIN PHÒNG & GIÁ CẢ -->
            <div style="border: 1.5px solid #000; padding: 20px; margin-bottom: 30px; background-color: #fafafa;">
                <h4 style="margin-top: 0; margin-bottom: 15px; font-size: 20px;">THÔNG TIN PHÒNG THUÊ & THANH TOÁN:</h4>
                <table style="width: 100%; border: none;">
                    <tr>
                        <td style="width: 50%; padding: 8px 0;">- Số phòng: <strong>${soPhong}</strong></td>
                        <td style="width: 50%; padding: 8px 0;">- Diện tích: ${dienTich} m2</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">- Giá thuê: <strong style="color: #d9534f;">${giaThue}</strong> / tháng</td>
                        <td style="padding: 8px 0;">- Tiền cọc: <strong>${tienCocFormat}</strong></td>
                    </tr>
                </table>
            </div>

            <!-- ĐIỀU KHOẢN -->
            <div style="margin-bottom: 50px;">
                <h4 style="margin-bottom: 15px; font-size: 20px;">ĐIỀU KHOẢN CHUNG:</h4>
                <ol style="margin-top: 0; padding-left: 25px; text-align: justify;">
                    <li style="margin-bottom: 10px;">Hai bên cam kết thực hiện đúng các nội dung đã thỏa thuận trong hợp đồng.</li>
                    <li style="margin-bottom: 10px;">Bên thuê có trách nhiệm thanh toán đầy đủ, đúng hạn tiền thuê và các chi phí phát sinh.</li>
                    <li style="margin-bottom: 10px;">Bên thuê có trách nhiệm giữ gìn tài sản, nếu làm hư hỏng phải bồi thường theo thỏa thuận.</li>
                    <li style="margin-bottom: 10px;">Khi chấm dứt hợp đồng, bên thuê phải bàn giao lại phòng và tài sản trong tình trạng bình thường (trừ hao mòn tự nhiên).</li>
                    <li style="margin-bottom: 10px;">Mọi tranh chấp phát sinh được ưu tiên giải quyết bằng thương lượng; nếu không đạt được thỏa thuận thì thực hiện theo quy định của pháp luật.</li>
                </ol>
            </div>

            <!-- CHỮ KÝ -->
            <table style="width: 100%; text-align: center; margin-top: 40px; page-break-inside: avoid;">
                <tr>
                    <td style="width: 50%;">
                        <strong style="font-size: 19px;">BÊN A (CHỦ TRỌ)</strong><br>
                        <i style="font-size: 16px;">(Ký và ghi rõ họ tên)</i><br>
                        <br><br><br><br><br>
                        <strong>${tenChuTro}</strong>
                    </td>
                    <td style="width: 50%;">
                        <strong style="font-size: 19px;">BÊN B (NGƯỜI THUÊ)</strong><br>
                        <i style="font-size: 16px;">(Ký và ghi rõ họ tên)</i><br>
                        <br><br><br><br><br>
                        <strong>${data.tenKhach}</strong>
                    </td>
                </tr>
            </table>
        </div>
    `;
} 

// Hàm xuất file PDF cho hợp đồng
function taiHopDongPDF(elementId, tenFile) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert("Không tìm thấy nội dung hợp đồng!");
        return;
    }

    // Cấu hình file PDF xuất ra
    const opt = {
        margin:       0.5,
        filename:     tenFile || 'Hop_Dong_Thue_Phong.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}