import { useContext } from "react";
import { ArrowLeft, Home, LayoutDashboard, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/icons/logo.svg";
import { getDashboardPathByRole } from "../utils/roles";
import Seo from "../components/seo/Seo";

export default function NotFoundPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const destination = user ? getDashboardPathByRole(user) : "/";

  return (
    <>
    <Seo title="الصفحة غير موجودة" path={window.location.pathname} noindex />
    <main
      dir="rtl"
      className="relative grid min-h-screen overflow-hidden bg-[#F4F7FC] px-4 py-8 sm:px-6"
    >
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#123C91]/8" />
      <div className="pointer-events-none absolute -bottom-36 -left-28 h-96 w-96 rounded-full bg-[#12C6B0]/10" />
      <div className="pointer-events-none absolute left-[12%] top-[16%] h-3 w-3 rounded-full bg-[#12C6B0]" />
      <div className="pointer-events-none absolute bottom-[18%] right-[12%] h-4 w-4 rounded-full bg-[#123C91]/20" />

      <div className="relative m-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#DDE6F2] bg-white shadow-[0_24px_80px_rgba(18,60,145,0.12)]">
        <div className="grid md:grid-cols-[1.05fr_.95fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <Link
              to="/"
              className="mb-8 inline-flex w-fit"
              aria-label="العودة إلى الرئيسية"
            >
              <img src={logo} alt="الأكاديمية" className="h-10 w-auto" />
            </Link>
            <span className="w-fit rounded-full bg-[#E8F8F5] px-3 py-1.5 text-xs font-bold text-[#087F72]">
              الصفحة غير موجودة
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight text-[#17213A] sm:text-4xl">
              يبدو أنك وصلت إلى
              <span className="block text-[#123C91]">صفحة غير متاحة</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#667085] sm:text-base">
              ربما تم نقل الصفحة أو تغيير رابطها. يمكنك الرجوع للخلف أو الانتقال
              إلى المكان المناسب لك.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={destination}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123C91] px-6 py-3.5 text-sm font-bold text-white! shadow-lg shadow-[#123C91]/15 transition hover:bg-[#0E3279]"
              >
                {user ? <LayoutDashboard size={18} /> : <Home size={18} />}
                {user ? "الذهاب إلى لوحة التحكم" : "العودة إلى الرئيسية"}
              </Link>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9D7ED] bg-white px-6 py-3.5 text-sm font-bold text-[#123C91] transition hover:bg-[#EEF4FF]"
              >
                <ArrowLeft size={18} className="rotate-180" /> الرجوع للخلف
              </button>
            </div>
          </div>

          <div className="relative grid min-h-72 place-items-center overflow-hidden bg-linear-to-br from-[#123C91] to-[#0A255B] p-8 text-white md:min-h-[570px]">
            <div className="absolute -right-16 top-10 h-48 w-48 rounded-full border-[34px] border-white/5" />
            <div className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-[#12C6B0]/15" />
            <div className="relative text-center">
              <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-[38px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm sm:h-44 sm:w-44">
                <SearchX
                  size={72}
                  strokeWidth={1.35}
                  className="text-[#8FE3D8] sm:h-20 sm:w-20"
                />
                <span className="absolute -bottom-5 -left-5 grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl font-black text-[#123C91] shadow-xl">
                  ؟
                </span>
              </div>
              <div className="mt-9 text-[76px] font-black leading-none tracking-tight sm:text-[96px]">
                404
              </div>
              <p className="mt-3 text-sm font-medium text-white/70">
                لم نتمكن من العثور على هذا الرابط
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
