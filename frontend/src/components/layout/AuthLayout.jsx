import { Outlet } from "react-router-dom";
import AuthHeader from "./AuthHeader";

export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-mkhe-bg overflow-hidden">
      <AuthHeader />
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
