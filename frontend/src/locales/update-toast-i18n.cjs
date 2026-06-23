const fs = require('fs');
const path = require('path');

const locales = ['en', 'vi', 'ko', 'ja', 'zh'];
const adminData = {
  vi: {
    fetch_error: "Lỗi tải danh sách đơn hàng",
    update_success: "Cập nhật trạng thái thành công",
    update_fail: "Cập nhật thất bại",
    system_error: "Lỗi hệ thống",
    confirm_lock: "Bạn có chắc chắn muốn khóa người dùng này? Hành động này sẽ đăng xuất họ khỏi tất cả thiết bị.",
    lock_success: "Đã khóa tài khoản thành công",
    lock_fail: "Lỗi khi khóa tài khoản",
    error_vietqr_unpaid: "Không thể lưu: Đơn VietQR phải Đã thanh toán thì mới được xác nhận giao hàng!",
    error_completed_unpaid: "Không thể lưu: Đơn hàng hoàn thành bắt buộc phải Đã thanh toán!",
    high_risk_filter: "Đơn rủi ro cao"
  },
  en: {
    fetch_error: "Error loading order list",
    update_success: "Status updated successfully",
    update_fail: "Update failed",
    system_error: "System error",
    confirm_lock: "Are you sure you want to lock this user? This action will log them out from all devices.",
    lock_success: "Account locked successfully",
    lock_fail: "Error locking account",
    error_vietqr_unpaid: "Cannot save: VietQR orders must be Paid to be confirmed for delivery!",
    error_completed_unpaid: "Cannot save: Completed orders must be Paid!",
    high_risk_filter: "High Risk Orders"
  },
  ko: {
    fetch_error: "주문 목록을 불러오는 중 오류 발생",
    update_success: "상태가 성공적으로 업데이트되었습니다",
    update_fail: "업데이트 실패",
    system_error: "시스템 오류",
    confirm_lock: "이 사용자를 잠그시겠습니까? 이 작업은 모든 기기에서 로그아웃됩니다.",
    lock_success: "계정이 성공적으로 잠겼습니다",
    lock_fail: "계정 잠금 오류",
    error_vietqr_unpaid: "저장 불가: VietQR 주문은 배송 확정을 위해 결제 완료 상태여야 합니다!",
    error_completed_unpaid: "저장 불가: 완료된 주문은 결제 완료 상태여야 합니다!",
    high_risk_filter: "고위험 주문"
  },
  ja: {
    fetch_error: "注文リストの読み込みエラー",
    update_success: "ステータスが正常に更新されました",
    update_fail: "更新に失敗しました",
    system_error: "システムエラー",
    confirm_lock: "このユーザーをロックしてもよろしいですか？この操作により、すべてのデバイスからログアウトされます。",
    lock_success: "アカウントが正常にロックされました",
    lock_fail: "アカウントのロックエラー",
    error_vietqr_unpaid: "保存できません: 配送を確認するにはVietQR注文が支払済みである必要があります！",
    error_completed_unpaid: "保存できません: 完了した注文は支払済みである必要があります！",
    high_risk_filter: "高リスク注文"
  },
  zh: {
    fetch_error: "加载订单列表时出错",
    update_success: "状态更新成功",
    update_fail: "更新失败",
    system_error: "系统错误",
    confirm_lock: "您确定要锁定此用户吗？此操作将使他们退出所有设备。",
    lock_success: "账户已成功锁定",
    lock_fail: "锁定账户时出错",
    error_vietqr_unpaid: "无法保存：VietQR 订单必须已付款才能确认发货！",
    error_completed_unpaid: "无法保存：已完成的订单必须已付款！",
    high_risk_filter: "高风险订单"
  }
};

const headerData = {
  vi: { manage_orders: "Quản lý Đơn hàng" },
  en: { manage_orders: "Manage Orders" },
  ko: { manage_orders: "주문 관리" },
  ja: { manage_orders: "注文管理" },
  zh: { manage_orders: "订单管理" }
};

locales.forEach(locale => {
  const adminPath = path.join(__dirname, locale, 'admin.json');
  if (fs.existsSync(adminPath)) {
    const fileData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
    if (!fileData.orders) fileData.orders = {};
    Object.assign(fileData.orders, adminData[locale]);
    fs.writeFileSync(adminPath, JSON.stringify(fileData, null, 2), 'utf8');
  }

  const headerPath = path.join(__dirname, locale, 'header.json');
  if (fs.existsSync(headerPath)) {
    const headerFileData = JSON.parse(fs.readFileSync(headerPath, 'utf8'));
    if (!headerFileData.user_menu) headerFileData.user_menu = {};
    Object.assign(headerFileData.user_menu, headerData[locale]);
    fs.writeFileSync(headerPath, JSON.stringify(headerFileData, null, 2), 'utf8');
  }
  console.log(`Updated ${locale}`);
});
