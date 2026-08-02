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

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
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
 * 
 * Update fallback image
 */
export const DEFAULT_FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f9fafb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%239ca3af%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E`;

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
};

/**
 * Chuẩn hóa URL YouTube thành định dạng embed chuẩn
 */
export const normalizeYoutubeUrl = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();
  let finalUrl = cleanUrl;
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i;
  const match = cleanUrl.match(ytRegex) || cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  
  if (match && match[1]) {
      finalUrl = `https://www.youtube.com/embed/${match[1]}`;
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      finalUrl = `https://www.youtube.com/embed/${cleanUrl}`;
  }
  return finalUrl;
};