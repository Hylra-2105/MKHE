import fs from "fs";
import path from "path";

const localesDir = path.resolve("./src/locales");
const languages = ["vi", "en", "ja", "ko", "zh"];

const translations = {
  vi: {
    "shipping_info.email_notification": "Email nhận thông báo",
    "summary.discount": "Giảm giá (Voucher)",
    "success.title": "Đặt hàng thành công!",
    "success.thank_you_part1": "Cám ơn bạn đã mua sắm tại MKHE Heritage. Mã đơn hàng của bạn là",
    "success.thank_you_part2": "Hóa đơn và chi tiết đơn hàng đã được gửi vào email của bạn.",
    "success.qr_scan": "Quét mã QR để thanh toán",
    "success.bank": "Ngân hàng",
    "success.account_no": "Số tài khoản",
    "success.account_name": "Chủ tài khoản",
    "success.amount": "Số tiền",
    "success.content": "Nội dung CK",
    "success.note": "Vui lòng chuyển khoản đúng nội dung để hệ thống duyệt đơn tự động.",
    "success.cod_method": "Phương thức thanh toán: COD",
    "success.cod_note_part1": "Bạn sẽ thanh toán số tiền",
    "success.cod_note_part2": "khi nhận được hàng.",
    "success.continue_shopping": "Tiếp tục mua sắm"
  },
  en: {
    "shipping_info.email_notification": "Notification Email",
    "summary.discount": "Discount (Voucher)",
    "success.title": "Order placed successfully!",
    "success.thank_you_part1": "Thank you for shopping at MKHE Heritage. Your order code is",
    "success.thank_you_part2": "The invoice and order details have been sent to your email.",
    "success.qr_scan": "Scan QR code to pay",
    "success.bank": "Bank",
    "success.account_no": "Account Number",
    "success.account_name": "Account Name",
    "success.amount": "Amount",
    "success.content": "Transfer Content",
    "success.note": "Please transfer with the exact content for automatic order approval.",
    "success.cod_method": "Payment Method: COD",
    "success.cod_note_part1": "You will pay the amount of",
    "success.cod_note_part2": "upon delivery.",
    "success.continue_shopping": "Continue Shopping"
  },
  ja: {
    "shipping_info.email_notification": "通知メール",
    "summary.discount": "割引 (クーポン)",
    "success.title": "注文が完了しました！",
    "success.thank_you_part1": "MKHE Heritageでお買い物いただきありがとうございます。ご注文番号は",
    "success.thank_you_part2": "請求書と注文の詳細が記載されたメールを送信しました。",
    "success.qr_scan": "QRコードをスキャンして支払う",
    "success.bank": "銀行",
    "success.account_no": "口座番号",
    "success.account_name": "口座名義",
    "success.amount": "金額",
    "success.content": "振込内容",
    "success.note": "自動注文承認のために、正確な内容で振り込んでください。",
    "success.cod_method": "支払い方法：代金引換",
    "success.cod_note_part1": "配達時に",
    "success.cod_note_part2": "をお支払いいただきます。",
    "success.continue_shopping": "買い物を続ける"
  },
  ko: {
    "shipping_info.email_notification": "알림 이메일",
    "summary.discount": "할인 (바우처)",
    "success.title": "주문이 완료되었습니다!",
    "success.thank_you_part1": "MKHE Heritage에서 쇼핑해 주셔서 감사합니다. 주문 번호는",
    "success.thank_you_part2": "청구서 및 주문 세부 정보가 이메일로 발송되었습니다.",
    "success.qr_scan": "QR 코드를 스캔하여 결제",
    "success.bank": "은행",
    "success.account_no": "계좌 번호",
    "success.account_name": "예금주",
    "success.amount": "금액",
    "success.content": "이체 내용",
    "success.note": "자동 주문 승인을 위해 정확한 내용으로 이체해 주십시오.",
    "success.cod_method": "결제 방법: 착불 (COD)",
    "success.cod_note_part1": "배송 시",
    "success.cod_note_part2": "을(를) 지불하게 됩니다.",
    "success.continue_shopping": "쇼핑 계속하기"
  },
  zh: {
    "shipping_info.email_notification": "通知邮箱",
    "summary.discount": "折扣（优惠券）",
    "success.title": "下单成功！",
    "success.thank_you_part1": "感谢您在MKHE Heritage购物。您的订单号是",
    "success.thank_you_part2": "发票和订单详情已发送至您的邮箱。",
    "success.qr_scan": "扫描二维码支付",
    "success.bank": "银行",
    "success.account_no": "账号",
    "success.account_name": "账户名",
    "success.amount": "金额",
    "success.content": "转账内容",
    "success.note": "请务必按准确内容转账以便系统自动审核订单。",
    "success.cod_method": "付款方式：货到付款",
    "success.cod_note_part1": "您将在收到货物时支付",
    "success.cod_note_part2": "。",
    "success.continue_shopping": "继续购物"
  }
};

languages.forEach(lang => {
  const filePath = path.join(localesDir, lang, "checkout.json");
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    const t = translations[lang];
    if (t) {
      data.shipping_info = data.shipping_info || {};
      data.shipping_info.email_notification = t["shipping_info.email_notification"];
      
      data.summary = data.summary || {};
      data.summary.discount = t["summary.discount"];

      data.success = data.success || {};
      data.success.title = t["success.title"];
      data.success.thank_you_part1 = t["success.thank_you_part1"];
      data.success.thank_you_part2 = t["success.thank_you_part2"];
      data.success.qr_scan = t["success.qr_scan"];
      data.success.bank = t["success.bank"];
      data.success.account_no = t["success.account_no"];
      data.success.account_name = t["success.account_name"];
      data.success.amount = t["success.amount"];
      data.success.content = t["success.content"];
      data.success.note = t["success.note"];
      data.success.cod_method = t["success.cod_method"];
      data.success.cod_note_part1 = t["success.cod_note_part1"];
      data.success.cod_note_part2 = t["success.cod_note_part2"];
      data.success.continue_shopping = t["success.continue_shopping"];
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Updated ${lang}/checkout.json`);
    }
  }
});
