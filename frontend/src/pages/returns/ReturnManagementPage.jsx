import React from "react";
import ReturnList from "@/features/returns/components/Admin/ReturnList";

const ReturnManagementPage = () => {
  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      <ReturnList />
    </div>
  );
};

export default ReturnManagementPage;
