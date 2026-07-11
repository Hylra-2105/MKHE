import { Outlet } from "react-router-dom";
import AuthHeader from "./AuthHeader";
import React from "react";
import PageSkeleton from "../ui/PageSkeleton";

export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-mkhe-bg overflow-hidden">
      <AuthHeader />
      <main className="flex-1 flex flex-col relative">
        <React.Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </React.Suspense>
      </main>
    </div>
  );
}
