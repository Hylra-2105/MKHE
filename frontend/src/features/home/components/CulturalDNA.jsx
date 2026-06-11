import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { productApi } from "@/api/productApi";
import DnaSection from "./DnaSection";

const CulturalDNA = () => {
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

        // Lấy dữ liệu từ response
        const chamData = resCham?.data?.data || resCham?.data || [];
        const khmerData = resKhmer?.data?.data || resKhmer?.data || [];
        const kinhData = resKinh?.data?.data || resKinh?.data || [];

        setProducts({
          CHAM: Array.isArray(chamData) ? chamData : chamData?.items || [],
          KHMER: Array.isArray(khmerData) ? khmerData : khmerData?.items || [],
          KINH: Array.isArray(kinhData) ? kinhData : kinhData?.items || [],
        });
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeProducts();
  }, []);

  return (
    <section className="relative py-28 px-6 max-w-[1400px] mx-auto border-t border-mkhe-primary/10">
      {/* =========================================
          BỘ NỀN "BIẾN TẤU": DÒNG CHẢY DI SẢN (HERITAGE FLOW)
          Sử dụng các quầng sáng to, mờ ảo đan xen vào nhau,
          tượng trưng cho sự giao thoa của 3 nền văn hóa.
      ========================================== */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-3xl">
        {/* Quầng sáng 1: Vàng đồng nhẹ nhàng ở góc trên trái (Ôm lấy khu vực Chăm) */}
        <div className="absolute top-[5%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#c5a059]/15 to-transparent blur-[120px]" />

        {/* Quầng sáng 2: Nâu đất trầm ấm vắt ngang giữa phải (Tạo nền sâu cho Khmer) */}
        <div className="absolute top-[40%] -right-[15%] w-[800px] h-[600px] rounded-[100%] bg-gradient-to-bl from-[#8E5E37]/10 via-[#D4A373]/5 to-transparent blur-[150px] transform -rotate-12" />

        {/* Quầng sáng 3: Cam đất hắt lên từ đáy (Ôm trọn khu vực Kinh) */}
        <div className="absolute -bottom-[5%] left-[15%] w-[700px] h-[500px] rounded-[100%] bg-gradient-to-t from-[#C38D64]/10 to-transparent blur-[100px] transform rotate-12" />

        {/* Điểm xuyết: Vệt sáng nhỏ tinh tế */}
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#D4A373]/5 blur-[80px]" />
      </div>
      {/* ========================================= */}

      <div className="relative z-10 text-center mb-20 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-mkhe-text mb-4 font-logo tracking-wider uppercase">
          {t("dna.title")}
        </h2>
        <p className="text-mkhe-text/70 text-lg">{t("dna.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-mkhe-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="relative z-10 space-y-16">
          <DnaSection title="Chăm" data={products.CHAM} />
          <DnaSection title="Khmer" data={products.KHMER} isReverse={true} />
          <DnaSection title="Kinh" data={products.KINH} />
        </div>
      )}
    </section>
  );
};

export default CulturalDNA;
