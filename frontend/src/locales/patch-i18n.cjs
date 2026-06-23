const fs = require('fs');
const path = require('path');

const locales = ['ja', 'ko', 'zh'];
const additions = {
  ja: {
    filter: { all_status: "すべてのステータス", active: "アクティブ", blocked: "ブロックされました" },
    users: { other_addresses: "(+{{count}} 他の住所)", other_addresses_plural: "(+{{count}} 他の住所)" },
    orders_print: {
      title: "配送ラベル", order_code: "注文コード", sender: "送信者:", shop: "ショップ:", phone: "電話:", address: "住所:", receiver: "受信者:", customer: "お客様:", note: "メモ:", product: "製品", quantity: "数量", unit_price: "単価", total: "合計", total_amount: "注文合計:", payment_method: "支払方法:", cod: "代金引換額:"
    }
  },
  ko: {
    filter: { all_status: "모든 상태", active: "활동적인", blocked: "차단됨" },
    users: { other_addresses: "(+{{count}} 다른 주소)", other_addresses_plural: "(+{{count}} 다른 주소)" },
    orders_print: {
      title: "배송 라벨", order_code: "주문 코드", sender: "발송인:", shop: "가게:", phone: "전화:", address: "주소:", receiver: "수취인:", customer: "고객:", note: "메모:", product: "상품", quantity: "수량", unit_price: "단가", total: "합계", total_amount: "주문 총액:", payment_method: "결제 방법:", cod: "COD 금액:"
    }
  },
  zh: {
    filter: { all_status: "所有状态", active: "活跃", blocked: "已封锁" },
    users: { other_addresses: "(+{{count}} 其他地址)", other_addresses_plural: "(+{{count}} 其他地址)" },
    orders_print: {
      title: "运输标签", order_code: "订单代码", sender: "发件人:", shop: "店铺:", phone: "电话:", address: "地址:", receiver: "收件人:", customer: "客户:", note: "备注:", product: "产品", quantity: "数量", unit_price: "单价", total: "总计", total_amount: "订单总计:", payment_method: "付款方式:", cod: "代收货款:"
    }
  }
};

locales.forEach(lang => {
  const filePath = path.join('c:/React/MKHE/frontend/src/locales', lang, 'admin.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add filter
    data.filter = data.filter || {};
    Object.assign(data.filter, additions[lang].filter);
    
    // Add users
    data.users = data.users || {};
    Object.assign(data.users, additions[lang].users);
    
    // Add orders.print
    data.orders = data.orders || {};
    data.orders.print = additions[lang].orders_print;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang}/admin.json`);
  }
});
