/**
 * Format số thành chuỗi có dấu chấm hàng nghìn
 * Ví dụ: 100000 -> "100.000"
 */
export const formatNumber = (val) => {
  if (val === undefined || val === null || val === "") return "";
  // Xóa hết dấu chấm cũ nếu có, sau đó format lại
  const number = val.toString().replace(/\./g, "");
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Chuyển đổi ngược lại từ chuỗi "100.000" về số 100000
 */
export const parseNumber = (val) => {
  if (!val) return 0;
  return parseInt(val.toString().replace(/\./g, ""), 10) || 0;
};

/**
 * Lấy URL đầy đủ của ảnh/video từ đường dẫn tương đối
 */
export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  if (url.startsWith("/")) return `http://localhost:5000${url}`;
  return `http://localhost:5000/${url}`;
};