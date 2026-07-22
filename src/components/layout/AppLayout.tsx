import { Outlet } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
