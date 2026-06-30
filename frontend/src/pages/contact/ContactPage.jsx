import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-mkhe-bg text-mkhe-text pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-mkhe-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-40 left-20 w-96 h-96 bg-mkhe-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-mkhe-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16 relative pt-10">
          <span className="text-mkhe-primary tracking-[0.4em] text-sm uppercase font-bold mb-4 drop-shadow-[0_0_8px_rgba(212,163,115,0.8)] block">
            Mekong Heritage
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-mkhe-text">
            Kết nối & Hợp tác
          </h1>
        </div>

        {/* 2 COLUMN LAYOUT */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* LEFT: CONTACT INFO (From Footer) */}
          <div className="lg:w-2/5 flex flex-col space-y-12 mt-4">
            
            <div>
              <h3 className="text-2xl font-light text-mkhe-primary mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-mkhe-primary"></span>
                {t("footer.contact.title", "Thông tin Liên hệ")}
              </h3>
              
              <ul className="space-y-10 text-mkhe-text/80">
                {/* Địa chỉ */}
                <li className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <MapPin className="w-5 h-5 text-mkhe-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-mkhe-text/50 uppercase tracking-widest mb-1">Địa chỉ</p>
                    <a
                      href="https://www.google.com/maps/place/Cần+Thơ,+Việt+Nam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group-hover:text-mkhe-primary transition-colors text-lg leading-relaxed block"
                    >
                      {t("footer.contact.address", "Cần Thơ, Việt Nam, 94100")}
                    </a>
                  </div>
                </li>

                {/* Số điện thoại */}
                <li className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <Phone className="w-5 h-5 text-mkhe-primary" />
                  </div>
                  <div className="pt-1 flex flex-col justify-center">
                    <p className="text-sm text-mkhe-text/50 uppercase tracking-widest mb-1">Điện thoại</p>
                    <p className="group-hover:text-mkhe-primary transition-colors text-lg block">
                      039 424 8611
                    </p>
                  </div>
                </li>

                {/* Email */}
                <li className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <Mail className="w-5 h-5 text-mkhe-primary" />
                  </div>
                  <div className="pt-1 flex flex-col justify-center">
                    <p className="text-sm text-mkhe-text/50 uppercase tracking-widest mb-1">Email</p>
                    <p className="group-hover:text-mkhe-primary transition-colors text-lg block">
                      mkheagency@gmail.com
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:w-3/5">
            <div className="bg-mkhe-bg/50 backdrop-blur-xl border border-mkhe-border/30 rounded-2xl p-8 lg:p-12 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-mkhe-primary/50 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-mkhe-primary/50 rounded-br-2xl"></div>
              
              <h3 className="text-3xl font-light text-mkhe-text mb-2">Gửi Yêu Cầu Cho Chúng Tôi</h3>
              <p className="text-mkhe-text/60 mb-10 text-sm">
                Bất kể bạn là khách hàng cá nhân hay doanh nghiệp đang tìm kiếm cơ hội hợp tác, đội ngũ MKHE luôn sẵn sàng hỗ trợ và sẽ phản hồi trong vòng 24 giờ.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Họ và Tên *"
                      className="w-full bg-transparent border-b border-mkhe-border/50 py-3 text-mkhe-text placeholder-mkhe-text/30 focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.2)] transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Số điện thoại *"
                      className="w-full bg-transparent border-b border-mkhe-border/50 py-3 text-mkhe-text placeholder-mkhe-text/30 focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.2)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email *"
                      className="w-full bg-transparent border-b border-mkhe-border/50 py-3 text-mkhe-text placeholder-mkhe-text/30 focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.2)] transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Công ty / Tổ chức (Nếu có)"
                      className="w-full bg-transparent border-b border-mkhe-border/50 py-3 text-mkhe-text placeholder-mkhe-text/30 focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.2)] transition-all"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div 
                    className="w-full bg-transparent border-b border-mkhe-border/50 py-3 text-mkhe-text focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.2)] transition-all cursor-pointer relative"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className={formData.interest ? "text-mkhe-text" : "text-mkhe-text/30"}>
                      {formData.interest || "-- Chọn Nhu cầu quan tâm --"}
                    </span>
                    <ChevronDown className={`absolute right-0 top-3 w-5 h-5 text-mkhe-text/40 pointer-events-none transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-mkhe-bg/95 backdrop-blur-md border border-mkhe-border/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <ul className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                        {interests.map((item, idx) => (
                          <li 
                            key={idx}
                            className="px-5 py-3 hover:bg-mkhe-primary/20 cursor-pointer text-mkhe-text text-sm transition-colors"
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
                  )}
                </div>

                <div className="relative group">
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nội dung chi tiết *"
                    className="w-full bg-transparent border-b border-mkhe-border/50 py-3 text-mkhe-text placeholder-mkhe-text/30 focus:outline-none focus:border-mkhe-primary focus:shadow-[0_2px_10px_rgba(212,163,115,0.2)] transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-10 py-4 border border-mkhe-primary text-mkhe-primary font-bold uppercase tracking-widest text-sm rounded hover:bg-mkhe-primary hover:text-mkhe-bg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <span className="relative z-10">{isSubmitting ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}</span>
                  {!isSubmitting && <Send className="w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform" />}
                  <div className="absolute inset-0 bg-mkhe-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
