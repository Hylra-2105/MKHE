import { motion } from 'framer-motion';
import useEffectsConfig from "@/hooks/useEffectsConfig";
import { useTranslation } from 'react-i18next';
import aboutUs1 from '@/assets/images/about-us-1.png';
import aboutUs2 from '@/assets/images/about-us-2.png';
import vanGiaoImg from '@/assets/images/VanGiao.png';
import chauPhongImg from '@/assets/images/ChauPhong.png';
import dinhYenImg from '@/assets/images/DinhYen.png';
import longKhanhImg from '@/assets/images/LongKhanh.png';

const AboutPage = () => {
  const { enableEffects } = useEffectsConfig();
  const { t } = useTranslation('about');

  return (
    <div className="min-h-screen bg-mkhe-bg text-mkhe-text font-sans ">
      
      {/* CREATIVE HERO SECTION */}
      <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-mkhe-bg">
        <div className={`absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-mkhe-primary/20 rounded-full blur-[100px] animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#8B5A2B]/10 rounded-full blur-[120px] animate-pulse`} style={{ animationDelay: '2s' }}></div>
        
        {/* Large Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none opacity-5 overflow-hidden -left-[5vw]">
          <span className="text-[35vw] font-logo font-bold text-mkhe-text whitespace-nowrap">MKHE</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-16 py-20">
          
          <motion.div 
            initial={enableEffects ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }} animate={enableEffects ? { opacity: 1, x: 0 } : undefined} transition={{ duration: 1, ease: "easeOut" }}
            className="md:w-1/2 relative"
          >
            <div className="inline-flex items-center gap-4 mb-10">
              <span className="w-16 h-[1px] bg-mkhe-primary"></span>
              <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">{t('hero.tag')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] text-mkhe-text font-bold leading-[1.1] mb-8 relative z-10">
              {t('hero.title_1')} <br/>
              <span className="text-mkhe-primary font-logo italic font-normal text-6xl md:text-8xl lg:text-[7.5rem] leading-none block mt-2 ml-12">{t('hero.title_2')}</span>
            </h1>
            <p className="text-mkhe-text/70 text-lg max-w-md leading-relaxed border-l-[1px] border-mkhe-primary/40 pl-8 ml-4 font-light">
              {t('hero.desc')}
            </p>
          </motion.div>
          
          <motion.div 
            initial={enableEffects ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }} animate={enableEffects ? { opacity: 1, scale: 1 } : undefined} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="md:w-1/2 relative flex justify-center md:justify-end"
          >
            <div className="relative w-full max-w-[350px] lg:max-w-[450px] aspect-square rounded-t-full rounded-b-[20px] overflow-hidden p-4 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-black/10 dark:border-white/10">
              <div className="w-full h-full rounded-t-full rounded-b-[12px] overflow-hidden bg-mkhe-bg relative group flex items-center justify-center">
                <img 
                  src={aboutUs1}
                  alt="Mekong Heritage" 
                  className="w-full h-full object-contain p-6"
                />
              </div>
            </div>
            
            <div className={`absolute top-1/4 -left-12 lg:-left-24 w-40 h-40 border-[1px] border-mkhe-primary/30 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center pointer-events-none hidden md:flex`}>
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
              initial={enableEffects ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="lg:col-span-5 lg:col-start-2 pt-10"
            >
              <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-6 font-bold">{t('story.tag')}</h3>
              <p className="text-xl md:text-2xl text-mkhe-text/90 leading-relaxed font-light mb-8 relative">
                <span className="absolute -left-6 md:-left-10 -top-4 text-6xl text-mkhe-primary/30 font-logo italic">"</span>
                {t('story.p1_1')}<span className="text-mkhe-primary font-semibold">{t('story.p1_bold')}</span>{t('story.p1_2')}
              </p>
              <p className="text-base text-mkhe-text/70 leading-relaxed font-light text-justify">
                {t('story.p2_1')}<strong>{t('story.p2_bold')}</strong>{t('story.p2_2')}
              </p>
            </motion.div>
            
            <motion.div 
              initial={enableEffects ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 }} whileInView={enableEffects ? { opacity: 1, x: 0 } : undefined} viewport={{ once: true }} transition={{ duration: 1 }}
              className="lg:col-span-6 lg:col-start-7 relative mt-10 lg:mt-0"
            >
              <div className="relative w-full aspect-[4/5] bg-mkhe-input overflow-hidden rounded-sm">
                <img 
                  src={aboutUs2}
                  alt="Mekong Artisan" 
                  className="w-full h-full object-cover transition-all duration-[2s]"
                />
                <div className="absolute top-6 left-6 w-16 h-[1px] bg-white/70"></div>
                <div className="absolute top-6 left-6 w-[1px] h-16 bg-white/70"></div>
                <div className="absolute bottom-6 right-6 w-16 h-[1px] bg-white/70"></div>
                <div className="absolute bottom-6 right-6 w-[1px] h-16 bg-white/70"></div>
              </div>
              
              {/* Overlapping text box */}
              <div className="absolute -bottom-10 -left-10 lg:-left-20 bg-mkhe-bg p-8 shadow-2xl border-l-[3px] border-mkhe-primary max-w-[280px]">
                <p className="font-logo italic text-2xl text-mkhe-text">{t('story.box_1')} <br/><span className="text-mkhe-primary">{t('story.box_2')}</span></p>
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
                initial={enableEffects ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center relative"
              >
                <div className="text-[120px] md:text-[180px] font-logo italic leading-none text-mkhe-primary/20 absolute -left-4 md:left-0 -top-10 md:-top-20 select-none z-0">01</div>
                <div className="md:w-1/3 relative z-10 pl-4 md:pl-24">
                  <h3 className="text-4xl md:text-5xl text-mkhe-text font-bold tracking-tight">{t('vision.title_1')} <span className="font-logo italic text-mkhe-primary font-normal">{t('vision.title_2')}</span></h3>
                </div>
                <div className="md:w-2/3 relative z-10 pl-4 md:pl-0">
                  <p className="text-xl md:text-2xl text-mkhe-text/80 font-light leading-relaxed">
                    {t('vision.desc')}
                  </p>
                </div>
              </motion.div>

              {/* Item 2 */}
              <motion.div 
                initial={enableEffects ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center relative"
              >
                <div className="text-[120px] md:text-[180px] font-logo italic leading-none text-mkhe-primary/20 absolute -left-4 md:left-0 -top-10 md:-top-20 select-none z-0">02</div>
                <div className="md:w-1/3 relative z-10 pl-4 md:pl-24">
                  <h3 className="text-4xl md:text-5xl text-mkhe-text font-bold tracking-tight">{t('mission.title_1')} <span className="font-logo italic text-mkhe-primary font-normal">{t('mission.title_2')}</span></h3>
                </div>
                <div className="md:w-2/3 relative z-10 pl-4 md:pl-0">
                  <p className="text-xl md:text-2xl text-mkhe-text/80 font-light leading-relaxed">
                    {t('mission.desc')}
                  </p>
                </div>
              </motion.div>

              {/* Item 3 */}
              <motion.div 
                initial={enableEffects ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center relative"
              >
                <div className="text-[120px] md:text-[180px] font-logo italic leading-none text-mkhe-primary/20 absolute -left-4 md:left-0 -top-10 md:-top-20 select-none z-0">03</div>
                <div className="md:w-1/3 relative z-10 pl-4 md:pl-24">
                  <h3 className="text-4xl md:text-5xl text-mkhe-text font-bold tracking-tight">{t('core_values.title_1')} <span className="font-logo italic text-mkhe-primary font-normal">{t('core_values.title_2')}</span></h3>
                </div>
                <div className="md:w-2/3 relative z-10 pl-4 md:pl-0">
                  <ul className="text-xl md:text-2xl text-mkhe-text/80 font-light leading-relaxed space-y-3">
                    <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-mkhe-primary"></span> {t('core_values.items.0')}</li>
                    <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-mkhe-primary"></span> {t('core_values.items.1')}</li>
                    <li className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-mkhe-primary"></span> {t('core_values.items.2')}</li>
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
              <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-4 font-bold">{t('heritage_villages.tag')}</h3>
              <h2 className="text-5xl md:text-6xl text-mkhe-text font-logo italic">{t('heritage_villages.title')}</h2>
            </div>
            
            <div className="space-y-20 md:space-y-32">
              {[
                { name: t('heritage_villages.items.0.name'), desc: t('heritage_villages.items.0.desc'), image: vanGiaoImg },
                { name: t('heritage_villages.items.1.name'), desc: t('heritage_villages.items.1.desc'), image: chauPhongImg },
                { name: t('heritage_villages.items.2.name'), desc: t('heritage_villages.items.2.desc'), image: dinhYenImg },
                { name: t('heritage_villages.items.3.name'), desc: t('heritage_villages.items.3.desc'), image: longKhanhImg }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={enableEffects ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
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
                    <div className="relative w-full max-w-[350px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group border border-mkhe-primary/20">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 group-hover:bg-black/40 transition-colors duration-500">
                        <div className="text-[120px] font-logo italic font-bold text-white/60 leading-none select-none drop-shadow-lg">
                          0{idx + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* SECTION 5: OUR TEAM - MINIMALIST STAGGERED */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={enableEffects ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }}
              className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6"
            >
              <div>
                <h3 className="text-sm uppercase tracking-[0.3em] text-mkhe-primary mb-4 font-bold">{t('team.tag')}</h3>
                <h2 className="text-5xl md:text-7xl text-mkhe-text font-logo italic leading-none">{t('team.title')}</h2>
              </div>
              <p className="text-mkhe-text/70 max-w-sm text-sm font-light uppercase tracking-widest text-right">
                {t('team.subtitle')}
              </p>
            </motion.div>
            
            <div className="flex flex-col gap-12 md:gap-16">
              {[
                { name: 'Anh Bao', role: t('team.members.0.role') },
                { name: 'Nhat Anh', role: t('team.members.1.role') },
                { name: 'Huu Trong', role: t('team.members.2.role') },
                { name: 'Thanh Loi', role: t('team.members.3.role') },
                { name: 'Ba Hung', role: t('team.members.4.role') },
                { name: 'Duy Phuong', role: t('team.members.5.role') }
              ].map((member, idx) => (
                <motion.div 
                  key={idx} 
                  initial={enableEffects ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }} whileInView={enableEffects ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  className={`group relative flex flex-col md:flex-row items-baseline gap-4 md:gap-12 pb-8 border-b border-mkhe-text/10 hover:border-mkhe-primary transition-colors cursor-crosshair ${idx % 2 !== 0 ? 'md:pl-24 lg:pl-48' : ''}`}
                >
                  <h4 className="text-3xl md:text-5xl lg:text-6xl font-logo font-bold text-mkhe-text text-mkhe-text/80 group-hover:text-mkhe-primary transition-colors">{member.name}</h4>
                  <div className="flex-1 border-b border-dashed border-mkhe-text/20 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-sm md:text-base text-mkhe-text/70 uppercase tracking-[0.2em] group-hover:text-mkhe-text transition-colors">{member.role}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={enableEffects ? { opacity: 0 } : { opacity: 1 }} whileInView={enableEffects ? { opacity: 1 } : undefined} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-32 text-center"
            >
              <p className="text-xs text-mkhe-text/50 tracking-[0.3em] uppercase">{t('team.mentor_tag')}</p>
              <p className="text-sm mt-4 text-mkhe-text/70 font-light">
                TS. Nguyen Trong Luan & Mentor Vo Thien An
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
