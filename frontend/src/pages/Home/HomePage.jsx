import HeroBanner from "@/features/home/components/HeroBanner";
import CulturalDNA from "@/features/home/components/CulturalDNA";
import CoreTech from "@/features/home/components/CoreTech";
import HeritageStory from "@/features/home/components/HeritageStory";
import BoardGameTeaser from "@/features/home/components/BoardGameTeaser";

const HomePage = () => {
  return (
    <div className="bg-mkhe-bg min-h-screen text-mkhe-text overflow-x-hidden">
      <HeroBanner />
      <HeritageStory />
      <CulturalDNA />
      <BoardGameTeaser />
      <CoreTech />
    </div>
  );
};

export default HomePage;
