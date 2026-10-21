# PGNTT Tool

Công cụ tạo phiếu giao nhận và thanh toán (PGNTT) cho NPP. Gồm Bảng giá, CTKM, Gói đánh, TOT, DSKH, tạo phiếu và xuất PDF (một liên hoặc hai liên).

Repo này chỉ chứa mã nguồn. **Không chứa dữ liệu khách hàng hay bảng giá.** Dữ liệu được nạp từ file Excel và đồng bộ qua Google Sheet.

## Chạy bản web

Bật GitHub Pages: Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`. Sau đó mở đường dẫn Pages của repo.

## Dựng lại file

```
python3 build.py      # tạo index.html
```

`seed_empty.json` là dữ liệu rỗng. Không đưa file dữ liệu thật vào repo.

## Cài Google Sheet (kho chung)

1. Tạo một Google Sheet mới. Chỉ mình bạn có quyền xem. Không chia sẻ cho người khác.
2. Vào **Tiện ích mở rộng → Apps Script**, xoá nội dung có sẵn, dán toàn bộ `apps-script/Code.gs`, lưu.
3. Vào **Cài đặt dự án → Thuộc tính tập lệnh → Thêm thuộc tính**: tên `KEY`, giá trị là một khoá tự chọn (dài, khó đoán).
4. Bấm **Triển khai → Triển khai mới → Loại: Ứng dụng web**. Thực thi với tư cách: *Tôi*. Ai có quyền truy cập: *Bất kỳ ai*. Bấm Triển khai và sao chép URL kết thúc bằng `/exec`.
5. Mở PGNTT trên trình duyệt → **Dữ liệu nguồn** → dán URL và khoá ở mục *Kho chung*, bấm **Lưu và kiểm tra kết nối**.
6. Chọn file Excel (PGNTT, DSKH, ngân sách) để nạp dữ liệu. Dữ liệu sẽ tự đẩy lên Sheet.

Mỗi máy làm bước 5 một lần. Khoá được lưu trên trình duyệt của máy đó, không nằm trong mã nguồn.

Sheet có tab `store` do ứng dụng tự tạo. Không sửa tay tab này.

## Kiểm tra thời điểm cập nhật

Trong **Dữ liệu nguồn**, mục *Kho chung* liệt kê thời điểm cập nhật gần nhất của từng khối: dữ liệu nguồn, bảng giá riêng, CTKM, gói đánh, DSKH bổ sung, TOT.

## Ghi chú

- Khoá truy cập là hàng rào duy nhất bảo vệ Sheet khi URL web app bị lộ. Nếu nghi ngờ lộ, đổi thuộc tính `KEY` trong Apps Script và nhập lại khoá mới trên các máy.
- Sau khi sửa `Code.gs`, phải triển khai lại (Triển khai → Quản lý triển khai → Sửa → Phiên bản mới) thì URL mới có hiệu lực.
