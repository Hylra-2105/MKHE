import React from "react";
import { useTranslation } from "react-i18next";
import { Nfc, ShieldCheck, Gem } from "lucide-react";

const CoreTech = () => {
  const { t } = useTranslation("home");

  const features = [
    {
      icon: <Nfc className="w-8 h-8 text-mkhe-primary" />,
      title: "Hộ chiếu Văn hóa Số",
      desc: "Chạm NFC để truy xuất nguồn gốc, kỹ thuật chế tác và câu chuyện nghệ nhân.",
    },
    {
      icon: <Gem className="w-8 h-8 text-mkhe-primary" />,
      title: "Độc bản & Giới hạn",
      desc: "Mỗi thiết kế là duy nhất, được cấp chứng nhận tính xác thực qua Blockchain.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-mkhe-primary" />,
      title: "Bảo tồn Di sản",
      desc: "Trích xuất doanh thu tái đầu tư vào việc duy trì các làng nghề truyền thống.",
    },
  ];

  return (
    <section className="relative py-28 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 -left-32 w-96 h-96 bg-gradient-to-br from-mkhe-primary/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-mkhe-text mb-8 font-logo leading-tight">
            {t("tech.title", "Đánh thức Di sản bằng Công nghệ Đương đại")}
          </h2>
          <p className="text-lg text-mkhe-text/75 mb-10 leading-relaxed">
            Chúng tôi không chỉ bán sản phẩm, chúng tôi trao cho bạn chiếc chìa
            khóa số để bước vào thế giới của nghệ thuật thủ công ngàn năm.
          </p>
          <div className="space-y-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 group hover:translate-x-2 transition-transform"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-mkhe-primary/25 to-[#D4A373]/10 flex items-center justify-center flex-shrink-0 group-hover:from-mkhe-primary/40 group-hover:to-[#D4A373]/20 transition-all shadow-md">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-mkhe-text mb-1 group-hover:text-mkhe-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-mkhe-text/70 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối Ảnh minh họa NFC */}
        <div className="relative aspect-square bg-gradient-to-br from-mkhe-primary/10 via-[#D4A373]/5 to-transparent rounded-3xl border-2 border-mkhe-primary/20 flex items-center justify-center overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-mkhe-primary/10 transition-all group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-mkhe-primary)_0%,_transparent_60%)] opacity-15 group-hover:opacity-25 transition-opacity animate-pulse"></div>
          <Nfc className="w-40 h-40 text-mkhe-primary/40 group-hover:text-mkhe-primary/60 transition-colors" />
        </div>
      </div>
    </section>
  );
};

export default CoreTech;
