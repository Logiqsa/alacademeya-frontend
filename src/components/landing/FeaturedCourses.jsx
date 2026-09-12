import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import CourseCard from "../courses/CourseCard";
import { fetchPublicCourses } from "../../features/course-management/api/coursesApi";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Public courses are already restricted by the API to approved/published items.
    fetchPublicCourses({ limit: 6 })
      .then((items) => setCourses(items.slice(0, 6)))
      .catch(() => setCourses([]));
  }, []);
  return (
    <section id="courses" className="w-full bg-[#FBFCFE] py-12 sm:py-16" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center gap-3 text-sm font-semibold text-[#12AFA0]">
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
      </div>
    </section>
  );
}
