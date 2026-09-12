import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import pythonCover from "../../assets/courses/python-course.png";
import mathCover from "../../assets/courses/math-course.png";
import skillsCover from "../../assets/courses/skills-course.png";
import CourseRatingSummary from "../../features/course-management/components/reviews/CourseRatingSummary";

const courseCovers = {
  technology: pythonCover,
  math: mathCover,
  skills: skillsCover,
  language: pythonCover,
  science: mathCover,
  algebra: skillsCover,
};

export default function CourseCard({ course, compact = false }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#DDE4EC] bg-white text-right transition-all duration-300 hover:-translate-y-1 hover:border-[#C8D5E8] hover:shadow-lg">
      <Link to={`/courses/${course.slug}`} className="block">
        <div className={`relative overflow-hidden bg-[#EEF1F4] ${compact ? "aspect-video" : "aspect-1.5/1"}`}>
          <img
            src={course.coverImage || courseCovers[course.cover] || pythonCover}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className={`absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-[12px] font-bold ${course.price ? "text-[#123C91]" : "text-[#0A9B72]"}`}>
            {course.price ? "مدفوع" : "مجاني"}
          </span>
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white">
            <Clock size={13} /> {course.duration} ساعة
          </span>
        </div>
      </Link>

      <div className={`flex grow flex-col ${compact ? "min-h-44 p-4" : "min-h-48 px-5 py-4"}`} dir="rtl">
        <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "mb-2 text-xs" : "mb-3 text-[14px]"}`}>
          <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 font-semibold text-[#123C91]">
            {course.category}
          </span>
          <span className="rounded-full bg-[#F0F4F8] px-2.5 py-1 font-semibold text-[#7B8490]">
            {course.level}
          </span>
        </div>

        <Link to={`/courses/${course.slug}`} className={`${compact ? "mb-2 text-base leading-6" : "mb-3 text-[17px] leading-7"} line-clamp-2 font-bold text-[#1F2937] transition-colors group-hover:text-[#123C91]`}>
          {course.title}
        </Link>

        {/* تعديل اسم وصورة المحاضر ليصبح رابطاً لصفحته الشخصية */}
      {/* اسم وصورة المحاضر بشكل مميز وواضح */}
        <div className="mb-4 flex items-center gap-2">
          <Link
            to={`/instructors/${encodeURIComponent(course.instructorSlug || course.instructorId || course.instructor)}`}
            className="flex items-center gap-2 group/inst"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#12C6B0] to-[#123C91] text-[13px] font-bold text-white shadow-xs">
              {course.instructor?.charAt(0) || "م"}
            </span>
            <span className="text-[14px] font-medium text-[#4B5563] underline decoration-transparent underline-offset-4 transition-all duration-300 group-hover/inst:text-[#123C91] group-hover/inst:decoration-[#123C91]">
              {course.instructor || "محاضر الأكاديمية"}
            </span>
          </Link>
        </div>
        <div className="mb-4"><CourseRatingSummary averageRating={course.averageRating ?? course.rating} ratingCount={course.ratingCount} compact /></div>

        <div className="mt-auto flex items-end justify-between border-t border-[#EDF0F4] pt-4">
          <strong className="text-lg text-[#123C91]">
            {course.price ? `${course.price} ج.م` : "مجاني"}
          </strong>
          <span className="text-xs text-[#7B8490]">{course.students} طالب</span>
        </div>
      </div>
    </article>
  );
}
