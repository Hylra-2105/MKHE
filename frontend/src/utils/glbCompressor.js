import { WebIO } from '@gltf-transform/core';
import { prune, dedup, draco, textureCompress } from '@gltf-transform/functions';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3d';

/**
 * Nén file GLB/GLTF trực tiếp trên trình duyệt
 * - Cắt giảm rác (prune)
 * - Gộp dữ liệu trùng lặp (dedup)
 * - Nén Texture thành WebP (1024x1024)
 * - Nén Lưới 3D bằng Draco
 * 
 * @param {File} file File 3D (.glb, .gltf)
 * @returns {Promise<File>} File 3D đã được nén
 */
export const compressGLB = async (file) => {
  try {
    // 1. Đọc file sang Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 2. Khởi tạo WebIO
    const io = new WebIO();
    
    // 3. Khởi tạo WebAssembly Module của Draco (Chỉ định rõ đường dẫn public)
    const dracoEncoderModule = await draco3d.createEncoderModule({
      locateFile: (file) => `/draco/${file}`
    });
    const dracoDecoderModule = await draco3d.createDecoderModule({
      locateFile: (file) => `/draco/${file}`
    });
    
    io.registerExtensions([KHRDracoMeshCompression])
      .registerDependencies({
        'draco3d.encoder': dracoEncoderModule,
        'draco3d.decoder': dracoDecoderModule,
      });

    // 4. Đọc file 3D
    const document = await io.readBinary(uint8Array);

    // 5. Chạy các thuật toán dọn rác cơ bản
    await document.transform(prune(), dedup());

    // 6. Nén Texture. Rất dễ bị lỗi trên một số trình duyệt thiếu Encoder, nên bọc Try-Catch
    try {
      await document.transform(
        textureCompress({ targetFormat: 'webp', resize: [1024, 1024] })
      );
    } catch (err) {
      console.warn("Trình duyệt không hỗ trợ API nén ảnh Canvas, sẽ bỏ qua nén ảnh:", err.message);
    }

    // 7. Nén lưới 3D bằng Draco
    await document.transform(draco({ method: 'edgebreaker', quantizationBits: 14 }));

    // 8. Xuất ra Binary
    const compressedBuffer = await io.writeBinary(document);
    
    // 9. Chuyển lại thành File object
    const compressedFile = new File([compressedBuffer], file.name.replace(/\.gltf$/i, '.glb'), {
      type: 'model/gltf-binary',
    });

    return compressedFile;
  } catch (error) {
    console.error('[compressGLB] Lỗi khi nén file 3D:', error);
    throw error;
  }
};
