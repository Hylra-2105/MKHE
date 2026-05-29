export const getLastNameInitial = (name) => {
  if (!name) return "";

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/); // Split by whitespace

  // Lấy từ cuối và chữ cái đầu tiên của nó
  const lastWord = words[words.length - 1];
  return lastWord.charAt(0).toUpperCase();
};

export const validateRegistration = (
  name,
  email,
  password,
  confirmPassword,
) => {
  const errors = {}; // Tạo một object chứa các lỗi

  // Kiểm tra Họ tên
  if (!name) {
    errors.name = "err_empty_name";
  } else if (name.trim().length < 2) {
    errors.name = "err_name_length";
  }

  // Kiểm tra Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "err_empty_email";
  } else if (!emailRegex.test(email)) {
    errors.email = "err_invalid_email";
  }

  // Kiểm tra Mật khẩu
  if (!password) {
    errors.password = "err_empty_password";
  } else if (password.length < 6) {
    errors.password = "err_password_length";
  }

  // Kiểm tra Nhập lại mật khẩu
  if (!confirmPassword) {
    errors.confirmPassword = "err_empty_confirm_password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "err_password_mismatch";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

export const isValidPhoneInput = (value) => {
  return /^[0-9+]*$/.test(value);
};

export const cleanPhoneNumber = (phone, dialCode = "") => {
  if (!phone) return "";
  let cleaned = phone.trim();

  // 1. Nếu có dialCode (+84), gọt chính xác cục đó (an toàn tuyệt đối)
  if (dialCode) {
    while (cleaned.startsWith(dialCode)) {
      cleaned = cleaned.substring(dialCode.length).trim();
    }
  } else {
    // 2. Phòng hờ nếu ko có dialCode: Chỉ gọt bằng Regex NẾU có khoảng trắng
    // (VD: "+84 333...", chứ viết liền "+84333" thì tha cho nó để khỏi ăn nhầm)
    cleaned = cleaned.replace(/(^\+\d{1,4}\s+)+/g, "").trim();
  }

  // 3. Gọt số 0 đầu tiên
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1).trim();
  }

  return cleaned;
};
