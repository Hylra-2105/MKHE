import { userApi } from "@/api/userApi";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  User,
  ShieldCheck,
  Edit2,
  ChevronRight,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getLastNameInitial, isVideoUrl } from "@/utils/validators";
import GeneralInfoTab from "./GeneralInfoTab";
import ChangePasswordModal from "./ChangePasswordModal";

const UserProfile = () => {
  const { t } = useTranslation("user");

  const { user, setUser, isFetchingUser } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // STATE CHO AVATAR VÀ DRAG & DROP
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isPreviewVideo, setIsPreviewVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State cho Modal Kéo thả
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
      setIsPreviewVideo(isVideoUrl(user.avatar));
    }
  }, [user?.avatar]);

  const hasPassword = user?.provider === "local" || user?.hasPassword;

  // HÀM XỬ LÝ KÉO THẢ (DRAG & DROP)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await processFile(file);
  };

  // HÀM XỬ LÝ FILE (DÙNG CHUNG CHO KÉO THẢ VÀ CHỌN TAY)
  const processFile = async (file) => {
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    // Kiểm tra định dạng
    if (!isImage && !isVideo) {
      toast.error(t("errors.invalid_file_type"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Kiểm tra dung lượng (Ảnh max 5MB, Video max 30MB)
    const maxSize = isVideo ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = isVideo
        ? "errors.video_too_large"
        : "errors.image_too_large";
      toast.error(t(errorMsg));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Tối ưu bộ nhớ: Xóa URL tạm cũ
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    // Cập nhật giao diện ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsPreviewVideo(isVideo);

    // Đóng Modal sau khi đã nhận file thành công
    setIsUploadModalOpen(false);

    // Tiến hành upload
    await uploadAvatarToServer(file);
  };

  const uploadAvatarToServer = async (file) => {
    setIsUploading(true);
    try {
      // Đóng gói file vào FormData để gửi đi
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await userApi.uploadAvatar(formData);

      // Nếu thành công, lấy cục data User mới nhất từ Backend đè thẳng vào Store
      if (response.success) {
        setUser(response.data);
        toast.success(t("messages.update_success"));
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      toast.error(t(errorMsg, { ns: "common" }) || t(errorMsg));

      // Upload xịt thì trả lại ảnh gốc
      setAvatarPreview(user?.avatar || "");
      setIsPreviewVideo(isVideoUrl(user?.avatar));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  const renderMedia = () => {
    const commonClasses = `w-36 h-36 rounded-full object-cover border-4 border-[var(--color-mkhe-input)] shadow-xl transition-all duration-300 ${
      isUploading ? "opacity-50 blur-[2px]" : "opacity-100 blur-0"
    }`;

    if (isFetchingUser) {
      return (
        <div className="w-36 h-36 rounded-full bg-mkhe-border/20 animate-pulse border-4 border-[var(--color-mkhe-input)] shadow-xl" />
      );
    }

    if (isPreviewVideo) {
      return (
        <video
          src={avatarPreview}
          autoPlay
          loop
          muted
          playsInline
          className={commonClasses}
        />
      );
    }

    return (
      <img
        src={
          avatarPreview ||
          `https://ui-avatars.com/api/?name=${getLastNameInitial(user.name)}&background=random`
        }
        alt="avatar"
        loading="lazy"
        className={commonClasses}
      />
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative">
      <h1 className="text-2xl font-bold text-mkhe-text mb-6">
        {t("profile.title")}
      </h1>

      <div className="bg-[var(--color-mkhe-input)] rounded-2xl shadow-xl border border-[var(--color-mkhe-border)]/30 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* CỘT TRÁI*/}
        <div className="md:w-[35%] bg-mkhe-primary/5 p-8 border-b md:border-b-0 md:border-r border-[var(--color-mkhe-border)]/20 flex flex-col items-center transition-colors">
          <div className="relative mb-10 mt-4 group">
            {renderMedia()}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-3 bg-mkhe-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="w-full space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm bg-mkhe-primary text-white shadow-sm cursor-default">
              <User className="w-5 h-5" />
              <span>{t("profile.general_info")}</span>
            </button>

            {hasPassword && (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full flex items-center justify-between px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] hover:bg-[var(--color-mkhe-border)] border border-[var(--color-mkhe-border)]/10 shadow-sm transition-all cursor-pointer mt-3"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-mkhe-primary" />
                  <span>{t("profile.change_password")}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            )}
          </div>
        </div>

        {/* CỘT PHẢI*/}
        <div className="flex-1 flex flex-col bg-[var(--color-mkhe-input)] transition-colors">
          <GeneralInfoTab user={user} />
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={user.email}
      />

      {/*MODAL KÉO THẢ FILE */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
          isUploadModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) =>
          e.target === e.currentTarget && setIsUploadModalOpen(false)
        }
      >
        <div
          className={`relative bg-[var(--color-mkhe-bg)] w-full max-w-md rounded-2xl shadow-2xl p-8 border border-[var(--color-mkhe-border)]/30 transform transition-all duration-200 ${
            isUploadModalOpen ? "scale-100" : "scale-95"
          }`}
        >
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="absolute top-4 right-4 p-2 cursor-pointer hover:bg-[var(--color-mkhe-primary)]/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-mkhe-text)]/70" />
          </button>

          <h2 className="text-xl font-bold text-center text-gradient-gold mb-6">
            {t("profile.update_avatar")}
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-mkhe-primary bg-mkhe-primary/10 scale-[1.02]"
                : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-[var(--color-mkhe-primary)]/5"
            }`}
          >
            <UploadCloud
              className={`w-14 h-14 mb-4 ${
                isDragging
                  ? "text-mkhe-primary"
                  : "text-[var(--color-mkhe-text)]/40"
              }`}
            />
            <p className="text-center font-semibold text-[var(--color-mkhe-text)]">
              {t("profile.drag_drop")}
            </p>
            <p className="text-sm text-[var(--color-mkhe-text)]/50 mt-2">
              {t("profile.click_browse")}
            </p>
            <div className="text-[11px] text-[var(--color-mkhe-text)]/40 mt-6 text-center">
              <p>{t("profile.support_img")}</p>
              <p>{t("profile.support_video")}</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => processFile(e.target.files[0])}
            accept="image/*, video/mp4, video/webm"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
