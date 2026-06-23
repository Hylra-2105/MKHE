const fs = require('fs');
const path = require('path');

const locales = ['en', 'vi', 'ko', 'ja', 'zh'];

const checkoutData = {
  vi: {
    note: "Ghi chú đơn hàng (Tùy chọn)",
    note_placeholder: "Ghi chú thêm về thời gian nhận hàng, địa điểm..."
  },
  en: {
    note: "Order note (Optional)",
    note_placeholder: "Additional notes about delivery time, location..."
  },
  ko: {
    note: "주문 메모 (선택 사항)",
    note_placeholder: "배송 시간, 장소 등에 대한 추가 메모..."
  },
  ja: {
    note: "注文メモ (任意)",
    note_placeholder: "配達時間や場所に関する追加メモ..."
  },
  zh: {
    note: "订单备注 (可选)",
    note_placeholder: "关于交货时间、地点的附加说明..."
  }
};

locales.forEach(locale => {
  const checkoutPath = path.join(__dirname, locale, 'checkout.json');
  if (fs.existsSync(checkoutPath)) {
    const fileData = JSON.parse(fs.readFileSync(checkoutPath, 'utf8'));
    if (!fileData.shipping_info) fileData.shipping_info = {};
    Object.assign(fileData.shipping_info, checkoutData[locale]);
    fs.writeFileSync(checkoutPath, JSON.stringify(fileData, null, 2), 'utf8');
  }
  console.log(`Updated checkout for ${locale}`);
});
