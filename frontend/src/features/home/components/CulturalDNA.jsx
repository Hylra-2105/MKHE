import {  useState, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import { productApi } from "@/api/productApi";
import DnaSection from "./DnaSection";
import { motion } from "framer-motion";
import useEffectsConfig from "@/hooks/useEffectsConfig";

const CulturalDNA = () => {
  const { enableEffects } = useEffectsConfig();
  const { t } = useTranslation("home");
  const [products, setProducts] = useState({ CHAM: [], KHMER: [], KINH: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true);
        const [resCham, resKhmer, resKinh] = await Promise.all([
          productApi.getAllProducts(1, 10, "", "", "CHAM", "", false),
          productApi.getAllProducts(1, 10, "", "", "KHMER", "", false),
          productApi.getAllProducts(1, 10, "", "", "KINH", "", false),
        ]);

        const chamData = resCham?.data?.data || resCham?.data || [];
        const khmerData = resKhmer?.data?.data || resKhmer?.data || [];
        const kinhData = resKinh?.data?.data || resKinh?.data || [];

        setProducts({
          CHAM: Array.isArray(chamData) ? chamData : chamData?.items || [],
          KHMER: Array.isArray(khmerData) ? khmerData : khmerData?.items || [],
          KINH: Array.isArray(kinhData) ? kinhData : kinhData?.items || [],
        });
      } catch (error) {
        // Do nothing
      } finally {
        setLoading(false);
      }
    };
    fetchHomeProducts();
  }, []);

  return (
    <section className="relative pt-32 pb-40 px-6 max-w-[1600px] mx-auto bg-mkhe-bg">

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end mb-32 px-4 gap-12">
        <motion.div 
          initial={enableEffects ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }} 
          whileInView={enableEffects ? { opacity: 1, x: 0 } : undefined} 
          viewport={{ once: true, amount: 0.3 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-1/2"
        >
          <div className="inline-flex items-center gap-4 mb-8">
            <span className="w-16 h-[1px] bg-mkhe-primary"></span>
            <span className="text-mkhe-primary tracking-[0.4em] text-xs uppercase font-bold">{t("dna.subtitle", "Khám phá những tinh hoa")}</span>
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] text-mkhe-text font-bold leading-[1.1] mb-8 relative">
            {t("dna.header_title_1", "Sản phẩm ")} <br/>
            <span className="text-mkhe-primary font-logo italic font-normal text-6xl md:text-8xl lg:text-[7.5rem] leading-none block mt-2 ml-12">{t("dna.header_title_2", "Văn hóa")}</span>
          </h2>
        </motion.div>
        <motion.div 
          initial={enableEffects ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 }} 
          whileInView={enableEffects ? { opacity: 1, x: 0 } : undefined} 
          viewport={{ once: true, amount: 0.3 }} 
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="lg:w-1/2 flex lg:justify-end pb-8"
        >
          <p className="text-mkhe-text/70 text-lg max-w-md leading-relaxed border-l-[1px] border-mkhe-primary/40 pl-8 ml-4 lg:ml-0 font-light">
            {t("dna.header_desc")}
          </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-[1px] border-mkhe-text/20 border-t-mkhe-primary rounded-full" />
        </div>
      ) : (
        <div className="relative z-10 space-y-12 md:space-y-20">
          <DnaSection title="Kinh" data={products.KINH} dnaType="KINH" />
          <DnaSection title="Khmer" data={products.KHMER} isReverse={true} dnaType="KHMER" />
          <DnaSection title="Chăm" data={products.CHAM} dnaType="CHAM" />
        </div>
      )}
    </section>
  );
};

export default CulturalDNA;
