const fs = require('fs');
const path = require('path');

const locales = ['vi', 'en', 'ja', 'ko', 'zh'];
const basePath = path.join(__dirname, 'src', 'locales');

const viTranslations = {
  "title": "Bảng điều khiển B2B",
  "request_title": "Tạo Yêu Cầu B2B Mới",
  "subtitle": "Điền thông tin yêu cầu của bạn, chúng tôi sẽ liên hệ sớm nhất",
  "admin_title": "Quản lý B2B",
  "status": {
    "PENDING_QUOTE": "Chờ báo giá",
    "NEGOTIATING": "Đang đàm phán",
    "CONFIRMED": "Đã chốt",
    "PRODUCING": "Đang sản xuất",
    "DELIVERING": "Giao hàng",
    "COMPLETED": "Hoàn thành",
    "CANCELLED": "Đã hủy"
  },
  "download_quote": "Tải Báo giá / Hợp đồng",
  "confirm_order": "Xác nhận chốt đơn",
  "chat_placeholder": "Nhập tin nhắn của bạn...",
  "send": "Gửi",
  "upload_quote": "Tải PDF lên",
  "update_status": "Cập nhật",
  "no_orders": "Chưa có hợp đồng nào.",
  "confirm_msg": "Bạn có chắc chắn muốn chốt đơn hàng này không?",
  "pdf_required": "Vui lòng đính kèm file PDF.",
  "select_status": "Chọn trạng thái",
  "consultingPackage": "Gói Tư Vấn & Thiết Kế Sản Phẩm Theo Yêu Cầu",
  "companyInfo": {
    "title": "Thông tin Doanh nghiệp",
    "desc1": "Chúng tôi sẽ sử dụng thông tin này để làm Hợp đồng & Xuất Hóa Đơn",
    "company": "Công ty",
    "taxCode": "MST",
    "notUpdated": "Chưa cập nhật",
    "note": "Bạn có thể cập nhật lại trong Trang cá nhân"
  },
  "fields": {
    "product": "Gói dịch vụ / Sản phẩm",
    "productPlaceholder": "Chọn dịch vụ/sản phẩm bạn quan tâm",
    "quantity": "Số lượng dự kiến",
    "budget": "Ngân sách dự kiến (VNĐ)",
    "budgetPlaceholder": "Ví dụ: 50.000.000",
    "deliveryDate": "Ngày cần hàng dự kiến",
    "deliveryDatePlaceholder": "Chọn ngày...",
    "packaging": "Quy cách đóng gói",
    "packagingPlaceholder": "Chọn quy cách đóng gói",
    "packagingOptions": {
      "STANDARD_BOX": "Hộp tiêu chuẩn MKHE",
      "NO_PACKAGING": "Không cần hộp"
    },
    "note": "Ghi chú thêm",
    "notePlaceholder": "Yêu cầu đặc biệt về chất liệu, mùi hương, kích thước...",
    "designFiles": "File đính kèm (Thiết kế / Yêu cầu chi tiết)",
    "dragDrop": "Kéo thả file vào đây hoặc bấm để chọn",
    "fileHint": "Hỗ trợ định dạng .pdf, .ai, .png, .jpg (Tối đa 5 file)",
    "fileNote": "Tối đa 5 file"
  },
  "validation": {
    "productRequired": "Vui lòng chọn sản phẩm/dịch vụ",
    "quantityRequired": "Vui lòng nhập số lượng",
    "deliveryDateRequired": "Vui lòng chọn ngày nhận hàng"
  },
  "messages": {
    "fetchProductsError": "Không thể tải danh sách sản phẩm",
    "maxFiles": "Bạn chỉ được tải lên tối đa 5 file",
    "success": "Gửi yêu cầu B2B thành công! Chúng tôi sẽ liên hệ báo giá sớm.",
    "error": "Có lỗi xảy ra, vui lòng thử lại sau"
  },
  "buttons": {
    "back": "Quay lại Bảng điều khiển",
    "submit": "Gửi Yêu Cầu",
    "submitting": "Đang gửi..."
  }
};

const enTranslations = {
  ...viTranslations,
  "title": "B2B Dashboard",
  "request_title": "Create B2B Request",
  "subtitle": "Fill in your requirements, we will contact you soon",
  "companyInfo": {
    "title": "Company Information",
    "desc1": "We will use this information for Contracts & Invoicing",
    "company": "Company",
    "taxCode": "Tax Code",
    "notUpdated": "Not updated",
    "note": "You can update this in your Profile"
  },
  "fields": {
    "product": "Product / Service",
    "productPlaceholder": "Select product or service",
    "quantity": "Estimated Quantity",
    "budget": "Estimated Budget (VND)",
    "budgetPlaceholder": "Example: 50,000,000",
    "deliveryDate": "Expected Delivery Date",
    "deliveryDatePlaceholder": "Select date...",
    "packaging": "Packaging Requirements",
    "packagingPlaceholder": "Select packaging option",
    "packagingOptions": {
      "STANDARD_BOX": "MKHE Standard Box",
      "NO_PACKAGING": "No Packaging"
    },
    "note": "Additional Notes",
    "notePlaceholder": "Special requests for materials, scent, dimensions...",
    "designFiles": "Attachments (Designs / Detailed Requests)",
    "dragDrop": "Drag and drop files here or click to select",
    "fileHint": "Supports .pdf, .ai, .png, .jpg (Max 5 files)",
    "fileNote": "Maximum 5 files"
  },
  "buttons": {
    "back": "Back to Dashboard",
    "submit": "Submit Request",
    "submitting": "Submitting..."
  }
};

locales.forEach(lang => {
  const dirPath = path.join(basePath, lang);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const filePath = path.join(dirPath, 'b2b.json');
  
  const translations = lang === 'en' ? enTranslations : viTranslations;
  
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
  console.log(`Updated b2b.json for ${lang}`);
});
