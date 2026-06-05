import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen bg-mkhe-bg text-current transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}
