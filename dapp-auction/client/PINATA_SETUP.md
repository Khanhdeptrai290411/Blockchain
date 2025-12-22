# Pinata Setup Guide

Để sử dụng tính năng upload ảnh lên IPFS qua Pinata, bạn cần cấu hình các biến môi trường sau:

## Cách 1: Sử dụng JWT Token (Khuyến nghị)

1. Đăng nhập vào [Pinata](https://app.pinata.cloud/)
2. Vào **Settings** > **API Keys**
3. Click **New Key** → Chọn **Admin** hoặc **Custom Key**
4. **QUAN TRỌNG**: Khi tạo Custom Key, đảm bảo chọn các **permissions/scopes** sau:
   - ✅ `pinFileToIPFS` (để upload file ảnh)
   - ✅ `pinJSONToIPFS` (để upload metadata JSON)
5. Tạo key và copy **JWT Token**
6. Thêm vào file `.env` trong thư mục `client`:

```env
REACT_APP_PINATA_JWT=your_jwt_token_here
```

## Cách 2: Sử dụng API Key và Secret Key

1. Đăng nhập vào [Pinata](https://app.pinata.cloud/)
2. Vào **Settings** > **API Keys**
3. Click **New Key** → Chọn **Admin** hoặc **Custom Key**
4. **QUAN TRỌNG**: Khi tạo Custom Key, đảm bảo chọn các **permissions/scopes** sau:
   - ✅ `pinFileToIPFS` (để upload file ảnh)
   - ✅ `pinJSONToIPFS` (để upload metadata JSON)
5. Copy **API Key** và **Secret Key**
6. Thêm vào file `.env` trong thư mục `client`:

```env
REACT_APP_PINATA_API_KEY=your_api_key_here
REACT_APP_PINATA_SECRET_KEY=your_secret_key_here
```

## ⚠️ Lỗi "Không có các phạm vi cần thiết"

Nếu bạn gặp lỗi **"Khóa này không có các phạm vi cần thiết được liên kết với nó"**, điều này có nghĩa là:

1. **API Key/JWT của bạn thiếu permissions** - Cần tạo lại với đúng scopes
2. **Giải pháp**: 
   - Xóa API key/JWT cũ trong Pinata dashboard
   - Tạo lại với **Admin** permissions HOẶC **Custom Key** với đầy đủ scopes:
     - `pinFileToIPFS`
     - `pinJSONToIPFS`
   - Copy key mới vào file `.env`
   - **Restart React server**

## Lưu ý

- File `.env` nên được thêm vào `.gitignore` để không commit credentials lên Git
- Sau khi thêm biến môi trường, **BẮT BUỘC** phải restart React development server
- Nếu không cấu hình, ứng dụng sẽ hiển thị cảnh báo và không thể upload ảnh
- **Tên biến môi trường phải bắt đầu bằng `REACT_APP_`** để React có thể đọc được

