export const getLastNameInitial = (name) => {
  if (!name) return "";

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/); // Split by whitespace

  // Lấy từ cuối và chữ cái đầu tiên
  const lastWord = words[words.length - 1];
  return lastWord.charAt(0).toUpperCase();
};

export const getPasswordErrorKey = (password) => {
  if (!password) return "err_empty_password";
  if (password.length < 8) return "err_pass_min_length";
  if (!/[A-Z]/.test(password)) return "err_pass_uppercase";
  if (!/\d/.test(password)) return "err_pass_number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "err_pass_special";
  return null;
};

export const validateRegistration = (
  name,
  email,
  password,
  confirmPassword,
  username,
  phone
) => {
  const errors = {}; // Tạo một object chứa các lỗi

  // Kiểm tra Họ tên
  if (!name) {
    errors.name = "err_empty_name";
  } else if (name.trim().length < 2) {
    errors.name = "err_name_length";
  }

  // Kiểm tra Username
  const usernameRegex = /^[a-z0-9_]{3,20}$/;
  if (!username) {
    errors.username = "err_empty_username";
  } else if (!usernameRegex.test(username.toLowerCase())) {
    errors.username = "err_invalid_username";
  }

  // Kiểm tra Phone
  if (!phone) {
    errors.phone = "err_empty_phone";
  } else if (!isValidPhoneInput(phone) || phone.length < 9 || phone.length > 11) {
    errors.phone = "err_invalid_phone";
  }

  // Kiểm tra Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "err_empty_email";
  } else if (!emailRegex.test(email)) {
    errors.email = "err_invalid_email";
  }

  // Kiểm tra Mật khẩu
  const passError = getPasswordErrorKey(password);
  if (passError) {
    errors.password = passError;
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

  if (dialCode) {
    while (cleaned.startsWith(dialCode)) {
      cleaned = cleaned.substring(dialCode.length).trim();
    }
  } else {
    cleaned = cleaned.replace(/(^\+\d{1,4}\s+)+/g, "").trim();
  }

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1).trim();
  }

  return cleaned;
};

export const maskEmail = (email) => {
  if (!email) return "";
  return email.replace(
    /^(.)(.*)(?=@)/,
    (match, p1, p2) => p1 + "*".repeat(p2.length),
  );
};

export const isVideoMedia = (url) => {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  return !!url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("/video/") || url.includes('mkhe_videos') || url.startsWith('data:video');
};
