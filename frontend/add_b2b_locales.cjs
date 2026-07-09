const fs = require('fs');
const path = require('path');

const locales = ['vi', 'en', 'ja', 'ko', 'zh'];
const basePath = path.join(__dirname, 'src', 'locales');

const translations = {
  vi: {
    title: "Bảng điều khiển B2B",
    admin_title: "Quản lý B2B",
    status: {
      PENDING_QUOTE: "Chờ báo giá",
      NEGOTIATING: "Đang đàm phán",
      CONFIRMED: "Đã chốt",
      PRODUCING: "Đang sản xuất",
      DELIVERING: "Giao hàng",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy"
    },
    download_quote: "Tải Báo giá / Hợp đồng",
    confirm_order: "Xác nhận chốt đơn",
    chat_placeholder: "Nhập tin nhắn của bạn...",
    send: "Gửi",
    upload_quote: "Tải PDF lên",
    update_status: "Cập nhật",
    no_orders: "Chưa có hợp đồng nào.",
    confirm_msg: "Bạn có chắc chắn muốn chốt đơn hàng này không?",
    pdf_required: "Vui lòng đính kèm file PDF.",
    select_status: "Chọn trạng thái"
  },
  en: {
    title: "B2B Dashboard",
    admin_title: "B2B Management",
    status: {
      PENDING_QUOTE: "Pending Quote",
      NEGOTIATING: "Negotiating",
      CONFIRMED: "Confirmed",
      PRODUCING: "Producing",
      DELIVERING: "Delivering",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled"
    },
    download_quote: "Download Quote / Contract",
    confirm_order: "Confirm Order",
    chat_placeholder: "Type your message...",
    send: "Send",
    upload_quote: "Upload PDF",
    update_status: "Update Status",
    no_orders: "No orders found.",
    confirm_msg: "Are you sure you want to confirm this order?",
    pdf_required: "Please attach a PDF file.",
    select_status: "Select status"
  }
};

// Fallback to English for ja, ko, zh for now
translations.ja = translations.en;
translations.ko = translations.en;
translations.zh = translations.en;

locales.forEach(lang => {
  const dirPath = path.join(basePath, lang);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const filePath = path.join(dirPath, 'b2b.json');
  fs.writeFileSync(filePath, JSON.stringify(translations[lang], null, 2));
  console.log(`Created b2b.json for ${lang}`);
});
