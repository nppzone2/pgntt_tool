# PGNTT Tool

Công cụ tạo phiếu giao nhận và thanh toán (PGNTT) cho NPP. Gồm Bảng giá, CTKM, Gói đánh, TOT, DSKH, tạo phiếu và xuất PDF.

Repo này chỉ chứa mã nguồn. **Không chứa dữ liệu khách hàng hay bảng giá.** Dữ liệu nằm trong Google Sheet và chỉ hiển thị cho Gmail được cấp quyền.

## Cấu hình (`config.json`)

- `client_id`: Client ID OAuth (web) đã tạo trong Google Cloud. Không phải bí mật.
- `gs_url`: URL web app Apps Script (kết thúc bằng `/exec`). Điền sau khi triển khai ở bước dưới.

Sau khi sửa `config.json`, dựng lại và đẩy lên:

```
python3 build.py      # tạo index.html
```

## Cài Google Sheet (làm một lần, bởi chủ dữ liệu)

1. Tạo Google Sheet mới. Không chia sẻ Sheet cho người khác.
2. Tạo thêm một tab tên **`allow`**. Dòng 1 là tiêu đề `email`. Từ dòng 2 trở đi, mỗi dòng một Gmail được phép xem dữ liệu.
3. Vào **Tiện ích mở rộng → Apps Script**, xoá nội dung có sẵn, dán toàn bộ `apps-script/Code.gs`, lưu.
4. Vào **Cài đặt dự án → Thuộc tính tập lệnh → Thêm thuộc tính**: tên `CLIENT_ID`, giá trị là Client ID OAuth.
5. Bấm **Triển khai → Triển khai mới → Loại: Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai**
   
   Bấm Triển khai, sao chép URL `/exec`, dán vào `gs_url` trong `config.json`, rồi chạy `python3 build.py` và đẩy lên GitHub.
6. Trên Google Cloud, nếu màn hình đồng ý OAuth đang ở chế độ *Testing*, vào **Audience → Test users** và thêm các Gmail trong tab `allow`.

Lý do chọn "Bất kỳ ai": trình duyệt gọi web app không kèm đăng nhập Google. Việc kiểm soát quyền nằm ở đoạn mã trong `Code.gs`: mỗi yêu cầu phải có token Google hợp lệ và email phải có trong tab `allow`.

## Dùng trên máy mới

Mở link web, bấm **Đăng nhập Google**, chọn Gmail đã có trong tab `allow`. Dữ liệu tự tải về. Lần sau mở link là vào luôn cho đến khi token hết hạn (khoảng một giờ) thì đăng nhập lại.

Email không có trong `allow` sẽ thấy thông báo chưa được cấp quyền.

Muốn cấp quyền cho người mới, chỉ cần thêm email vào tab `allow`. Không cần đổi code hay gửi lại link.

## Kiểm tra thời điểm cập nhật

Trong **Dữ liệu nguồn**, mục *Kho chung* liệt kê thời điểm cập nhật gần nhất của dữ liệu nguồn, bảng giá riêng, CTKM, gói đánh, DSKH bổ sung và TOT.

## Ghi chú

- Sau khi sửa `Code.gs`, phải triển khai lại (Triển khai → Quản lý triển khai → Sửa → Phiên bản mới).
- Sheet có tab `store` do ứng dụng tự tạo. Không sửa tay tab này.
