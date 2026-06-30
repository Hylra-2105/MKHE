import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-mkhe-bg text-mkhe-text font-sans ">
      
      {/* CREATIVE HERO SECTION */}
      <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-mkhe-bg">
        <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-mkhe-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#8B5A2B]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Large Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none opacity-5 overflow-hidden -left-[5vw]">
          <span className="text-[35vw] font-logo font-bold text-mkhe-text whitespace-nowrap">MKHE</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-16 py-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: "easeOut" }}
            className="md:w-1/2 relative"
          >
            <div className="inline-flex items-center gap-4 mb-10">
              <span className="w-16 h-[1px] bg-mkhe-primary"></span>
              <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">Mekong Culture</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] text-mkhe-text font-bold leading-[1.1] mb-8 relative z-10">
              Giao lộ của <br/>
              <span className="text-mkhe-primary font-logo italic font-normal text-6xl md:text-8xl lg:text-[7.5rem] leading-none block mt-2 ml-12">Di sản</span>
            </h1>
            <p className="text-mkhe-text/70 text-lg max-w-md leading-relaxed border-l-[1px] border-mkhe-primary/40 pl-8 ml-4 font-light">
              Nơi những tinh hoa thủ công truyền thống được đánh thức và tái sinh qua lăng kính của nghệ thuật đương đại và công nghệ.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="md:w-1/2 relative flex justify-center md:justify-end"
          >
            <div className="relative w-full max-w-[320px] lg:max-w-[400px] aspect-[3/4] rounded-t-[200px] rounded-b-[20px] overflow-hidden p-3 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 dark:border-white/5">
              <div className="w-full h-full rounded-t-[200px] rounded-b-[10px] overflow-hidden bg-mkhe-bg relative group">
                <img 
                  src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972&auto=format&fit=crop" 
                  alt="Mekong Heritage" 
                  className="w-full h-full object-cover transition-all duration-[1.5s] ease-in-out group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply"></div>
              </div>
            </div>
            
            <div className="absolute top-1/4 -left-12 lg:-left-24 w-40 h-40 border-[1px] border-mkhe-primary/30 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center pointer-events-none hidden md:flex">
              <div className="w-3 h-3 bg-mkhe-primary rounded-full absolute -top-1.5 shadow-[0_0_15px_#B8860B]"></div>
            </div>
            
          </motion.div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        
        {/* SECTION 1: VỀ CHÚNG TÔI - EDITORIAL STYLE */}
        <section className="py-32 relative">
          <div className="absolute right-0 top-20 text-[15vw] font-logo font-bold text-mkhe-text/5 leading-none select-none pointer-events-none italic">
            Story
          </div>
          
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="lg:col-span-5 lg:col-start-2 pt-10"
            >
              <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-6 font-bold">01 — Về chúng tôi</h3>
              <p className="text-xl md:text-2xl text-mkhe-text/90 leading-relaxed font-light mb-8 relative">
                <span className="absolute -left-6 md:-left-10 -top-4 text-6xl text-mkhe-primary/30 font-logo italic">"</span>
                Mekong Culture không chỉ là một thương hiệu, mà là một hành trình khơi dậy và trân trọng <span className="text-mkhe-primary font-semibold">mã gen di sản</span> của vùng đất Tây Nam Bộ.
              </p>
              <p className="text-base text-mkhe-text/70 leading-relaxed font-light text-justify">
                Chúng tôi tự hào mang đến mô hình <strong>"Hệ sinh thái Đôi" (Dual-Project Ecosystem)</strong> độc bản. Bằng việc chắt lọc tinh hoa từ ba cộng đồng dân tộc Kinh – Chăm – Khmer, Mekong Culture kiến tạo nên những không gian nội thất nghệ thuật và các bộ sưu tập mang tính ứng dụng cao, giúp nối dài mạch sống của di sản trong dòng chảy hiện đại.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="lg:col-span-6 lg:col-start-7 relative mt-10 lg:mt-0"
            >
              <div className="relative w-full aspect-[4/5] bg-mkhe-input overflow-hidden rounded-sm">
                <img 
                  src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop" 
                  alt="Mekong Artisan" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]"
                />
                <div className="absolute top-6 left-6 w-16 h-[1px] bg-white/70"></div>
                <div className="absolute top-6 left-6 w-[1px] h-16 bg-white/70"></div>
                <div className="absolute bottom-6 right-6 w-16 h-[1px] bg-white/70"></div>
                <div className="absolute bottom-6 right-6 w-[1px] h-16 bg-white/70"></div>
              </div>
              
              {/* Overlapping text box */}
              <div className="absolute -bottom-10 -left-10 lg:-left-20 bg-mkhe-bg p-8 shadow-2xl border-l-[3px] border-mkhe-primary max-w-[280px]">
                <p className="font-logo italic text-2xl text-mkhe-text">Bảo tồn và <br/><span className="text-mkhe-primary">Thương mại hóa</span></p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: TẦM NHÌN - SỨ MỆNH - GIÁ TRỊ CỐT LÕI (STAGGERED) */}
        <section className="py-32 bg-mkhe-primary/5 dark:bg-mkhe-primary/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col gap-24">
              
              {/* Item 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center relative"
              >
                <div className="text-[120px] md:text-[180px] font-logo italic leading-none text-mkhe-primary/20 absolute -left-4 md:left-0 -top-10 md:-top-20 select-none z-0">01</div>
                <div className="md:w-1/3 relative z-10 pl-4 md:pl-24">
                  <h3 className="text-4xl md:text-5xl text-mkhe-text font-bold tracking-tight">Tầm <span className="font-logo italic text-mkhe-primary font-normal">nhìn</span></h3>
                </div>
                <div className="md:w-2/3 relative z-10 pl-4 md:pl-0">
                  <p className="text-xl md:text-2xl text-mkhe-text/80 font-light leading-relaxed">
                    Trở thành điểm chạm Phygital tiên phong, nơi công nghệ đánh thức và kết nối thế hệ trẻ với dòng chảy di sản văn hóa Mekong.
                  </p>
                </div>
              </motion.div>

              {/* Item 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center relative"
              >
                <div className="text-[120px] md:text-[180px] font-logo italic leading-none text-mkhe-primary/20 absolute -left-4 md:left-0 -top-10 md:-top-20 select-none z-0">02</div>
                <div className="md:w-1/3 relative z-10 pl-4 md:pl-24">
                  <h3 className="text-4xl md:text-5xl text-mkhe-text font-bold tracking-tight">Sứ <span className="font-logo italic text-mkhe-primary font-normal">mệnh</span></h3>
                </div>
                <div className="md:w-2/3 relative z-10 pl-4 md:pl-0">
                  <p className="text-xl md:text-2xl text-mkhe-text/80 font-light leading-relaxed">
                    Số hóa câu chuyện làng nghề, tôn vinh nghệ nhân bản địa và đưa các tác phẩm thủ công độc bản vươn xa khỏi biên giới địa lý.
                  </p>
                </div>
              </motion.div>

              {/* Item 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center relative"
              >
                <div className="text-[120px] md:text-[180px] font-logo italic leading-none text-mkhe-primary/20 absolute -left-4 md:left-0 -top-10 md:-top-20 select-none z-0">03</div>
                <div className="md:w-1/3 relative z-10 pl-4 md:pl-24">
                  <h3 className="text-4xl md:text-5xl text-mkhe-text font-bold tracking-tight">Giá trị <span className="font-logo italic text-mkhe-primary font-normal">cốt lõi</span></h3>
                </div>
                <div className="md:w-2/3 relative z-10 pl-4 md:pl-0">
                  <ul className="text-xl md:text-2xl text-mkhe-text/80 font-light leading-relaxed space-y-3">
                    <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-mkhe-primary"></span> Độc bản trong Chế tác</li>
                    <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-mkhe-primary"></span> Tiên phong trong Công nghệ</li>
                    <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-mkhe-primary"></span> Bền vững với Di sản</li>
                  </ul>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 3: TÔN VINH LÀNG NGHỀ - ABSTRACT LIST */}
        <section className="py-32 relative overflow-hidden">
          {/* Vertical elegant line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-mkhe-primary/30 to-transparent hidden md:block"></div>
          
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-24">
              <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-4 font-bold">02 — Báu vật sống</h3>
              <h2 className="text-5xl md:text-6xl text-mkhe-text font-logo italic">Tôn vinh làng nghề</h2>
            </div>
            
            <div className="space-y-20 md:space-y-32">
              {[
                { name: 'Lụa Khmer Văn Giáo', desc: 'Sự mềm mại của từng sợi tơ Ikat truyền thống nhuộm màu cỏ cây.' },
                { name: 'Gốm mộc Phnôm Pi', desc: 'Nét mộc mạc của nghệ thuật nặn gốm bằng tay không cần bàn xoay.' },
                { name: 'Gốm Bàu Trúc', desc: 'Linh hồn của đất và lửa qua kỹ thuật nung lộ thiên độc đáo xứ Chăm.' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                  className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-0`}
                >
                  <div className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16'} text-center md:text-left`}>
                    <div>
                      <h4 className={`text-2xl md:text-3xl font-bold text-mkhe-text mb-4 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>{item.name}</h4>
                      <p className={`text-mkhe-text/70 italic text-lg font-light ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>"{item.desc}"</p>
                    </div>
                  </div>
                  
                  {/* Center Dot */}
                  <div className="hidden md:flex w-16 h-16 rounded-full bg-mkhe-bg border-[1px] border-mkhe-primary/40 items-center justify-center absolute left-1/2 -translate-x-1/2 z-10">
                    <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>
                  </div>

                  <div className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:pl-16' : 'md:pr-16 md:justify-end'}`}>
                    <div className="text-[80px] font-logo italic font-bold text-mkhe-text/20 leading-none select-none">
                      0{idx + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: PHYGITAL - OVERLAPPING ABSTRACT */}
        <section className="py-32 bg-mkhe-input/30 relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-6 font-bold">03 — Tiên phong</h3>
              <h2 className="text-5xl md:text-6xl text-mkhe-text font-bold leading-tight mb-8">
                Điểm chạm <br/>
                <span className="font-logo italic text-mkhe-primary font-normal text-6xl md:text-7xl">Phygital</span>
              </h2>
              
              <div className="bg-mkhe-input/50 backdrop-blur-sm border-[1px] border-mkhe-primary/20 p-8 md:p-10 rounded-br-[50px]">
                <p className="text-xl text-mkhe-text/90 font-light leading-relaxed mb-6">
                  Giới thiệu <strong className="font-bold text-mkhe-primary">Hộ chiếu số DPP (Digital Product Passport)</strong>. Mekong Culture tự hào là đơn vị tiên phong ứng dụng mô hình Phygital vào các sản phẩm thủ công.
                </p>
                <p className="text-base text-mkhe-text/70 font-light italic">
                  Khẳng định mỗi sản phẩm MKHE bán ra không chỉ là vật chất, mà là một kho lưu trữ kỹ thuật số minh bạch về nguồn gốc và câu chuyện độc bản.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative h-[500px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-mkhe-primary/5 dark:bg-mkhe-primary/10 rounded-full blur-[80px]"></div>
              
              <div className="relative w-64 h-[400px] bg-mkhe-bg shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10 rotate-[-5deg] hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1620325867502-221ddb5faa5f?q=80&w=2058&auto=format&fit=crop" 
                  alt="NFC Scan" 
                  className="w-full h-full object-cover grayscale opacity-90"
                />
                <div className="absolute inset-0 bg-mkhe-primary/20 mix-blend-color"></div>
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="absolute w-24 h-24 border border-white/40 rounded-full animate-ping"></div>
                  <div className="absolute w-16 h-16 border border-white/60 rounded-full animate-pulse"></div>
                  <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]"></div>
                </div>
                <div className="absolute bottom-8 w-full text-center">
                  <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">Scan Tag</span>
                </div>
              </div>
              
              <div className="absolute top-10 right-10 w-48 h-64 bg-mkhe-bg shadow-xl border border-mkhe-primary/20 rotate-[10deg] -z-0 hidden md:block opacity-60">
                <div className="p-4 flex flex-col gap-2 h-full justify-end">
                  <div className="w-1/2 h-1 bg-mkhe-primary/30"></div>
                  <div className="w-3/4 h-1 bg-mkhe-primary/20"></div>
                  <div className="w-full h-1 bg-mkhe-primary/10"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 5: OUR TEAM - MINIMALIST STAGGERED */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6"
            >
              <div>
                <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-4 font-bold">04 — Con người</h3>
                <h2 className="text-5xl md:text-7xl text-mkhe-text font-logo italic leading-none">Đội ngũ sáng tạo</h2>
              </div>
              <p className="text-mkhe-text/70 max-w-sm text-sm font-light uppercase tracking-widest text-right">
                Kết hợp tư duy nhạy bén và sức mạnh công nghệ đột phá.
              </p>
            </motion.div>
            
            <div className="flex flex-col gap-12 md:gap-16">
              {[
                { name: 'Anh Bảo', role: 'Founder & Business Lead' },
                { name: 'Nhật Anh', role: 'Operations Lead' },
                { name: 'Hữu Trọng', role: 'Marketing Lead' },
                { name: 'Thành Lợi', role: 'Tech & Web Lead' },
                { name: 'Bá Hưng', role: '3D & Game Lead' },
                { name: 'Duy Phương', role: 'UI/UX & Design Lead' }
              ].map((member, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  className={`group relative flex flex-col md:flex-row items-baseline gap-4 md:gap-12 pb-8 border-b border-gray-200 dark:border-gray-800 hover:border-mkhe-primary transition-colors cursor-crosshair ${idx % 2 !== 0 ? 'md:pl-24 lg:pl-48' : ''}`}
                >
                  <h4 className="text-3xl md:text-5xl lg:text-6xl font-logo font-bold text-mkhe-text text-mkhe-text/80 group-hover:text-mkhe-primary transition-colors">{member.name}</h4>
                  <div className="flex-1 border-b border-dashed border-gray-300 dark:border-gray-700 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-sm md:text-base text-mkhe-text/70 uppercase tracking-[0.2em] group-hover:text-mkhe-text transition-colors">{member.role}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-32 text-center"
            >
              <p className="text-xs text-mkhe-text/50 tracking-[0.3em] uppercase">Bảo trợ chuyên môn</p>
              <p className="text-sm mt-4 text-mkhe-text/70 font-light">
                TS. Nguyễn Trọng Luân & Mentor Võ Thiên Ân
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
