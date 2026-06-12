import imageCompression from 'browser-image-compression';

/**
 * Nén hình ảnh trên trình duyệt xuống mức tối ưu (< 1MB) và chuyển đổi sang WebP
 * Giúp tiết kiệm băng thông và dung lượng lưu trữ Cloudinary
 * @param {File} file - File ảnh gốc cần nén
 * @returns {Promise<File>} File ảnh đã nén (định dạng WebP)
 */
export const compressImage = async (file) => {
  if (!file || !file.type.startsWith("image/")) return file;

  // Cấu hình thuật toán nén
  const options = {
    maxSizeMB: 1,            // Nén xuống tối đa 1MB
    maxWidthOrHeight: 1920,  // Giới hạn độ phân giải (thường là Full HD cho web)
    useWebWorker: true,      // Dùng đa luồng để không làm đơ trang
    fileType: "image/webp",  // Tối ưu hóa sang chuẩn WebP của Google
    initialQuality: 0.85,    // Giữ chất lượng 85%
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    // Đổi tên đuôi file thành .webp để đồng nhất
    const originalName = file.name;
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const newFileName = `${baseName}.webp`;

    return new File([compressedBlob], newFileName, { type: "image/webp" });
  } catch (error) {
    console.error("Lỗi khi nén ảnh:", error);
    // Nếu có lỗi thuật toán, trả về file gốc nguyên bản
    return file;
  }
};
