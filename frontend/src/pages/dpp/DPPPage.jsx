import React from "react";
import DPPContainer from "@/features/dpp/components/DPPContainer";
import AuthHeader from "@/components/layout/AuthHeader";

export default function DPPPage() {
  return (
    <div className="flex flex-col min-h-screen bg-mkhe-bg font-sans">
      <AuthHeader />
      <div className="flex-1 relative">
        <DPPContainer />
      </div>
    </div>
  );
}