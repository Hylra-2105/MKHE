export const normalizeEmailMiddleware = (req, res, next) => {
  // Chỉ xử lý nếu Client có gửi trường "email" lên
  if (req.body && req.body.email) {
    let email = req.body.email.toLowerCase().trim();
    let [localPart, domain] = email.split("@");

    if (domain === "gmail.com") {
      localPart = localPart.replace(/\./g, ""); // Xóa toàn bộ dấu chấm
      localPart = localPart.split("+")[0];      // Cắt bỏ phần sau dấu cộng
    }

    // Ghi đè lại email đã sạch sẽ vào req.body
    req.body.email = `${localPart}@${domain}`;
  }
  next();
};