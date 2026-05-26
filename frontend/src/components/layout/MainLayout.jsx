import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-mkhe-bg text-current transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
