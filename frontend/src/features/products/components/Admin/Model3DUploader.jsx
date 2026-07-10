import React, { useRef } from "react";
import { Box, UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const Model3DUploader = ({
  hasDPP,
  file3D,
  isDragging3D,
  isCompressing3D,
  isDeleted3D,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemove3DFile,
  fileInput3DRef
}) => {
  const { t } = useTranslation("product");

  if (!hasDPP) return null;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold text-mkhe-text/70 uppercase ml-1 flex items-center gap-1">
        <Box className="w-3 h-3" /> {t("modal.3d_file.label", { defaultValue: "MÔ HÌNH 3D (.glb)" })}
      </label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInput3DRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-full ${
          isDragging3D
            ? "border-mkhe-primary bg-mkhe-primary/10"
            : file3D
            ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500"
            : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-mkhe-primary/5"
        }`}
      >
        <input
          type="file"
          ref={fileInput3DRef}
          onChange={onFileInputChange}
          accept=".glb,.gltf"
          className="hidden"
        />
        
        {isCompressing3D ? (
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-mkhe-primary border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs font-semibold text-mkhe-primary animate-pulse">
              {t("modal.3d_file.compressing", { defaultValue: "Đang tối ưu & nén file bằng thuật toán Draco..." })}
            </p>
          </div>
        ) : file3D ? (
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-6 h-6 mb-1 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-600 truncate max-w-[200px]">
              {file3D.name || t("modal.3d_file.selected_file", { defaultValue: "Đã chọn file 3D mới" })}
            </p>
            <p className="text-[10px] text-emerald-600/70 mt-0.5">
              {(file3D.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-2 py-1 bg-emerald-500/10 rounded font-medium text-emerald-600">
                {t("modal.3d_file.optimized", { defaultValue: "Đã nén chuẩn Web" })}
              </span>
              <button
                type="button"
                onClick={onRemove3DFile}
                className="text-[10px] text-rose-500 hover:text-rose-600 font-bold px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 rounded transition-colors"
              >
                {t("modal.3d_file.delete", { defaultValue: "Xóa" })}
              </button>
            </div>
          </div>
        ) : isDeleted3D ? (
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-6 h-6 mb-2 text-rose-500" />
            <p className="text-sm font-semibold text-rose-500">
              {t("modal.3d_file.deleted", { defaultValue: "Sẽ Xóa Model 3D hiện tại" })}
            </p>
            <p className="text-xs text-mkhe-text/50 mt-1">
              {t("modal.3d_file.click_upload_new", { defaultValue: "Kéo thả hoặc click để upload file mới" })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className="w-6 h-6 mb-2 text-mkhe-text/40" />
            <p className="text-sm font-semibold text-mkhe-text/80">
              {t("modal.3d_file.drag_drop", { defaultValue: "Kéo thả file .glb vào đây" })}
            </p>
            <p className="text-[10px] text-mkhe-text/50 mt-1 italic max-w-xs">
              {t("modal.3d_file.auto_compress", { defaultValue: "Hệ thống sẽ tự động tối ưu lưới Mesh & Texture. Hỗ trợ file siêu nặng lên tới 150MB!" })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Model3DUploader;
