import React from "react";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  // Trỏ đúng vào namespace "home" như cha yêu cầu
  const { t } = useTranslation("home");

  return (
    <footer className="bg-mkhe-bg border-t border-mkhe-border/30 pt-16 pb-8 px-6 text-mkhe-text">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Cột 1: Thông tin thương hiệu */}
        <div className="md:col-span-1">
          <h2 className="text-3xl font-logo font-bold text-mkhe-primary mb-4">
            MKHE
          </h2>
          <p className="text-mkhe-text/70 text-sm leading-relaxed mb-6">
            {t("footer.brand_desc")}
          </p>
          <div className="flex gap-4 text-mkhe-primary">
            <a
              href="https://www.facebook.com/profile.php?id=61590251406483"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <FaFacebook className="w-5 h-5 cursor-pointer" />
            </a>
            <a
              href="https://instagram.com/your-page"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <FaInstagram className="w-5 h-5 cursor-pointer" />
            </a>
            <a
              href="https://linkedin.com/company/your-company"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <FaLinkedin className="w-5 h-5 cursor-pointer" />
            </a>
          </div>
        </div>

        {/* Cột 2: Điều hướng */}
        <div>
          <h3 className="font-bold mb-4 text-mkhe-primary uppercase tracking-wider text-sm">
            {t("footer.explore.title")}
          </h3>
          <ul className="space-y-3 text-sm text-mkhe-text/70">
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.explore.about")}
            </li>
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.explore.b2b")}
            </li>
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.explore.b2c")}
            </li>
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.explore.heritage")}
            </li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="font-bold mb-4 text-mkhe-primary uppercase tracking-wider text-sm">
            {t("footer.support.title")}
          </h3>
          <ul className="space-y-3 text-sm text-mkhe-text/70">
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.support.privacy")}
            </li>
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.support.terms")}
            </li>
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.support.nfc")}
            </li>
            <li className="hover:text-mkhe-primary cursor-pointer transition-colors">
              {t("footer.support.tracking")}
            </li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h3 className="font-bold mb-4 text-mkhe-primary uppercase tracking-wider text-sm">
            {t("footer.contact.title")}
          </h3>
          <ul className="space-y-4 text-sm text-mkhe-text/70">
            {/* Địa chỉ */}
            <li className="flex items-start gap-3 group">
              <MapPin className="w-5 h-5 text-mkhe-primary shrink-0 mt-0.5" />
              <a
                href="https://www.google.com/maps/place/Cần+Thơ,+Việt+Nam"
                target="_blank"
                rel="noopener noreferrer"
                className="group-hover:text-mkhe-primary transition-colors leading-relaxed"
              >
                {t("footer.contact.address")}
              </a>
            </li>

            {/* Số điện thoại */}
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-mkhe-primary shrink-0" />
              <span>039 424 8611</span>
            </li>

            {/* Email */}
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-mkhe-primary shrink-0" />
              <span>mkheagency@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dòng bản quyền cuối cùng */}
      <div className="max-w-7xl mx-auto border-t border-mkhe-border/20 pt-8 flex justify-center items-center text-xs text-mkhe-text/50">
        <p className="text-center">
          © {new Date().getFullYear()} MKHE. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
