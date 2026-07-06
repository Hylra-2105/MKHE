import HeroBanner from "@/features/home/components/HeroBanner";
import SectionTransition from "@/features/home/components/SectionTransition";
import CulturalDNA from "@/features/home/components/CulturalDNA";
import CoreTech from "@/features/home/components/CoreTech";
import HeritageStory from "@/features/home/components/HeritageStory";
import BoardGameTeaser from "@/features/home/components/BoardGameTeaser";
import Fireflies from "@/features/home/components/Fireflies";

const HomePage = () => {
  return (
    <div className="bg-mkhe-bg min-h-screen text-mkhe-text overflow-x-clip">
      <HeroBanner />
      <div className="relative">
        <Fireflies />
        <SectionTransition />
        <HeritageStory />
      </div>
      <CulturalDNA />
      <BoardGameTeaser />
      <CoreTech />
    </div>
  );
};

export default HomePage;
