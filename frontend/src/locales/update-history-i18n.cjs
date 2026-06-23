const fs = require('fs');
const path = require('path');

const locales = ['en', 'vi', 'ko', 'ja', 'zh'];

const historyData = {
  vi: {
    note: "Ghi chú đơn hàng",
    products: "Sản phẩm",
    product_name: "Tên sản phẩm",
    price: "Đơn giá",
    receive_btn: "Đã nhận được hàng",
    confirm_receive: "Xác nhận bạn đã nhận được hàng và sản phẩm không có vấn đề gì?",
    confirm_btn: "Đồng ý"
  },
  en: {
    note: "Order note",
    products: "Products",
    product_name: "Product Name",
    price: "Unit Price",
    receive_btn: "Received",
    confirm_receive: "Confirm you have received the products in good condition?",
    confirm_btn: "Confirm"
  },
  ko: {
    note: "주문 메모",
    products: "제품",
    product_name: "상품명",
    price: "단가",
    receive_btn: "수령 완료",
    confirm_receive: "상품을 정상적으로 수령하셨습니까?",
    confirm_btn: "확인"
  },
  ja: {
    note: "注文メモ",
    products: "製品",
    product_name: "製品名",
    price: "単価",
    receive_btn: "受け取りました",
    confirm_receive: "商品を無事に受け取ったことを確認しますか？",
    confirm_btn: "確認"
  },
  zh: {
    note: "订单备注",
    products: "产品",
    product_name: "产品名称",
    price: "单价",
    receive_btn: "已收货",
    confirm_receive: "确认您已完好收到产品？",
    confirm_btn: "确认"
  }
};

const commonData = {
  vi: { cancel: "Hủy", back: "Trở lại" },
  en: { cancel: "Cancel", back: "Back" },
  ko: { cancel: "취소", back: "뒤로" },
  ja: { cancel: "キャンセル", back: "戻る" },
  zh: { cancel: "取消", back: "返回" }
};

locales.forEach(locale => {
  const historyPath = path.join(__dirname, locale, 'history.json');
  if (fs.existsSync(historyPath)) {
    const fileData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    Object.assign(fileData, historyData[locale]);
    fs.writeFileSync(historyPath, JSON.stringify(fileData, null, 2), 'utf8');
  }

  const commonPath = path.join(__dirname, locale, 'common.json');
  if (fs.existsSync(commonPath)) {
    const commonFileData = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
    Object.assign(commonFileData, commonData[locale]);
    fs.writeFileSync(commonPath, JSON.stringify(commonFileData, null, 2), 'utf8');
  } else {
    fs.writeFileSync(commonPath, JSON.stringify(commonData[locale], null, 2), 'utf8');
  }
  
  console.log(`Updated history and common for ${locale}`);
});
