# 🏋️ Gym Management System - Quick Start

## 🚀 Cách chạy nhanh (Windows)

### Cách 1: Dùng script tự động (Khuyến nghị)

**Double-click các file .bat theo thứ tự:**

1. **`start-emulator.bat`** - Khởi động Android Emulator (đợi emulator boot xong)
2. **`start-backend.bat`** - Chạy Backend Server (Port 5000)
3. **`start-web.bat`** - Chạy Web Admin (Port 5173)
4. **`start-mobile-metro.bat`** - Chạy Metro Bundler cho mobile
5. **`start-android.bat`** - Chạy Android App (sau khi Metro đã chạy)

### Cách 2: Dùng PowerShell (Chạy tất cả cùng lúc)

```powershell
# Chạy lệnh này trong PowerShell
.\start-all.ps1
```

### Cách 3: Chạy thủ công từng terminal

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Web:**
```powershell
npm run dev
```

**Terminal 3 - Mobile Metro:**
```powershell
cd mobile\GymApp
npm start
```

**Terminal 4 - Android:**
```powershell
cd mobile\GymApp
npm run android
```

---

## 📱 Trạng thái hiện tại

✅ **Backend Server** đang chạy trên: http://localhost:5000
✅ **Web Client** đang chạy trên: http://localhost:5173

---

## 🔗 Các URL quan trọng

| Service | URL | Trạng thái |
|---------|-----|-----------|
| 🔧 Backend API | http://localhost:5000 | ✅ Running |
| 🌐 Web Admin | http://localhost:5173 | ✅ Running |
| 📱 Metro Bundler | http://localhost:8081 | Chưa chạy |

---

## 📖 Hướng dẫn chi tiết

Xem file [`HUONG_DAN_CHAY.md`](./HUONG_DAN_CHAY.md) để có hướng dẫn chi tiết và xử lý lỗi.

---

## ⚙️ Cấu hình cần thiết

### Mobile App - Cấu hình IP

File: `mobile/GymApp/src/constants/config.ts`

```typescript
export const CONFIG = {
  // Cho Android Emulator:
  API_BASE_URL: 'http://10.0.2.2:5000/api',
  
  // Cho thiết bị thật (thay bằng IP máy tính):
  // API_BASE_URL: 'http://192.168.x.x:5000/api',
};
```

**Tìm IP máy tính:**
```powershell
ipconfig
# Tìm "IPv4 Address" trong mạng WiFi/LAN
```

---

## 🎯 Next Steps

1. ✅ Backend và Web đã chạy
2. 📱 Chạy Metro Bundler: Double-click `start-mobile-metro.bat`
3. 📱 Chạy Android App: Double-click `start-android.bat`
4. 🎉 Sử dụng app!

---

## 💡 Tips

- **Hot Reload:** Code thay đổi sẽ tự động reload
- **Backend logs:** Xem terminal Backend để debug
- **Mobile reload:** Nhấn R+R trong emulator để reload
- **Clear cache:** Nếu app lỗi, xóa cache và rebuild

---

## 🐛 Gặp lỗi?

Xem file [`HUONG_DAN_CHAY.md`](./HUONG_DAN_CHAY.md) phần "Xử lý lỗi thường gặp"

Hoặc check console logs ở từng terminal!
