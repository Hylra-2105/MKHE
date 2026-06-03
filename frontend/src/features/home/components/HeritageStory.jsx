import React, { useState } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Fireflies from "./Fireflies";

// Đã import đủ 3 bức ảnh của cha
import langPhongChauImg from "@/assets/images/lang-phong-chau.png";
import langdetkhanranImg from "@/assets/images/lang-det-khan-ran.png";
import langnghemaytreImg from "@/assets/images/lang-nghe-may-tre.png";

const HeritageStory = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Đã gài đúng ảnh cho từng Tỉnh
  const journeyData = [
    {
      id: "an-giang",
      province: "An Giang",
      dna: "Đại diện Mã gen Chăm & Khmer",
      image: langPhongChauImg,
      villages: [
        {
          name: "Làng dệt thổ cẩm Chăm Châu Phong",
          desc: "Hợp tác cùng HTX Châu Giang (Nghệ nhân Mohamad) cung cấp vải dệt tay nhuộm tự nhiên.",
        },
        {
          name: "Làng gốm Khmer Phnôm Pi",
          desc: "Truyền nhân đời thứ 3 Néang Nhây & Néang Vu chế tác gốm mộc nung lộ thiên.",
        },
      ],
    },
    {
      id: "dong-thap",
      province: "Đồng Tháp",
      dna: "Đại diện Mã gen Kinh",
      image: langdetkhanranImg,
      villages: [
        {
          name: "Làng dệt khăn rằn Long Tả / Long Khánh",
          desc: "Đồng hành cùng nghệ nhân Nguyễn Thị Kim Chiều giữ gìn nguồn khăn rằn rực rỡ.",
        },
        {
          name: "Thương hiệu Hanhsilk",
          desc: "Cùng bà Lương Thanh Hạnh phát triển kỹ thuật rút sợi tơ sen sinh thái cao cấp.",
        },
      ],
    },
    {
      id: "can-tho",
      province: "Cần Thơ",
      dna: "Trung tâm Chế tác & Lan tỏa",
      image: langnghemaytreImg,
      villages: [
        {
          name: "Cô Ba Khăn Rằn (Offline Hub)",
          desc: "Trạm trung chuyển huyết mạch, xưởng may túi xách, nón từ vải di sản.",
        },
        {
          name: "Tre đan mỹ nghệ Miền Tây",
          desc: "Anh Nguyên cung cấp khay, hộp mây tre đan sinh thái hoàn thiện hệ sinh thái bao bì.",
        },
      ],
    },
  ];

  return (
    <section className="pt-8 mt-6 pb-24 md:pt-16 md:pb-32 bg-mkhe-bg overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-mkhe-primary/5 blur-[150px] pointer-events-none" />

      <Fireflies />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* =======================================
            1. TIÊU ĐỀ SECTION
        ======================================== */}
        <div className="text-center mb-8 relative z-20">
          <div className="inline-flex items-center gap-3 text-mkhe-primary text-xs md:text-sm font-bold uppercase tracking-[0.2em] bg-mkhe-primary/5 px-6 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            Hành trình kết nối di sản
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* =======================================
            2. NỬA TRÊN: MÀN HÌNH ĐIỆN ẢNH (CINEMATIC VIEW)
        ======================================== */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] lg:aspect-[21/10] group mb-12">
          {/* KHU VỰC THẢ ĐOM ĐÓM */}
          <div
            id="fireflies-container"
            className="absolute inset-0 z-20 pointer-events-none"
          ></div>

          {/* Chuyển cảnh ảnh mượt mà */}
          <AnimatePresence mode="wait">
            <motion.img
              key={activeTab}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              src={journeyData[activeTab].image}
              alt={journeyData[activeTab].province}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Gradient tối dần từ dưới lên để làm nổi bật hệ thống Tab bên dưới */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* =======================================
            3. NỬA DƯỚI: HỆ THỐNG TAB & THÔNG TIN LÀNG NGHỀ
        ======================================== */}
        <div className="relative z-20">
          {/* THANH ĐIỀU HƯỚNG TỈNH THÀNH (TABS) */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-12 border-b border-mkhe-primary/20 pb-6 mb-12">
            {journeyData.map((tab, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`relative flex items-center cursor-pointer gap-3 px-4 py-2 transition-all duration-300 ${
                    isActive
                      ? "text-mkhe-primary"
                      : "text-mkhe-text/60 hover:text-mkhe-text"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-0 hidden md:block"}`}
                  />
                  <div className="text-left">
                    <h3 className={`font-logo text-xl md:text-2xl font-bold`}>
                      {tab.province}
                    </h3>
                    <p className="text-xs md:text-sm font-medium hidden md:block">
                      {tab.dna}
                    </p>
                  </div>
                  {/* Đường line chạy chạy báo hiệu đang active */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-[25px] left-0 right-0 h-1 bg-mkhe-primary rounded-t-full shadow-[0_-2px_10px_rgba(212,163,115,0.5)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* NỘI DUNG CHI TIẾT CÁC LÀNG NGHỀ CỦA TỈNH ĐANG CHỌN */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
            >
              {journeyData[activeTab].villages.map((village, vIdx) => (
                <div
                  key={vIdx}
                  className="bg-mkhe-primary/5 rounded-2xl p-6 md:p-8 border border-mkhe-primary/10 hover:border-mkhe-primary/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-mkhe-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <div className="w-3 h-3 bg-mkhe-primary rounded-full shadow-[0_0_10px_rgba(212,163,115,0.8)]" />
                  </div>
                  <h4 className="font-bold text-mkhe-text text-lg mb-3">
                    {village.name}
                  </h4>
                  <p className="text-mkhe-text/70 text-base leading-relaxed">
                    {village.desc}
                  </p>
                </div>
              ))}

              {/* Nút Call to Action khám phá tỉnh */}
              <div className="flex items-center justify-center lg:justify-start lg:col-span-1 p-6 md:p-8">
                <button
                  id="explore-btn"
                  className="group relative flex flex-col items-center lg:items-start text-mkhe-primary hover:text-[#C38D64] transition-colors"
                >
                  <span className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">
                    Khám phá chi tiết
                  </span>
                  <span className="flex items-center gap-3 text-2xl font-logo font-bold">
                    {journeyData[activeTab].province}
                    <div className="w-10 h-10 rounded-full bg-mkhe-primary text-white flex items-center justify-center transform group-hover:translate-x-2 transition-transform shadow-lg shadow-mkhe-primary/30">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeritageStory;
