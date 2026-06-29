import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const { t } = useTranslation("home");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Hiệu ứng lần lượt từ trái sang phải
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 }, // Trượt từ trái sang
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <footer className="bg-mkhe-bg dark:bg-[#110A06] pt-20 pb-8 px-6 text-mkhe-text dark:text-gray-300 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-mkhe-primary/5 rounded-full blur-[80px] -z-10"></div>
      
      <motion.div 
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Cột 1: Thông tin thương hiệu */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Link to="/" className="inline-block mb-6">
            <h2 className="text-4xl font-logo font-bold text-mkhe-primary">
              MKHE
            </h2>
          </Link>
          <p className="text-mkhe-text/70 dark:text-gray-400 text-sm leading-relaxed mb-8 font-light">
            {t("footer.brand_desc")}
          </p>
          <div className="flex gap-4 text-mkhe-primary">
            <a
              href="https://www.facebook.com/profile.php?id=61590251406483"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-mkhe-primary/30 flex items-center justify-center hover:bg-mkhe-primary hover:text-white transition-all duration-300"
            >
              <FaFacebook className="w-5 h-5 cursor-pointer" />
            </a>
            <a
              href="https://www.tiktok.com/@mkheagency?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-mkhe-primary/30 flex items-center justify-center hover:bg-mkhe-primary hover:text-white transition-all duration-300"
            >
              <FaTiktok className="w-5 h-5 cursor-pointer" />
            </a>
          </div>
        </motion.div>

        {/* Cột 2: Điều hướng */}
        <motion.div variants={itemVariants} className="md:pl-8">
          <h3 className="font-bold mb-8 text-mkhe-text dark:text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2">
            <span className="w-4 h-px bg-mkhe-primary"></span>
            {t("footer.explore.title")}
          </h3>
          <ul className="space-y-4 text-sm text-mkhe-text/70 dark:text-gray-400">
            <li>
              <Link to="/about" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.explore.about")}
              </Link>
            </li>
            <li>
              <Link to="/shop?category=B2B" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.explore.b2b", "Bộ sưu tập B2B")}
              </Link>
            </li>
            <li>
              <Link to="/shop?category=B2C" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.explore.b2c", "Thời trang B2C")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.explore.heritage", "Hành trình Di sản")}
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Cột 3: Hỗ trợ */}
        <motion.div variants={itemVariants}>
          <h3 className="font-bold mb-8 text-mkhe-text dark:text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2">
            <span className="w-4 h-px bg-mkhe-primary"></span>
            {t("footer.support.title")}
          </h3>
          <ul className="space-y-4 text-sm text-mkhe-text/70 dark:text-gray-400">
            <li>
              <Link to="#" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.support.privacy", "Chính sách bảo mật")}
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.support.terms", "Điều khoản dịch vụ")}
              </Link>
            </li>
            <li>
              <Link to="/dpp" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.support.nfc", "Hướng dẫn quét NFC")}
              </Link>
            </li>
            <li>
              <Link to="/profile?tab=history" className="hover:text-mkhe-primary transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[1px] bg-mkhe-primary group-hover:w-4 transition-all duration-300"></span>
                {t("footer.support.tracking", "Theo dõi đơn hàng")}
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Cột 4: Liên hệ */}
        <motion.div variants={itemVariants}>
          <h3 className="font-bold mb-8 text-mkhe-text dark:text-white uppercase tracking-[0.2em] text-sm flex items-center gap-2">
            <span className="w-4 h-px bg-mkhe-primary"></span>
            {t("footer.contact.title")}
          </h3>
          <ul className="space-y-5 text-sm text-mkhe-text/70 dark:text-gray-400">
            {/* Địa chỉ */}
            <li className="flex items-start gap-4 group">
              <div className="w-8 h-8 rounded-full bg-mkhe-primary/10 flex items-center justify-center shrink-0 group-hover:bg-mkhe-primary transition-colors">
                <MapPin className="w-4 h-4 text-mkhe-primary group-hover:text-white transition-colors" />
              </div>
              <a
                href="https://www.google.com/maps/place/Cần+Thơ,+Việt+Nam"
                target="_blank"
                rel="noopener noreferrer"
                className="group-hover:text-mkhe-primary transition-colors leading-relaxed pt-1"
              >
                {t("footer.contact.address")}
              </a>
            </li>

            {/* Số điện thoại */}
            <li className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-full bg-mkhe-primary/10 flex items-center justify-center shrink-0 group-hover:bg-mkhe-primary transition-colors">
                <Phone className="w-4 h-4 text-mkhe-primary group-hover:text-white transition-colors" />
              </div>
              <a href="tel:0394248611" className="group-hover:text-mkhe-primary transition-colors pt-1">
                039 424 8611
              </a>
            </li>

            {/* Email */}
            <li className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-full bg-mkhe-primary/10 flex items-center justify-center shrink-0 group-hover:bg-mkhe-primary transition-colors">
                <Mail className="w-4 h-4 text-mkhe-primary group-hover:text-white transition-colors" />
              </div>
              <a href="mailto:mkheagency@gmail.com" className="group-hover:text-mkhe-primary transition-colors pt-1">
                mkheagency@gmail.com
              </a>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Dòng bản quyền cuối cùng */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto border-t border-mkhe-border/20 dark:border-gray-800 pt-8 flex flex-col items-center justify-center text-xs text-mkhe-text/50 dark:text-gray-500 gap-4"
      >
        <p className="text-center">
          © {new Date().getFullYear()} MKHE. {t("footer.rights", "Đã đăng ký bản quyền.")}
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
