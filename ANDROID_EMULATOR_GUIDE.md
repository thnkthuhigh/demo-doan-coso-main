# 📱 Hướng dẫn Android Emulator

## ❌ Lỗi: "No emulators found"

Nếu gặp lỗi này khi chạy `npm run android`:
```
Failed to launch emulator. Reason: No emulators found as an output of `emulator -list-avds`.
```

## ✅ Giải pháp

### Bước 1: Kiểm tra emulators có sẵn

```powershell
cd $env:LOCALAPPDATA\Android\Sdk\emulator
.\emulator.exe -list-avds
```

**Kết quả trên máy này:**
```
Medium_Phone_API_36.0
Pixel_9
```

### Bước 2: Khởi động emulator TRƯỚC KHI chạy app

**Cách 1: Dùng script (Đơn giản nhất)**
```
Double-click: start-emulator.bat
```

**Cách 2: Dùng PowerShell**
```powershell
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd","Pixel_9"
```

**Cách 3: Dùng Android Studio**
1. Mở Android Studio
2. Tools → AVD Manager
3. Click ▶️ (Play) bên cạnh emulator muốn chạy

### Bước 3: Đợi emulator boot xong

⚠️ **QUAN TRỌNG:** Đợi emulator hiển thị màn hình home đầy đủ trước khi chạy app!

Dấu hiệu emulator đã sẵn sàng:
- ✅ Màn hình home Android hiển thị
- ✅ Không còn loading spinner
- ✅ Có thể click vào icons

### Bước 4: Chạy app

```powershell
cd C:\Users\ndao9\Downloads\demo-doan-coso-main\mobile\GymApp
npm run android
```

---

## 🔧 Thứ tự chạy đúng

1. **Start Emulator** → Đợi boot xong
2. **Start Metro Bundler** → `npm start`
3. **Run Android** → `npm run android`

---

## 💡 Tips

### Kiểm tra emulator có chạy không:
```powershell
adb devices
```

Kết quả mong đợi:
```
List of devices attached
emulator-5554   device
```

### Nếu emulator bị treo:
```powershell
# Kill tất cả emulator processes
taskkill /F /IM qemu-system-x86_64.exe
taskkill /F /IM emulator.exe

# Khởi động lại
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd","Pixel_9"
```

### Xóa data emulator (factory reset):
```powershell
cd $env:LOCALAPPDATA\Android\Sdk\emulator
.\emulator.exe -avd Pixel_9 -wipe-data
```

---

## 🎯 Quy trình hoàn chỉnh

### Lần đầu setup:
1. Cài Android Studio
2. Tạo AVD (Virtual Device) trong AVD Manager
3. Install Android SDK và system images

### Mỗi lần chạy app:
```powershell
# 1. Start emulator (chờ 30-60 giây boot)
.\start-emulator.bat

# 2. Start Metro (trong terminal mới)
cd mobile\GymApp
npm start

# 3. Run app (trong terminal mới, sau khi emulator đã boot)
npm run android
```

---

## 📍 Các files hỗ trợ

- `start-emulator.bat` - Script khởi động emulator
- `start-mobile-metro.bat` - Script chạy Metro bundler
- `start-android.bat` - Script build và run app

**Sử dụng:** Double-click các file theo thứ tự!

---

## ⚠️ Lưu ý quan trọng

1. **Luôn khởi động emulator TRƯỚC** khi chạy `npm run android`
2. **Đợi emulator boot xong** (30-60 giây)
3. **Metro bundler phải chạy** trước khi build app
4. Nếu app không hiển thị, check:
   - Emulator đã boot xong chưa
   - Metro bundler có chạy không
   - IP trong config.ts đúng chưa (10.0.2.2 cho emulator)

---

## 🚀 Quick Commands

```powershell
# List emulators
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -list-avds

# Start emulator
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd","Pixel_9"

# Check devices
adb devices

# Run app
cd mobile\GymApp
npm run android
```
