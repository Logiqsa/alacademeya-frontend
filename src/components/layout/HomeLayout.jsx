import Navbar from "./Navbar";
import Footer from "./Footer"; 
import { Outlet } from "react-router-dom";
import { ArrowUp } from "lucide-react";
const HomeLayout = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-[#123C91] p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#0F3278] [&_svg]:text-white sm:bottom-6 sm:right-6"
        aria-label="العودة للأعلى"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

export default HomeLayout;
