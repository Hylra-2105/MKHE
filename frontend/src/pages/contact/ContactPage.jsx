import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    interest: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const interests = [
    "Hỗ trợ đơn hàng / CSKH (Khách cá nhân)",
    "Tìm hiểu thông tin sản phẩm",
    "Quà tặng doanh nghiệp VIP (Sổ tay, hộp namecard thổ cẩm)",
    "Tư vấn kiến trúc nội thất bản địa cho Resort/Hotel",
    "Thiết kế đồng phục lụa Khmer/Thổ cẩm",
    "Mua sỉ phụ kiện thời trang",
    "Khác"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Chỉ cho phép nhập số (và dấu + ở đầu nếu cần)
      const numericValue = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Cảm ơn bạn! Yêu cầu đã được gửi đến chúng tôi.");
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        interest: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-mkhe-bg text-mkhe-text pt-24 pb-32 relative overflow-hidden font-sans selection:bg-mkhe-primary selection:text-white">
      
      {/* CREATIVE BACKGROUND ELEMENTS */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-mkhe-primary/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#8B5A2B]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      


      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20 relative pt-10 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-mkhe-primary"></span>
            <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">Mekong Culture</span>
            <span className="w-12 h-[1px] bg-mkhe-primary"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-logo italic tracking-wide text-mkhe-primary mb-6 drop-shadow-md">
            Kết nối & Hợp tác
          </h1>
          <p className="text-mkhe-text/80 text-lg max-w-2xl font-light leading-relaxed">
            Nơi những ý tưởng thăng hoa và những giá trị di sản được tiếp nối. Hãy cùng MKHE kiến tạo nên những không gian và tác phẩm mang đậm dấu ấn bản địa.
          </p>
        </motion.div>

        {/* 2 COLUMN LAYOUT WITH IMAGES & GLASSMORPHISM */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: VISUALS & CONTACT INFO */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 flex flex-col space-y-16"
          >


            {/* Contact Details (From Footer) */}
            <div className="bg-mkhe-bg/80 backdrop-blur-sm p-8 border border-mkhe-border/30 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-mkhe-primary/50"></div>
              
              <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-8 font-bold">
                {t("footer.contact.title", "Thông tin Liên hệ")}
              </h3>
              
              <ul className="space-y-8 text-mkhe-text/80">
                <li className="flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <MapPin className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-mkhe-text/50 uppercase tracking-widest mb-1 font-semibold">Địa chỉ</p>
                    <a
                      href="https://www.google.com/maps/place/Cần+Thơ,+Việt+Nam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group-hover:text-mkhe-primary transition-colors text-base leading-relaxed block"
                    >
                      {t("footer.contact.address", "Cần Thơ, Việt Nam, 94100")}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <Phone className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-mkhe-text/50 uppercase tracking-widest mb-1 font-semibold">Điện thoại</p>
                    <p className="group-hover:text-mkhe-primary transition-colors text-base block">
                      039 424 8611
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <Mail className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-mkhe-text/50 uppercase tracking-widest mb-1 font-semibold">Email</p>
                    <p className="group-hover:text-mkhe-primary transition-colors text-base block">
                      mkheagency@gmail.com
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* RIGHT: PREMIUM CONTACT FORM */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            className="lg:col-span-7 relative"
          >
            {/* Spinning decorative element */}
            <div className="absolute -top-12 -right-12 w-32 h-32 border-[1px] border-mkhe-primary/20 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center pointer-events-none hidden md:flex z-0">
              <div className="w-2 h-2 bg-mkhe-primary rounded-full absolute -top-1 shadow-[0_0_10px_#B8860B]"></div>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-sm p-8 lg:p-14 shadow-2xl relative z-10">
              
              <div className="mb-12">
                <h3 className="text-3xl lg:text-4xl font-logo italic text-mkhe-primary mb-4 drop-shadow-sm">Gửi Yêu Cầu Cho Chúng Tôi</h3>
                <div className="w-16 h-[2px] bg-mkhe-primary mb-6"></div>
                <p className="text-mkhe-text/60 text-sm font-light leading-relaxed">
                  Bất kể bạn là khách hàng cá nhân hay doanh nghiệp đang tìm kiếm cơ hội hợp tác, đội ngũ chuyên gia của chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder=""
                      className="peer w-full bg-transparent border-b border-mkhe-border/80 py-3 text-mkhe-text focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.1)] transition-all font-light"
                    />
                    {!formData.name && (
                      <div className="absolute left-0 top-3 pointer-events-none text-mkhe-text/30 font-light transition-all peer-focus:opacity-0">
                        Họ và Tên <span className="text-red-500">*</span>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder=""
                      className="peer w-full bg-transparent border-b border-mkhe-border/80 py-3 text-mkhe-text focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.1)] transition-all font-light"
                    />
                    {!formData.phone && (
                      <div className="absolute left-0 top-3 pointer-events-none text-mkhe-text/30 font-light transition-all peer-focus:opacity-0">
                        Số điện thoại <span className="text-red-500">*</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      className="peer w-full bg-transparent border-b border-mkhe-border/80 py-3 text-mkhe-text focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.1)] transition-all font-light"
                    />
                    {!formData.email && (
                      <div className="absolute left-0 top-3 pointer-events-none text-mkhe-text/30 font-light transition-all peer-focus:opacity-0">
                        Email <span className="text-red-500">*</span>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Công ty / Tổ chức (Nếu có)"
                      className="w-full bg-transparent border-b border-mkhe-border/80 py-3 text-mkhe-text placeholder-mkhe-text/30 focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.1)] transition-all font-light"
                    />
                  </div>
                </div>

                {/* Custom Dropdown */}
                <div ref={dropdownRef} className="relative group z-20">
                  <div 
                    className="w-full bg-transparent border-b border-mkhe-border/80 py-3 text-mkhe-text focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.1)] transition-all cursor-pointer relative font-light"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className={formData.interest ? "text-mkhe-text" : "text-mkhe-text/40"}>
                      {formData.interest || "-- Chọn Nhu cầu quan tâm --"}
                    </span>
                    <ChevronDown className={`absolute right-0 top-3 w-4 h-4 text-mkhe-text/40 pointer-events-none transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Dropdown Options */}
                  <div className={`absolute top-full left-0 w-full mt-2 bg-mkhe-bg/95 backdrop-blur-xl border border-mkhe-border/30 shadow-2xl overflow-hidden transition-all duration-300 origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                    <ul className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                      {interests.map((item, idx) => (
                        <li 
                          key={idx}
                          className="px-6 py-4 hover:bg-mkhe-primary/10 cursor-pointer text-mkhe-text text-sm transition-colors font-light border-b border-mkhe-border/10 last:border-0"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, interest: item }));
                            setIsDropdownOpen(false);
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder=""
                    className="peer w-full bg-transparent border-b border-mkhe-border/80 py-3 text-mkhe-text focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.1)] transition-all resize-none font-light"
                  ></textarea>
                  {!formData.message && (
                    <div className="absolute left-0 top-3 pointer-events-none text-mkhe-text/30 font-light transition-all peer-focus:opacity-0">
                      Nội dung chi tiết <span className="text-red-500">*</span>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center gap-4 px-12 py-5 bg-transparent overflow-hidden w-full md:w-auto cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="absolute inset-0 w-full h-full border border-mkhe-primary transition-all duration-500 group-hover:bg-mkhe-primary"></div>
                    <span className="relative z-10 text-mkhe-primary group-hover:text-mkhe-bg font-bold tracking-[0.2em] uppercase text-xs transition-colors duration-500">
                      {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                    </span>
                    {!isSubmitting && (
                      <Send className="w-4 h-4 relative z-10 text-mkhe-primary group-hover:text-mkhe-bg transform group-hover:translate-x-2 transition-all duration-500" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
