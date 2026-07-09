import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, ChevronDown, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import InputField from '@/components/ui/InputField';
import TextAreaField from '@/components/ui/TextAreaField';
import { contactService } from '@/features/contact/contact.service';

const ContactPage = () => {
  const { t } = useTranslation(["contact", "common"]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    taxCode: '',
    interest: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
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
    { value: "support", label: t("contact:interests.support") },
    { value: "b2b", label: t("contact:interests.b2b") },
    { value: "vip", label: t("contact:interests.vip") },
    { value: "design", label: t("contact:interests.design") },
    { value: "boardgame", label: t("contact:interests.boardgame") },
    { value: "other", label: t("contact:interests.other") }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'taxCode') {
      const taxCodeValue = value.replace(/[^0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: taxCodeValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for the field being typed in
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = "contact:errors.emptyName";
    
    if (!formData.phone.trim()) {
      errors.phone = "contact:errors.emptyPhone";
    } else if (formData.phone.length < 10) {
      errors.phone = "contact:errors.invalidPhone";
    }
    
    if (!formData.email.trim()) {
      errors.email = "contact:errors.emptyEmail";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "contact:errors.invalidEmail";
    }

    // Validation AC1
    if (formData.interest === "b2b") {
      if (!formData.companyName.trim()) {
        errors.companyName = "contact:errors.emptyCompanyName";
      }
      if (!formData.taxCode.trim()) {
        errors.taxCode = "contact:errors.emptyTaxCode";
      } else if (!/^\d{10}(-\d{3})?$/.test(formData.taxCode.trim())) {
        errors.taxCode = "contact:errors.invalidTaxCode";
      }
    }

    if (!formData.interest) {
      errors.interest = "contact:errors.emptyInterest";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await contactService.createContact(formData);
      toast.success(t("contact:successMessage"));
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        taxCode: '',
        interest: '',
        message: ''
      });
      setFormErrors({});
    } catch (error) {
      toast.error(t("contact:errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">{t("contact:tag")}</span>
            <span className="w-12 h-[1px] bg-mkhe-primary"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-logo italic tracking-wide text-mkhe-primary mb-6 drop-shadow-md">
            {t("contact:title")}
          </h1>
          <p className="text-mkhe-text/80 text-lg max-w-2xl font-light leading-relaxed">
            {t("contact:subtitle")}
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
                {t("contact:infoTitle")}
              </h3>
              
              <ul className="space-y-8 text-mkhe-text/80">
                <li className="flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <MapPin className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-mkhe-text/50 uppercase tracking-widest mb-1 font-semibold">{t("contact:address")}</p>
                    <a
                      href="https://www.google.com/maps/place/Cần+Thơ,+Việt+Nam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group-hover:text-mkhe-primary transition-colors text-base leading-relaxed block"
                    >
                      Cần Thơ, Việt Nam, 94100
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-5 group">
                  <div className="w-10 h-10 rounded-full border border-mkhe-border/50 flex items-center justify-center shrink-0 group-hover:border-mkhe-primary group-hover:bg-mkhe-primary/5 transition-all">
                    <Phone className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs text-mkhe-text/50 uppercase tracking-widest mb-1 font-semibold">{t("contact:phoneTitle")}</p>
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
                    <p className="text-xs text-mkhe-text/50 uppercase tracking-widest mb-1 font-semibold">{t("contact:emailTitle")}</p>
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
                <h3 className="text-3xl lg:text-4xl font-logo italic text-mkhe-primary mb-4 drop-shadow-sm">{t("contact:formTitle")}</h3>
                <div className="w-16 h-[2px] bg-mkhe-primary mb-6"></div>
                <p className="text-mkhe-text/60 text-sm font-light leading-relaxed">
                  {t("contact:formSubtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                      {t("contact:fields.name")} <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("contact:fields.name")}
                      className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.name ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                    />
                    {formErrors.name && (
                      <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-medium">{t(formErrors.name)}</p>
                      </div>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                      {t("contact:fields.phone")} <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("contact:fields.phone")}
                      className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.phone ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                    />
                    {formErrors.phone && (
                      <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-medium">{t(formErrors.phone)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                      {t("contact:fields.email")} <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact:fields.email")}
                      className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.email ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                    />
                    {formErrors.email && (
                      <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-medium">{t(formErrors.email)}</p>
                      </div>
                    )}
                  </div>

                  {/* Company Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                      {t("contact:fields.companyName")}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder={t("contact:fields.companyName")}
                      className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.companyName ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                    />
                    {formErrors.companyName && (
                      <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-medium">{t(formErrors.companyName)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tax Code Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                      {t("contact:fields.taxCode")}
                    </label>
                    <input
                      type="text"
                      name="taxCode"
                      value={formData.taxCode}
                      onChange={handleChange}
                      placeholder={t("contact:fields.taxCode")}
                      className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.taxCode ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                    />
                    {formErrors.taxCode && (
                      <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-medium">{t(formErrors.taxCode)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Dropdown using Modal style */}
                <div ref={dropdownRef} className="relative group z-20 space-y-1 w-full">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("contact:fields.interest")} <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div 
                    className={`w-full p-3.5 bg-transparent text-mkhe-text border ${formErrors.interest ? 'border-red-500' : 'border-mkhe-border/50'} rounded-xl outline-none focus:border-mkhe-primary transition-colors cursor-pointer relative text-sm`}
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      if (formErrors.interest) setFormErrors(prev => ({ ...prev, interest: '' }));
                    }}
                  >
                    <span className={formData.interest ? "text-mkhe-text" : "text-mkhe-text/50"}>
                      {interests.find(i => i.value === formData.interest)?.label || t("contact:fields.interest")}
                    </span>
                    <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mkhe-text/40 pointer-events-none transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {formErrors.interest && (
                    <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-medium">{t(formErrors.interest)}</p>
                    </div>
                  )}
                  
                  {/* Dropdown Options */}
                  <div className={`absolute top-full left-0 w-full mt-1 bg-[var(--color-mkhe-bg)] border border-mkhe-border/50 shadow-2xl overflow-hidden transition-all duration-300 origin-top rounded-xl z-50 ${isDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                    <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1">
                      {interests.map((item) => (
                        <li 
                          key={item.value}
                          className="px-4 py-3 hover:bg-mkhe-primary/20 cursor-pointer text-mkhe-text text-sm transition-colors"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, interest: item.value }));
                            setIsDropdownOpen(false);
                          }}
                        >
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                    {t("contact:fields.message")}
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("contact:fields.message")}
                    className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm custom-scrollbar resize-none ${formErrors.message ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                  />
                  {formErrors.message && (
                    <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-xs font-medium">{t(formErrors.message)}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center gap-4 px-12 py-4 bg-transparent overflow-hidden w-full md:w-auto cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="absolute inset-0 w-full h-full border border-mkhe-primary transition-all duration-500 group-hover:bg-mkhe-primary"></div>
                    <span className="relative z-10 text-mkhe-primary group-hover:text-mkhe-bg font-bold tracking-[0.2em] uppercase text-xs transition-colors duration-500">
                      {isSubmitting ? t("contact:submitting") : t("contact:submit")}
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
