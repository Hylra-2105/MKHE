export const validateRegistration = (email, password, confirmPassword) => {
  const errors = {}; // Tạo một object chứa các lỗi

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
