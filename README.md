# 🏋️ Gym Management System

## 🚀 CÁCH CHẠY NHANH NHẤT

### Chỉ cần 1 bước:

```
Double-click file: START_ALL.bat
```

**Xong!** File này sẽ tự động:
- ✅ Dọn dẹp các port đang dùng
- ✅ Khởi động Android Emulator
- ✅ Chạy Backend Server (Port 5000)
- ✅ Chạy Web Admin (Port 5173)
- ✅ Chạy Metro Bundler
- ✅ Build và cài đặt Android App

---

## 📱 Truy cập

| Service | URL |
|---------|-----|
| 🌐 Web Admin | http://localhost:5173 |
| 🔧 Backend API | http://localhost:5000 |
| 📱 Mobile App | Mở trong Android Emulator |

---

## 🛑 Dừng tất cả

Đóng tất cả cửa sổ CMD và Emulator window

---

## 📖 Hướng dẫn chi tiết

Xem các file sau nếu cần:
- `QUICK_START.md` - Hướng dẫn nhanh
- `HUONG_DAN_CHAY.md` - Hướng dẫn đầy đủ
- `ANDROID_EMULATOR_GUIDE.md` - Hướng dẫn emulator

---

## ⚠️ Lỗi thường gặp

### Port đang được sử dụng
```
Error: listen EADDRINUSE
```
**Giải pháp:** `START_ALL.bat` tự động xử lý. Hoặc restart máy.

### Emulator không khởi động
```
Failed to launch emulator
```
**Giải pháp:** Cài Android Studio và tạo AVD mới.

### App không connect Backend
**Giải pháp:** Kiểm tra file `mobile/GymApp/src/constants/config.ts`:
```typescript
API_BASE_URL: 'http://10.0.2.2:5000/api'
```

---

## 💡 Lệnh thủ công (nếu cần)

### Backend:
```bash
npm run server
```

### Web:
```bash
npm run dev
```

### Mobile:
```bash
cd mobile/GymApp
npm start
npm run android
```

---

Made with ❤️ by Gym Management Team
