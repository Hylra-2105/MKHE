import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// Tự import ảnh
import langPhongChauImg from "@/assets/images/lang-phong-chau.png";
import langdetkhanranImg from "@/assets/images/lang-det-khan-ran.png";
import langnghemaytreImg from "@/assets/images/lang-nghe-may-tre.png";

const HeritageStory = () => {
  const { t } = useTranslation("home");
  const [activeTab, setActiveTab] = useState(0);

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
    <section className="pt-20 pb-48 bg-gradient-to-b from-mkhe-bg to-mkhe-primary/10 text-mkhe-text relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, amount: 0.3 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-4 mb-8">
              <span className="w-16 h-[1px] bg-mkhe-primary"></span>
              <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">The Journey</span>
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] text-mkhe-text font-bold leading-[1.1] mb-8 relative">
              Hành trình <br/>
              <span className="text-mkhe-primary font-logo italic font-normal text-6xl md:text-8xl lg:text-[7.5rem] leading-none block mt-2 ml-12">Di sản</span>
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, amount: 0.3 }} 
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:w-1/2 flex lg:justify-end pb-8"
          >
            <p className="text-mkhe-text/70 text-lg max-w-md leading-relaxed border-l-[1px] border-mkhe-primary/40 pl-8 ml-4 lg:ml-0 font-light">
              Mekong không chỉ là dòng sông, mà là dòng chảy của những di sản đa văn hóa. Chúng tôi đi dọc dòng Mekong để đánh thức và kết nối những giá trị đang dần lãng quên.
            </p>
          </motion.div>
        </div>

        {/* DESKTOP TIMELINE (Hidden on mobile) */}
        <div className="hidden md:block relative w-full h-[400px] mb-10">
          {/* Wavy SVG Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
          >
            <path 
              d="M 0,200 C 100,200 100,300 200,300 S 500,100 600,100 S 900,300 1000,300 S 1100,200 1200,200" 
              className="stroke-mkhe-primary/50 stroke-[2] fill-transparent" 
            />
          </svg>

          {/* Timeline Nodes */}
          {journeyData.map((tab, index) => {
            const isActive = activeTab === index;
            // Precise positioning to match the bezier curve peaks/valleys
            const leftPos = index === 0 ? "16.666%" : index === 1 ? "50%" : "83.333%";
            const topPos = index === 0 ? "75%" : index === 1 ? "25%" : "75%";
            
            return (
              <div 
                key={tab.id}
                className="absolute flex flex-col items-center"
                style={{ left: leftPos, top: topPos, transform: 'translate(-50%, -50%)' }}
              >
                <button 
                  onClick={() => setActiveTab(index)}
                  className={`cursor-pointer relative w-40 h-40 rounded-full border-4 overflow-hidden transition-all duration-500 group ${isActive ? 'border-mkhe-primary scale-110 shadow-[0_0_20px_rgba(212,163,115,0.4)] z-10' : 'border-mkhe-border hover:border-mkhe-primary/50 opacity-70 hover:opacity-100 grayscale hover:grayscale-0 z-0'}`}
                >
                  <img src={tab.image} alt={tab.province} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-transparent' : 'bg-black/40 group-hover:bg-transparent'}`}></div>
                  
                  {/* Glowing dot on the timeline path */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-500 ${isActive ? 'bg-mkhe-primary shadow-[0_0_10px_#D4A373]' : 'bg-mkhe-primary/50 opacity-0 group-hover:opacity-100'}`}></div>
                </button>
                
                {/* Node Label */}
                <div className="absolute text-center w-64 transition-all duration-500 top-[120%]">
                  <h4 className={`text-2xl font-bold tracking-wide ${isActive ? 'text-mkhe-primary' : 'text-mkhe-text'}`}>{tab.province}</h4>
                  <p className="text-xs text-mkhe-text/50 uppercase tracking-wider mt-1">{tab.dna}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE TIMELINE (Hidden on desktop) */}
        <div className="md:hidden flex flex-col gap-12 mt-10 relative">
          <div className="absolute left-[39px] top-4 bottom-4 w-[2px] bg-mkhe-primary/20"></div>
          {journeyData.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <div key={tab.id} className="relative flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab(index)}
                  className={`cursor-pointer relative z-10 w-20 h-20 rounded-full flex-shrink-0 border-2 overflow-hidden transition-all duration-300 ${isActive ? 'border-mkhe-primary shadow-[0_0_15px_rgba(212,163,115,0.4)] scale-110' : 'border-mkhe-border grayscale opacity-70'}`}
                >
                  <img src={tab.image} alt={tab.province} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-transparent' : 'bg-black/40'}`}></div>
                </button>
                <div>
                  <h4 className={`text-xl font-bold ${isActive ? 'text-mkhe-primary' : 'text-mkhe-text'}`}>{tab.province}</h4>
                  <p className="text-xs text-mkhe-text/50 uppercase tracking-wider mt-1">{tab.dna}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* DETAILS BLOCK (Below timeline) */}
        <div className="mt-16 md:mt-24 max-w-4xl mx-auto border-t border-mkhe-primary/20 pt-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-mkhe-bg border border-mkhe-primary/50 rotate-45"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center">
                <h4 className="text-2xl md:text-3xl font-bold text-mkhe-text mb-2">
                  Khám phá <span className="text-mkhe-primary font-logo italic font-normal text-4xl md:text-5xl ml-2">{journeyData[activeTab].province}</span>
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {journeyData[activeTab].villages.map((village, vIdx) => (
                  <div key={vIdx} className="bg-mkhe-bg/40 p-6 border border-mkhe-border/30 hover:border-mkhe-primary/50 transition-colors rounded-sm">
                    <h5 className="font-bold text-lg mb-3 text-mkhe-text flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-mkhe-primary shrink-0"></span>
                      {village.name}
                    </h5>
                    <p className="text-mkhe-text/60 text-sm leading-relaxed font-light">
                      {village.desc}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 flex justify-center">
                <button className="cursor-pointer group flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-mkhe-text hover:text-mkhe-primary transition-colors border border-mkhe-border px-8 py-4 hover:border-mkhe-primary rounded-sm">
                  Tới trạm di sản
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bờ cong sóng (Wave Divider) nghệ thuật */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] z-20 pointer-events-none translate-y-1/2">
        <svg
          className="relative block w-full h-[150px] md:h-[300px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 240"
          preserveAspectRatio="none"
        >
          {/* Lớp nền chính (Base) che đường nối */}
          <path 
            d="M0,100 C300,120 600,60 900,110 C1050,115 1150,80 1200,100 V240 H0 Z" 
            className="fill-mkhe-bg"
          ></path>

          {/* Dải lụa mỏng 1 */}
          <path 
            d="M0,180 C200,240 350,40 600,60 C850,80 1000,220 1200,160" 
            className="fill-transparent stroke-mkhe-primary/30 stroke-[2]"
          ></path>
          
          {/* Dải lụa mỏng 2 */}
          <path 
            d="M0,80 C250,20 400,160 700,140 C950,120 1050,40 1200,100" 
            className="fill-transparent stroke-mkhe-primary/40 stroke-[1]"
          ></path>

          {/* Dải lụa mỏng 3 (mảng fill lơ lửng, cong đều) */}
          <path 
            d="M0,120 C300,60 500,200 800,160 C1000,130 1100,70 1200,140 C1000,180 800,220 500,140 C300,80 150,140 0,150 Z" 
            className="fill-mkhe-primary/5 stroke-none"
          ></path>

          {/* Dải sáng phát quang (Đường line chính) */}
          <path 
            d="M0,140 C250,220 450,20 750,80 C1000,140 1100,220 1200,180" 
            className="fill-transparent stroke-mkhe-primary stroke-[3]"
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(212,163,115,0.8))' }}
          ></path>
          
          {/* Một dải sáng lướt qua */}
          <path 
            d="M0,60 C300,20 500,180 850,200 C1050,220 1150,100 1200,60" 
            className="fill-transparent stroke-mkhe-primary/80 stroke-[1]"
            style={{ filter: 'drop-shadow(0px 0px 4px rgba(212,163,115,0.5))' }}
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeritageStory;
