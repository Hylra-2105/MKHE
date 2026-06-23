const fs = require('fs');
const path = require('path');

const locales = ['en', 'vi', 'ko', 'ja', 'zh'];
const data = {
  vi: {
    orders: {
      title: "Quản lý Đơn hàng",
      subtitle: "Theo dõi, xử lý và phân tích đơn đặt hàng",
      table_id: "Mã Đơn",
      table_date: "Ngày Đặt",
      table_customer: "Khách Hàng",
      table_total: "Tổng Tiền",
      table_status: "Trạng Thái",
      table_action: "Hành Động",
      status_pending: "Chờ Xử Lý",
      status_confirmed: "Đã Xác Nhận",
      status_delivering: "Đang Giao",
      status_completed: "Hoàn Thành",
      status_cancelled: "Đã Hủy",
      status_all: "Tất cả trạng thái",
      no_orders: "Không tìm thấy đơn hàng nào.",
      high_risk: "RỦI RO CAO",
      view_detail: "Xem chi tiết",
      print_invoice: "In hóa đơn",
      lock_account: "Khóa tài khoản",
      search_placeholder: "Mã đơn, Tên KH, SĐT...",
      date_from: "Từ ngày",
      date_to: "Đến ngày",
      detail_title: "Chi tiết Đơn hàng",
      save: "Lưu thay đổi",
      close: "Đóng",
      payment_method: "Phương thức thanh toán",
      payment_status: "Trạng thái TT",
      paid: "Đã TT",
      unpaid: "Chưa TT"
    }
  },
  en: {
    orders: {
      title: "Order Management",
      subtitle: "Track, process and analyze orders",
      table_id: "Order ID",
      table_date: "Date",
      table_customer: "Customer",
      table_total: "Total",
      table_status: "Status",
      table_action: "Actions",
      status_pending: "Pending",
      status_confirmed: "Confirmed",
      status_delivering: "Delivering",
      status_completed: "Completed",
      status_cancelled: "Cancelled",
      status_all: "All statuses",
      no_orders: "No orders found.",
      high_risk: "HIGH RISK",
      view_detail: "View details",
      print_invoice: "Print invoice",
      lock_account: "Lock account",
      search_placeholder: "Order ID, Name, Phone...",
      date_from: "From",
      date_to: "To",
      detail_title: "Order Details",
      save: "Save changes",
      close: "Close",
      payment_method: "Payment Method",
      payment_status: "Payment Status",
      paid: "Paid",
      unpaid: "Unpaid"
    }
  },
  ko: {
    orders: {
      title: "주문 관리",
      subtitle: "주문 추적, 처리 및 분석",
      table_id: "주문 번호",
      table_date: "주문 날짜",
      table_customer: "고객",
      table_total: "총액",
      table_status: "상태",
      table_action: "작업",
      status_pending: "대기 중",
      status_confirmed: "확인됨",
      status_delivering: "배송 중",
      status_completed: "완료됨",
      status_cancelled: "취소됨",
      status_all: "모든 상태",
      no_orders: "주문을 찾을 수 없습니다.",
      high_risk: "고위험",
      view_detail: "세부 정보 보기",
      print_invoice: "청구서 인쇄",
      lock_account: "계정 잠금",
      search_placeholder: "주문 번호, 이름, 전화...",
      date_from: "부터",
      date_to: "까지",
      detail_title: "주문 상세",
      save: "변경 사항 저장",
      close: "닫기",
      payment_method: "결제 수단",
      payment_status: "결제 상태",
      paid: "결제 완료",
      unpaid: "미결제"
    }
  },
  ja: {
    orders: {
      title: "注文管理",
      subtitle: "注文の追跡、処理、分析",
      table_id: "注文ID",
      table_date: "注文日",
      table_customer: "顧客",
      table_total: "合計",
      table_status: "ステータス",
      table_action: "アクション",
      status_pending: "保留中",
      status_confirmed: "確認済み",
      status_delivering: "配送中",
      status_completed: "完了",
      status_cancelled: "キャンセル済み",
      status_all: "すべてのステータス",
      no_orders: "注文が見つかりません。",
      high_risk: "高リスク",
      view_detail: "詳細を見る",
      print_invoice: "インボイス印刷",
      lock_account: "アカウントをロック",
      search_placeholder: "注文ID、名前、電話...",
      date_from: "から",
      date_to: "まで",
      detail_title: "注文詳細",
      save: "変更を保存",
      close: "閉じる",
      payment_method: "支払方法",
      payment_status: "支払状況",
      paid: "支払済み",
      unpaid: "未払い"
    }
  },
  zh: {
    orders: {
      title: "订单管理",
      subtitle: "跟踪、处理和分析订单",
      table_id: "订单号",
      table_date: "下单日期",
      table_customer: "客户",
      table_total: "总计",
      table_status: "状态",
      table_action: "操作",
      status_pending: "待处理",
      status_confirmed: "已确认",
      status_delivering: "派送中",
      status_completed: "已完成",
      status_cancelled: "已取消",
      status_all: "所有状态",
      no_orders: "未找到订单。",
      high_risk: "高风险",
      view_detail: "查看详情",
      print_invoice: "打印发票",
      lock_account: "锁定账户",
      search_placeholder: "订单号、姓名、电话...",
      date_from: "从",
      date_to: "至",
      detail_title: "订单详情",
      save: "保存更改",
      close: "关闭",
      payment_method: "付款方式",
      payment_status: "付款状态",
      paid: "已付款",
      unpaid: "未付款"
    }
  }
};

locales.forEach(locale => {
  const filePath = path.join(__dirname, locale, 'admin.json');
  if (fs.existsSync(filePath)) {
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    fileData.orders = { ...(fileData.orders || {}), ...data[locale].orders };
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
    console.log(`Updated ${locale}/admin.json`);
  }
});
