# Test Cart & Payment Flow

## Luồng thanh toán đã cập nhật

### 1. Thanh toán từ giỏ hàng
**Bước 1: Đăng ký lớp học/dịch vụ**
- Vào màn hình Classes/Services
- Đăng ký lớp học hoặc dịch vụ
- Item sẽ xuất hiện trong giỏ hàng với `paymentStatus = false`

**Bước 2: Thanh toán**
- Vào màn hình Cart (Giỏ hàng)
- Chọn các item cần thanh toán
- Nhấn "Thanh toán"
- Chọn phương thức: "Chuyển khoản" hoặc "Tiền mặt"

**Kết quả:**
- ✅ Payment được tạo với `status = "pending"`
- ✅ Item biến mất khỏi giỏ hàng (vì đang có payment pending)
- ✅ Hiển thị thông báo: "Đơn hàng đã được tạo với trạng thái 'Chờ xác nhận'. Kiểm tra trạng thái tại màn hình Lịch sử."

### 2. Kiểm tra trạng thái thanh toán
**Vào màn hình History (Lịch sử)**
- Tab "Thanh toán"
- Xem payment vừa tạo
- Status hiển thị: **"Chờ xử lý"** (màu cam 🟠)

**Chi tiết payment:**
- 💳 Loại thanh toán
- Phương thức (Chuyển khoản/Tiền mặt)
- Số tiền
- Ngày tạo
- Trạng thái: Chờ xử lý

### 3. Admin xác nhận thanh toán
**Từ admin dashboard:**
- Vào trang "Quản lý thanh toán"
- Tìm payment pending
- Nhấn "Xác nhận thanh toán"

**Kết quả:**
- ✅ Payment `status` → "completed"
- ✅ `paymentStatus` của enrollment → `true`
- ✅ User nhận notification: "Thanh toán thành công ✓"
- ✅ Item KHÔNG hiện lại trong giỏ hàng (đã thanh toán)
- ✅ HistoryScreen hiển thị: **"Hoàn thành"** (màu xanh 🟢)

### 4. Admin từ chối thanh toán
**Từ admin dashboard:**
- Vào trang "Quản lý thanh toán"
- Tìm payment pending
- Nhấn "Từ chối thanh toán"
- Nhập lý do từ chối

**Kết quả:**
- ✅ Payment `status` → "cancelled"
- ✅ User nhận notification: "Thanh toán bị từ chối ❌" + lý do
- ✅ Item HIỆN LẠI trong giỏ hàng (có thể thanh toán lại)
- ✅ HistoryScreen hiển thị: **"Đã hủy"** (màu đỏ 🔴)

### 5. Thanh toán lại sau khi bị từ chối
**Sau khi nhận notification từ chối:**
- Vào lại màn hình Cart
- Item đã xuất hiện trở lại
- Có thể chọn và thanh toán lại
- Quy trình lặp lại từ bước 2

---

## Test Cases

### Case 1: Thanh toán thành công
1. ✅ Đăng ký lớp học → Item trong cart
2. ✅ Thanh toán → Item biến mất khỏi cart
3. ✅ History hiển thị "Chờ xử lý"
4. ✅ Admin approve → History hiển thị "Hoàn thành"
5. ✅ Item KHÔNG quay lại cart

### Case 2: Thanh toán bị từ chối
1. ✅ Đăng ký lớp học → Item trong cart
2. ✅ Thanh toán → Item biến mất khỏi cart
3. ✅ History hiển thị "Chờ xử lý"
4. ✅ Admin reject → History hiển thị "Đã hủy"
5. ✅ Item QUAY LẠI cart
6. ✅ Có thể thanh toán lại

### Case 3: Nhiều items cùng lúc
1. ✅ Đăng ký 3 lớp học
2. ✅ Cart hiển thị 3 items
3. ✅ Chọn 2 items thanh toán
4. ✅ 2 items biến mất, 1 item còn lại
5. ✅ Admin approve → 2 items KHÔNG quay lại
6. ✅ 1 item chưa thanh toán vẫn trong cart

### Case 4: Payment pending đang chờ
1. ✅ Đăng ký lớp học
2. ✅ Thanh toán → Payment pending
3. ✅ Không thể tạo payment mới cho cùng item
4. ✅ Phải chờ admin xử lý hoặc hủy payment

---

## Lưu ý kỹ thuật

### CartScreen Logic
```typescript
const canPayItem = (itemId: string, paymentStatus: boolean) => {
  if (paymentStatus) return false; // Đã thanh toán → ẩn
  if (activePaymentIds.has(itemId)) return false; // Đang pending → ẩn
  return true; // Chưa thanh toán hoặc đã cancelled → hiện
};
```

### Payment Status Flow
```
[Chưa thanh toán]
    ↓ User thanh toán
[Chờ xử lý - pending]
    ↓
    ├─→ Admin approve → [Hoàn thành - completed] → Không thể thanh toán lại
    └─→ Admin reject → [Đã hủy - cancelled] → Có thể thanh toán lại
```

### Backend Notifications
- ✅ Approve: "Thanh toán thành công ✓"
- ✅ Reject: "Thanh toán bị từ chối ❌" + lý do

---

## Kiểm tra UI

### CartScreen
- [ ] Items hiển thị đúng (chưa thanh toán + không pending)
- [ ] Items biến mất sau khi thanh toán
- [ ] Items quay lại sau khi bị từ chối
- [ ] Thông báo success đầy đủ thông tin

### HistoryScreen
- [ ] Tab "Thanh toán" hiển thị tất cả payments
- [ ] Status màu sắc đúng (Pending=🟠, Completed=🟢, Cancelled=🔴)
- [ ] Hiển thị đầy đủ: số tiền, phương thức, ngày

### Notifications
- [ ] Nhận thông báo khi approve
- [ ] Nhận thông báo khi reject (có lý do)
- [ ] Nhấn vào notification điều hướng đúng

---

**Ngày cập nhật:** 30/11/2025
**Người test:** _____________
**Kết quả:** ☐ Pass  ☐ Fail
**Ghi chú:** _____________________
