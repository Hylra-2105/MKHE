import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MiniCartDrawer from "./MiniCartDrawer";

export default function MainLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isProfilePage = location.pathname.startsWith("/profile");
  const hideFooter = isAdminPage || isProfilePage;

  return (
    <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden bg-mkhe-bg text-current transition-colors duration-300">
      <Header />
      <main className="flex-1 mt-20">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <MiniCartDrawer />
    </div>
  );
}
