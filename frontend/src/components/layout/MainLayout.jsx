import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "../../features/ai/components/Chatbot";
import React from "react";
import PageSkeleton from "../ui/PageSkeleton";

export default function MainLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isProfilePage = location.pathname.startsWith("/profile");
  const hideFooter = isAdminPage || isProfilePage;
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-clip bg-mkhe-bg text-current transition-colors duration-300">
      <Header />
      <main className={`flex-1 ${isHomePage ? "" : "pt-20"}`}>
        <React.Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </React.Suspense>
      </main>
      {!hideFooter && <Footer />}
      <Chatbot />
    </div>
  );
}
