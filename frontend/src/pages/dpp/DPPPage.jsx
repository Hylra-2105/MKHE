import DPPContainer from "@/features/dpp/components/DPPContainer";
import Header from "@/components/layout/Header";

export default function DPPPage() {
  return (
    <div className="flex flex-col min-h-screen bg-mkhe-bg font-sans">
      <Header />
      <div className="flex-1 relative pt-20">
        <DPPContainer />
      </div>
    </div>
  );
}