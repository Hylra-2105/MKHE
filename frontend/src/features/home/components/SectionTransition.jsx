import { motion } from "framer-motion";
import useEffectsConfig from "@/hooks/useEffectsConfig";

const SectionTransition = () => {
  const { enableEffects } = useEffectsConfig();

  return (
    <div className="w-full h-32 md:h-48 flex flex-col items-center justify-center relative overflow-hidden z-20 -mt-12 md:-mt-16">
      {/* Background gradient has been removed to prevent blurry white overlay on video */}

      {/* 1. Solid fill mask (Layer 0) - hides the sharp edge of the video cleanly */}
      <svg
        className="absolute inset-0 w-full h-full max-w-none z-0"
        viewBox="0 0 1600 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M-100,100 C100,0 300,200 500,100 C700,0 900,200 1100,100 C1300,0 1500,200 1700,100 L1700,250 L-100,250 Z"
          className="fill-mkhe-bg"
        />
      </svg>

      {/* 2. Họa tiết lưới (Board Game grid) (Layer 10) - renders over the video and over the solid mask */}
      <div 
        className="absolute inset-0 opacity-15 z-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 163, 115, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 163, 115, 0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center',
          maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)'
        }}
      ></div>

      {/* 3. Họa tiết DNA (Mã Gen Mekong) - Wave Line (Layer 20) */}
      <svg
        className="absolute inset-0 w-full h-full max-w-none z-20 pointer-events-none"
        viewBox="0 0 1600 200"
        preserveAspectRatio="xMidYMid slice"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}
      >
        {/* DNA Strand 2 */}
        <motion.path
          initial={enableEffects ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          whileInView={enableEffects ? { pathLength: 1, opacity: 1 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          d="M-100,100 C100,0 300,200 500,100 C700,0 900,200 1100,100 C1300,0 1500,200 1700,100"
          className="stroke-mkhe-primary/70 stroke-[3] fill-transparent"
          style={{ filter: "drop-shadow(0 0 8px rgba(212,163,115,0.6))" }}
        />
      </svg>
    </div>
  );
};

export default SectionTransition;
