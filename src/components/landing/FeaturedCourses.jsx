import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import CourseCard from "../courses/CourseCard";
import { fetchPublicCourses } from "../../features/course-management/api/coursesApi";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [reference, setReference] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Public courses are already restricted by the API to approved/published items.
    fetchPublicCourses({ sort: "bestselling", limit: 6 })
      .then((items) => setCourses(items.slice(0, 6)))
      .catch(() => setCourses([]));
  }, []);
  const verifyCertificate = (event) => {
    event.preventDefault();
    const value = reference.trim();
    if (value) navigate(`/certificates/verify/${encodeURIComponent(value)}`);
  };
  return (
    <section id="courses" className="w-full bg-[#FBFCFE] py-12 sm:py-16" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center gap-3 text-sm font-semibold text-[#087F71]">
            <span className="h-px w-12 bg-[#12C6B0]" />
            دوراتنا التعليمية
            <span className="h-px w-12 bg-[#12C6B0]" />
          </div>
          <h2 className="mb-3 text-2xl font-extrabold text-[#123C91] sm:text-3xl lg:text-4xl">الدورات الأكثر مبيعاً</h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[#657080] sm:text-base">
            استكشف الدورات التي حظيت بأكبر إقبال من المتعلمين واختر المحتوى المناسب لرحلتك.
          </p>
        </div>

        <div className="grid grid-cols-1 justify-center gap-5 sm:grid-cols-[repeat(auto-fit,minmax(260px,320px))]">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} compact />
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <Link
            to="/courses"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#C9D5E5] bg-white px-6 text-sm font-bold text-[#123C91] transition hover:border-[#123C91] hover:bg-[#F3F7FD]"
          >
            عرض جميع الدورات <ArrowLeft size={18} />
          </Link>
        </div>
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-[#DDE6F2] bg-white p-5 shadow-sm sm:p-8">
          <h3 className="text-xl font-extrabold text-[#123C91]">التحقق من الشهادة</h3>
          <p className="mt-2 text-sm text-[#657080]">أدخل رقم الشهادة المكتوب عليها لعرض نتيجة التحقق الرسمية.</p>
          <form onSubmit={verifyCertificate} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="featured-certificate-reference" className="sr-only">رقم الشهادة</label>
            <input id="featured-certificate-reference" dir="ltr" value={reference} onChange={(event) => setReference(event.target.value)} maxLength={128} required autoComplete="off" placeholder="CERT-2026-A7B9C2D4" className="min-w-0 flex-1 rounded-xl border border-[#C9D5E5] px-4 py-3 text-left outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/15" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123C91] px-7 py-3 font-bold text-white hover:bg-[#0E3279]"><Search size={18} />تحقق من الشهادة</button>
          </form>
        </div>
      </div>
    </section>
  );
}
