# 🏋️ Hướng dẫn chạy Gym Management System

## 📋 Yêu cầu hệ thống

### Backend & Web Client:
- Node.js >= 16.x
- MongoDB (chạy local hoặc MongoDB Atlas)
- npm hoặc yarn

### Mobile App (Android):
- Node.js >= 16.x
- JDK 17 (Java Development Kit)
- Android Studio
- Android SDK
- React Native CLI

---

## 🚀 Cách chạy dự án

### 1️⃣ **Backend Server (API Server)**

**Terminal 1:**
```powershell
# Đi đến thư mục gốc
cd C:\Users\ndao9\Downloads\demo-doan-coso-main

# Cài đặt dependencies (chỉ lần đầu)
npm install

# Chạy server
npm run server
```

**Kết quả mong đợi:**
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

**Server API:** `http://localhost:5000`

---

### 2️⃣ **Web Client (Admin Dashboard)**

**Terminal 2:**
```powershell
# Đi đến thư mục gốc (terminal mới)
cd C:\Users\ndao9\Downloads\demo-doan-coso-main

# Chạy Vite dev server
npm run dev
```

**Kết quả mong đợi:**
```
VITE v4.5.13  ready in 636 ms
➜  Local:   http://localhost:5173/
```

**Web Client:** `http://localhost:5173`

**Truy cập:**
- Mở trình duyệt: `http://localhost:5173`
- Đăng nhập với tài khoản admin

---

### 3️⃣ **Mobile App Android**

#### Bước 0: Khởi động Android Emulator (nếu dùng emulator)

**Cách 1: Dùng script (Khuyến nghị)**
```powershell
# Double-click file:
start-emulator.bat
```

**Cách 2: Thủ công**
```powershell
# List emulators có sẵn
cd $env:LOCALAPPDATA\Android\Sdk\emulator
.\emulator.exe -list-avds

# Khởi động emulator (thay tên emulator)
.\emulator.exe -avd Pixel_9
```

**Emulators có sẵn trên máy này:**
- Pixel_9
- Medium_Phone_API_36.0

**Đợi emulator boot xong (màn hình home hiện ra) trước khi chạy app!**

#### Bước 1: Khởi động Metro Bundler

**Terminal 3:**
```powershell
# Đi đến thư mục mobile app
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp

# Cài đặt dependencies (chỉ lần đầu)
npm install

# Khởi động Metro bundler
npm start
```

#### Bước 2: Chạy app trên Android

**Cách 1: Chạy trên Emulator**

**Terminal 4:**
```powershell
# Đảm bảo emulator đã chạy
# Mở Android Studio > AVD Manager > Start emulator

# Chạy app
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp
npm run android
```

**Cách 2: Chạy trên thiết bị thật**

1. Bật USB Debugging trên điện thoại Android
2. Kết nối điện thoại với máy tính qua USB
3. Chạy lệnh:
```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp
npm run android
```

---

## 🔧 Cấu hình quan trọng

### Backend (.env file)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gym-management
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Mobile App (src/constants/config.ts)
```typescript
export const CONFIG = {
  API_BASE_URL: 'http://10.0.2.2:5000/api', // Android Emulator
  // hoặc
  // API_BASE_URL: 'http://192.168.x.x:5000/api', // Thiết bị thật (IP máy tính)
};
```

**Lưu ý IP:**
- **Android Emulator:** `10.0.2.2` (localhost của máy host)
- **Thiết bị thật:** IP máy tính trong mạng LAN (vd: `192.168.1.100`)
- Kiểm tra IP máy tính: `ipconfig` (Windows)

---

## 📱 Lệnh tổng hợp

### Chạy tất cả trong 1 lần (4 terminals)

**Terminal 1 - Backend:**
```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main
npm run server
```

**Terminal 2 - Web Client:**
```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main
npm run dev
```

**Terminal 3 - Metro Bundler:**
```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp
npm start
```

**Terminal 4 - Android App:**
```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp
npm run android
```

---

## 🐛 Xử lý lỗi thường gặp

### 1. Backend không kết nối MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp:** Khởi động MongoDB service
```powershell
# Windows (nếu cài MongoDB local)
net start MongoDB
```

### 2. Mobile app không kết nối server
```
Network request failed
```
**Giải pháp:** 
- Kiểm tra IP trong `config.ts`
- Đảm bảo backend đang chạy
- Tắt firewall hoặc cho phép port 5000

### 3. Android build failed
```
Execution failed for task ':app:installDebug'
```
**Giải pháp:**
```powershell
cd android
./gradlew clean
cd ..
npm run android
```

### 4. Metro bundler cache issue
```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp
npx react-native start --reset-cache
```

---

## ✅ Checklist trước khi chạy

- [ ] MongoDB đã chạy
- [ ] Node.js đã cài đặt
- [ ] Đã chạy `npm install` ở thư mục gốc
- [ ] Đã chạy `npm install` ở thư mục mobile/GymApp
- [ ] File `.env` đã được cấu hình
- [ ] **Android emulator đã khởi động VÀ boot xong** (cho mobile app)
- [ ] IP trong config.ts đã đúng (10.0.2.2 cho emulator)

---

## 🌐 Các URL quan trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| Backend API | http://localhost:5000 | API Server |
| Web Admin | http://localhost:5173 | Admin Dashboard |
| API Docs | http://localhost:5000/api | API endpoints |

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console logs của từng terminal
2. Đảm bảo tất cả dependencies đã được cài đặt
3. Kiểm tra phiên bản Node.js và các tools

**Lệnh kiểm tra phiên bản:**
```powershell
node --version
npm --version
java -version
```
