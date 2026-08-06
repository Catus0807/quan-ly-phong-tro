let dongTienChart = null;
let trangThaiPhongChart = null;

function fetchThongKe() {
    const chuTroId = localStorage.getItem('chuTroId');
    if (!chuTroId) return;
    
    const chiNhanh = document.getElementById('globalKhuVucFilter')?.value || '';
    const thangInput = document.getElementById('inputThangThongKe');
    const switchCaNam = document.getElementById('switchCaNam'); 
    const txtTieuDe = document.getElementById('txtTieuDeThang'); 
    let thangNam = '';
    let year = new Date().getFullYear();
    
    if (thangInput && thangInput.value) {
        const [y, m] = thangInput.value.split('-');
        year = y;
        
        if (switchCaNam && switchCaNam.checked) {
            thangInput.disabled = true;
            txtTieuDe.innerText = `- Tổng quan năm ${year}`;
            thangNam = `ALL/${year}`; 
        } else {
            thangInput.disabled = false;
            txtTieuDe.innerText = `- Tháng ${m}/${y}`;
            thangNam = `${m}/${y}`;
        }
    }
    
    let url = `http://localhost:8080/api/thong-ke/chu-tro/${chuTroId}/tong-quan?t=${new Date().getTime()}`;
    if (chiNhanh) url += `&khuVucId=${chiNhanh}`;
    if (thangNam) url += `&thangNam=${thangNam}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            window.thongKeDataToExport = data; 
            renderDuLieuThongKe(data);
            
            if (data.thangThongKe.includes('ALL')) {
                const namBc = data.thangThongKe.split('/')[1];
                document.getElementById('lbl-doanh-thu-thang').innerText = `TỔNG THU NĂM ${namBc}`;
            } else {
                document.getElementById('lbl-doanh-thu-thang').innerText = `DOANH THU THÁNG ${data.thangThongKe}`;
            }
            fetchWidgetCanhBao(chuTroId, chiNhanh, data.thangThongKe); 
        })
        .catch(err => console.error("Lỗi tải dữ liệu thống kê:", err));
}

function renderDuLieuThongKe(data) {
    const isCaNam = data.thangThongKe.includes('ALL');
    const namBc = data.thangThongKe.split('/')[1];
    
    if (isCaNam) {
        document.getElementById('txtTieuDeThang').innerText = "- Tổng quan năm " + namBc;
        document.getElementById('lbl-doanh-thu-thang').innerText = `TỔNG THU NĂM ${namBc}`;
    } else {
        document.getElementById('txtTieuDeThang').innerText = "- Tháng " + data.thangThongKe;
        document.getElementById('lbl-doanh-thu-thang').innerText = `DOANH THU THÁNG ${data.thangThongKe}`;
    }
    
    const thangInput = document.getElementById('inputThangThongKe');
    if (thangInput && !thangInput.value && !isCaNam) {
        const [mm, yyyy] = data.thangThongKe.split('/');
        thangInput.value = `${yyyy}-${mm}`;
    }
    
    document.getElementById('tk-doanh-thu').innerText = (data.tongDoanhThuThang || 0).toLocaleString('vi-VN') + ' đ';
    document.getElementById('tk-doanh-thu-nam').innerText = (data.tongDoanhThuNam || 0).toLocaleString('vi-VN') + ' đ';
    document.getElementById('tk-lap-day').innerText = (data.tyLeLapDay || 0) + '%';
    
    const no = data.tienNo || 0;
    const thu = data.tongDoanhThuThang || 0;
    const tyLeThu = (thu + no === 0) ? 0 : Math.round((thu / (thu + no)) * 100);
    
    const elTienNo = document.getElementById('tk-tien-no');
    if (elTienNo) elTienNo.innerText = "Nợ: " + no.toLocaleString('vi-VN') + ' đ';
    
    const badgeTyLe = document.getElementById('tk-ty-le-thu');
    if (badgeTyLe) {
        badgeTyLe.innerText = tyLeThu + '%';
        badgeTyLe.className = tyLeThu < 80 ? 'fw-bold text-danger' : 'fw-bold text-success';
    }
    document.getElementById('tk-chi-phi').innerText = (data.chiPhiSuCo || 0).toLocaleString('vi-VN') + ' đ';
    
    document.getElementById('tk-so-phong-thue').innerText = data.soPhongDaThue || 0;
    document.getElementById('tk-so-phong-trong').innerText = data.soPhongTrong || 0;
    document.getElementById('tk-so-phong-bao-tri').innerText = data.soPhongBaoTri || 0;
    document.getElementById('tk-tong-phong').innerText = data.tongSoPhong || 0;
    
    const ctxDongTien = document.getElementById('dongTienChart').getContext('2d');
    if (dongTienChart) dongTienChart.destroy();
    const bieuDo = data.bieuDoDongTien || { thang: [], doanhThu: [], chiPhi: [] };
    
    dongTienChart = new Chart(ctxDongTien, {
        type: 'bar',
        data: {
            labels: bieuDo.thang,
            datasets: [
                { label: 'Doanh thu (VNĐ)', backgroundColor: '#198754', data: bieuDo.doanhThu, borderRadius: 4 },
                { label: 'Chi phí Sự cố (VNĐ)', backgroundColor: '#ffc107', data: bieuDo.chiPhi, borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    const ctxPhong = document.getElementById('trangThaiPhongChart').getContext('2d');
    if (trangThaiPhongChart) trangThaiPhongChart.destroy();
    
    trangThaiPhongChart = new Chart(ctxPhong, {
        type: 'doughnut',
        data: {
            labels: ['Đang thuê', 'Phòng trống', 'Bảo trì'],
            datasets: [{
                data: [data.soPhongDaThue || 0, data.soPhongTrong || 0, data.soPhongBaoTri || 0],
                backgroundColor: ['#0d6efd', '#198754', '#6c757d'], 
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
    });
}

function fetchWidgetCanhBao(chuTroId, chiNhanh, thangNam) {
    // Quét Hóa đơn nợ cước
    let urlHd = `http://localhost:8080/api/hoa-don`;
    if(chiNhanh) urlHd += `/loc-chi-nhanh?khuVucId=${chiNhanh}`;
    fetch(urlHd)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tk-bang-no-cuoc');
            if(!tbody) return;
            tbody.innerHTML = '';
            
            // ĐÃ THÊM LỌC: Bắt buộc chỉ lấy Hóa đơn thuộc về chuTroId đang đăng nhập
            const myData = data.filter(hd => {
                if (hd.chuTro && String(hd.chuTro.id) === String(chuTroId)) return true;
                if (hd.phongTro && hd.phongTro.chuTro && String(hd.phongTro.chuTro.id) === String(chuTroId)) return true;
                return false;
            });
            
            const noList = myData.filter(hd => hd.trangThai === 'CHUA_THU');
            
            if(noList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-success fw-bold py-3"><i class="bi bi-check-circle-fill"></i> Không có phòng nào đang nợ cước.</td></tr>';
            } else {
                noList.sort((a,b) => {
                    const [m1, y1] = a.thangThu.split('/');
                    const [m2, y2] = b.thangThu.split('/');
                    return new Date(y1, m1-1) - new Date(y2, m2-1);
                });
                noList.slice(0, 5).forEach(hd => {
                    const current = new Date();
                    const [m, y] = hd.thangThu.split('/');
                    const thoiGianNo = new Date(y, m-1);
                    const thoiGianHienTai = new Date(current.getFullYear(), current.getMonth());
                    let badge = '<span class="badge bg-warning text-dark">Chưa đóng</span>';
                    if(thoiGianNo < thoiGianHienTai) {
                        badge = '<span class="badge bg-danger shadow-sm"><i class="bi bi-exclamation-triangle"></i> Quá hạn</span>';
                    }
                    
                    const cn = hd.phongTro ? hd.phongTro.diaChi : '---';
                    tbody.innerHTML += `
                        <tr>
                            <td class="text-start" style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cn}">${cn}</td>
                            <td class="fw-bold text-primary">P.${hd.phongTro ? hd.phongTro.soPhong : ''}</td>
                            <td>${hd.thangThu}</td>
                            <td class="fw-bold text-danger">${(hd.tongTien || 0).toLocaleString('vi-VN')} đ</td>
                            <td>${badge}</td>
                        </tr>
                    `;
                });
            }
        });

    // Quét Hợp đồng sắp hết hạn
    let urlKhach = `http://localhost:8080/api/nguoi-thue/chu-tro/${chuTroId}`;
    if(chiNhanh) urlKhach += `/loc-chi-nhanh?khuVucId=${chiNhanh}`;
    fetch(urlKhach)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tk-bang-het-han');
            if(!tbody) return;
            tbody.innerHTML = '';
            let hetHanList = data.filter(k => k.ngayKetThuc != null);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            
            hetHanList = hetHanList.filter(k => {
                const [y, m, d] = k.ngayKetThuc.split('-');
                const ngayKetThuc = new Date(y, m - 1, d); 
                
                const soNgayConLai = Math.ceil((ngayKetThuc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                let thuocThangDangXem = false;
                if (thangNam) {
                    if (thangNam.startsWith("ALL/")) {
                        const namDangXem = thangNam.split("/")[1];
                        thuocThangDangXem = (String(ngayKetThuc.getFullYear()) === namDangXem);
                    } else {
                        const mm = String(ngayKetThuc.getMonth() + 1).padStart(2, '0');
                        thuocThangDangXem = (`${mm}/${ngayKetThuc.getFullYear()}` === thangNam);
                    }
                }
                
                const laCanhBaoGap = (soNgayConLai <= 30);
                return thuocThangDangXem || laCanhBaoGap;
            });
            
            hetHanList.sort((a,b) => new Date(a.ngayKetThuc) - new Date(b.ngayKetThuc));
            
            if(hetHanList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-success fw-bold py-3"><i class="bi bi-shield-check"></i> An toàn! Không có hợp đồng nào hết hạn trong khoảng thời gian này.</td></tr>`;
            } else {
                hetHanList.slice(0, 5).forEach(k => {
                    const [y, m, d] = k.ngayKetThuc.split('-');
                    const ngayKT = new Date(y, m - 1, d);
                    const soNgay = Math.ceil((ngayKT.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    let trangThai = '';
                    if (soNgay < 0) {
                        trangThai = `<span class="badge bg-dark">Đã hết hạn</span>`;
                    } else if (soNgay <= 15) {
                        trangThai = `<span class="badge bg-danger shadow-sm">Còn ${soNgay} ngày</span>`;
                    } else if (soNgay <= 30) {
                        trangThai = `<span class="badge bg-warning text-dark">Còn ${soNgay} ngày</span>`;
                    } else {
                        trangThai = `<span class="badge bg-info text-dark">Còn ${soNgay} ngày</span>`;
                    }
                    
                    const cn = k.phongTro ? k.phongTro.diaChi : '---';
                    tbody.innerHTML += `
                        <tr>
                            <td class="text-start" style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cn}">${cn}</td>
                            <td class="fw-bold text-primary">P.${k.phongTro ? k.phongTro.soPhong : 'N/A'}</td>
                            <td>${k.tenKhach}</td>
                            <td>${k.ngayKetThuc.split('-').reverse().join('/')}</td>
                            <td>${trangThai}</td>
                        </tr>
                    `;
                });
            }
        });
}

// CHỨC NĂNG XUẤT EXCEL 
function xuatBaoCaoExcel(loai) {
    if (!window.thongKeDataToExport) return alert("Chưa có dữ liệu thống kê để xuất!");
    
    const data = window.thongKeDataToExport;
    const thangHienThi = data.thangThongKe;
    const wb = XLSX.utils.book_new();
    const chuTroId = localStorage.getItem('chuTroId');
    const selectChiNhanh = document.getElementById('globalKhuVucFilter');
    let tenChiNhanh = "Tất cả chi nhánh";
    let chiNhanhId = "";
    
    if (selectChiNhanh && selectChiNhanh.selectedIndex > 0) {
        tenChiNhanh = selectChiNhanh.options[selectChiNhanh.selectedIndex].text;
        chiNhanhId = selectChiNhanh.value;
    }
    
    if (loai === 'nam') {
        const namBaoCao = thangHienThi.split('/')[1];
        let excelData = [
            ["HỆ THỐNG QUẢN LÝ TRỌ XANH"],
            ["BÁO CÁO TỔNG HỢP NĂM " + namBaoCao],
            ["Chi nhánh: " + tenChiNhanh],
            ["Ngày xuất: " + new Date().toLocaleDateString('vi-VN')],
            [""],
            ["I. THỐNG KÊ TỔNG QUAN NĂM"],
            ["Tổng số phòng", data.tongSoPhong],
            ["Tỷ lệ lấp đầy", data.tyLeLapDay + "%"],
            ["Tổng thu lũy kế (VNĐ)", data.tongDoanhThuNam],
            ["Tổng nợ chưa thu (VNĐ)", data.tienNo],
            [""],
            ["II. CHI TIẾT DÒNG TIỀN THEO CHI NHÁNH"]
        ];
        
        const hoanTatXuatExcel = (sheetData) => {
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws, "BaoCaoNam");
            let safeName = tenChiNhanh.replace(/,/g, '').replace(/\s+/g, '_');
            XLSX.writeFile(wb, `Bao_Cao_Nam_${namBaoCao}_${safeName}.xlsx`);
        };
        
        if (chiNhanhId === "") {
            const dsChiNhanh = Array.from(selectChiNhanh.options).filter(opt => opt.value !== "");
            if (dsChiNhanh.length === 0) return alert("Không có chi nhánh nào để xuất!");
            const promises = dsChiNhanh.map(cn => {
                let url = `http://localhost:8080/api/thong-ke/chu-tro/${chuTroId}/tong-quan?khuVucId=${cn.value}&thangNam=${thangHienThi}`;
                return fetch(url).then(res => res.json()).then(resData => ({
                    tenCN: cn.text,
                    bieuDo: resData.bieuDoDongTien
                }));
            });
            Promise.all(promises).then(results => {
                let tongThuHeThong = 0; let tongChiHeThong = 0;
                results.forEach(res => {
                    excelData.push([`📍 CHI NHÁNH: ${res.tenCN.toUpperCase()}`]);
                    excelData.push(["Tháng", "Doanh Thu (VNĐ)", "Chi Phí Sự Cố (VNĐ)", "Lợi Nhuận Thực (VNĐ)"]);
                    let tongThuCN = 0; let tongChiCN = 0;
                    for(let i = 0; i < res.bieuDo.thang.length; i++) {
                        let dt = res.bieuDo.doanhThu[i] || 0;
                        let cp = res.bieuDo.chiPhi[i] || 0;
                        excelData.push([ res.bieuDo.thang[i], dt, cp, dt - cp ]);
                        tongThuCN += dt; tongChiCN += cp;
                    }
                    excelData.push(["TỔNG CHI NHÁNH", tongThuCN, tongChiCN, tongThuCN - tongChiCN]);
                    excelData.push([""]); 
                    tongThuHeThong += tongThuCN; tongChiHeThong += tongChiCN;
                });
                excelData.push(["====================================="]);
                excelData.push(["TỔNG CỘNG TẤT CẢ CHI NHÁNH", tongThuHeThong, tongChiHeThong, tongThuHeThong - tongChiHeThong]);
                hoanTatXuatExcel(excelData);
            });
        } else {
            excelData.push(["Tháng", "Doanh Thu (VNĐ)", "Chi Phí Sự Cố (VNĐ)", "Lợi Nhuận Thực (VNĐ)"]);
            let tongThuCN = 0; let tongChiCN = 0;
            const bieuDo = data.bieuDoDongTien;
            for(let i = 0; i < bieuDo.thang.length; i++) {
                let dt = bieuDo.doanhThu[i] || 0; let cp = bieuDo.chiPhi[i] || 0;
                excelData.push([ bieuDo.thang[i], dt, cp, dt - cp ]);
                tongThuCN += dt; tongChiCN += cp;
            }
            excelData.push(["TỔNG CHI NHÁNH", tongThuCN, tongChiCN, tongThuCN - tongChiCN]);
            hoanTatXuatExcel(excelData);
        }
    } else if (loai === 'thang') {
        let urlHd = `http://localhost:8080/api/hoa-don`;
        let urlSc = `http://localhost:8080/api/su-co`;
        Promise.all([
            fetch(urlHd).then(res => res.json()),
            fetch(urlSc).then(res => res.json())
        ]).then(([hoaDons, suCos]) => {
            
            // ĐÃ THÊM LỌC: Bắt buộc chỉ lấy Hóa đơn thuộc về chuTroId đang đăng nhập
            let myHoaDons = hoaDons.filter(hd => {
                if (hd.chuTro && String(hd.chuTro.id) === String(chuTroId)) return true;
                if (hd.phongTro && hd.phongTro.chuTro && String(hd.phongTro.chuTro.id) === String(chuTroId)) return true;
                return false;
            });
            
            let dsThang = myHoaDons.filter(hd => hd.thangThu === thangHienThi);
            if (chiNhanhId) {
                dsThang = dsThang.filter(hd => hd.phongTro && hd.phongTro.khuVuc && String(hd.phongTro.khuVuc.id) === String(chiNhanhId));
            }
            
            let dsSuCoThang = suCos.filter(sc => {
                if (!sc.ngayBao) return false;
                
                let thuocChuTro = false;
                if (sc.chuTro && String(sc.chuTro.id) === String(chuTroId)) {
                    thuocChuTro = true;
                } 
                else if (sc.phongTro && sc.phongTro.chuTro && String(sc.phongTro.chuTro.id) === String(chuTroId)) {
                    thuocChuTro = true;
                }
                if (!thuocChuTro) return false;
                
                const parts = sc.ngayBao.split('-'); 
                if (parts.length >= 2) {
                    const scThang = `${parts[1]}/${parts[0]}`;
                    return scThang === thangHienThi;
                }
                return false;
            });
            
            if (chiNhanhId) {
                dsSuCoThang = dsSuCoThang.filter(sc => {
                    if (sc.phongTro && sc.phongTro.khuVuc) {
                        return String(sc.phongTro.khuVuc.id) === String(chiNhanhId);
                    }
                    if (!sc.phongTro && sc.chiNhanh === tenChiNhanh) {
                        return true;
                    }
                    return false;
                });
            }
            
            let excelData = [
                ["HỆ THỐNG QUẢN LÝ TRỌ XANH"],
                ["BÁO CÁO CHI TIẾT DOANH THU & CHI PHÍ THÁNG " + thangHienThi],
                ["", "Chi nhánh: " + tenChiNhanh],
                ["", "Ngày xuất: " + new Date().toLocaleDateString('vi-VN')],
                [""],
                ["I. TỔNG QUAN THÁNG"],
                ["", "Doanh thu trong tháng", data.tongDoanhThuThang],
                ["", "Chi phí bảo trì, sự cố", data.chiPhiSuCo],
                ["", "Số phòng đang thuê", data.soPhongDaThue],
                [""],
                ["II. BẢNG KÊ CHI TIẾT TIỀN PHÒNG & DỊCH VỤ"],
                ["STT", "Chi Nhánh", "Phòng", "Tiền Phòng", "Số Ký Điện", "Tiền Điện", "Số Khối Nước", "Tiền Nước", "Phụ Phí", "Tổng Tiền", "Trạng Thái Thu"]
            ];
            
            dsThang.forEach((hd, i) => {
                let soDien = Math.max(0, (hd.soDienMoi || 0) - (hd.soDienCu || 0));
                let tienDien = soDien * (hd.giaDien || 0);
                let soNuoc = Math.max(0, (hd.soNuocMoi || 0) - (hd.soNuocCu || 0));
                let tienNuoc = soNuoc * (hd.giaNuoc || 0);
                let cn = hd.phongTro && hd.phongTro.khuVuc ? hd.phongTro.khuVuc.tenKhuVuc : "---";
                excelData.push([
                    i + 1, cn, "P." + (hd.phongTro ? hd.phongTro.soPhong : "N/A"),
                    hd.tienPhong || 0, soDien, tienDien, soNuoc, tienNuoc,
                    hd.phuPhi || 0, hd.tongTien || 0, hd.trangThai === 'DA_THU' ? 'Đã thu' : 'CHƯA THU'
                ]);
            });
            
            excelData.push([""]);
            excelData.push(["III. BẢNG KÊ CHI PHÍ BẢO TRÌ & SỰ CỐ"]);
            excelData.push(["STT", "Chi Nhánh", "Vị Trí / Phòng", "Ngày Báo", "Tên Sự Cố", "Tổng Chi Phí", "Khách Trả", "Chủ Trọ Chịu"]);
            
            if (dsSuCoThang.length === 0) {
                excelData.push(["", "Không phát sinh chi phí sự cố trong tháng này."]);
            } else {
                dsSuCoThang.forEach((sc, i) => {
                    let cn = "---";
                    if (sc.phongTro && sc.phongTro.khuVuc) cn = sc.phongTro.khuVuc.tenKhuVuc;
                    else if (sc.chiNhanh) cn = sc.chiNhanh;
                    
                    let phong = sc.phongTro ? ("P." + sc.phongTro.soPhong) : (sc.viTri || "Khu vực chung");
                    let tongPhi = sc.chiPhiTong || 0;
                    let khachTra = sc.chiPhiNguoiThue || 0;
                    let chuTroTra = tongPhi - khachTra; 
                    excelData.push([
                        i + 1, cn, phong,
                        sc.ngayBao ? sc.ngayBao.split('-').reverse().join('/') : "",
                        sc.tenSuCo, tongPhi, khachTra, chuTroTra
                    ]);
                });
            }
            
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            ws['!cols'] = [ { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 } ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "ChiTietThang");
            let safeName = tenChiNhanh.replace(/,/g, '').replace(/\s+/g, '_');
            XLSX.writeFile(wb, `Bao_Cao_Thang_${thangHienThi.replace('/', '_')}_${safeName}.xlsx`);
        });
    }
}