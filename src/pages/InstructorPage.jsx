import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ChevronLeft, LoaderCircle, Users } from "lucide-react";
import CourseCard from "../components/courses/CourseCard";
import { getAssetUrl } from "../services/APIService";
import { fetchPublicCourses, fetchPublicInstructor } from "../features/course-management/api/coursesApi";
import Seo from "../components/seo/Seo";
import { cleanDescription, SITE_URL } from "../components/seo/seoCore";

const text = (value, fallback = "") => {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  return text(value.ar ?? value.en ?? value.name ?? value.title, fallback);
};

export default function InstructorPage() {
  const { id: slug } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loadedSlug, setLoadedSlug] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (!active) return;
      setLoading(true);
      setError("");
    }, 0);
    Promise.all([fetchPublicInstructor(slug), fetchPublicCourses()])
      .then(([profile, items]) => {
        if (!active) return;
        setInstructor(profile);
        setCourses(items);
        setLoadedSlug(slug);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setLoadedSlug(slug);
        setError(requestError?.response?.data?.message || "تعذر تحميل بيانات المحاضر.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; window.clearTimeout(loadingTimer); };
  }, [slug]);

  const instructorCourses = useMemo(() => courses.filter((course) =>
    [course.instructorSlug, course.instructorId, course.instructorDetails?.profileSlug]
      .some((value) => value && String(value) === String(slug))), [courses, slug]);

  if (loadedSlug === slug && (error || !instructor)) return <><Seo title="المحاضر غير متاح" path={`/instructors/${slug}`} noindex /><PageState><Users /><span>{error || "لم يتم العثور على المحاضر."}</span><Link to="/courses" className="font-bold text-[#123C91]">العودة إلى الدورات</Link></PageState></>;
  if (loading || loadedSlug !== slug) return <PageState><LoaderCircle className="animate-spin" />جاري تحميل بيانات المحاضر...</PageState>;

  const user = instructor.user || {};
  const schemaName = text(user.fullName || instructor.fullName);
  const name = schemaName || "محاضر الأكاديمية";
  const avatar = getAssetUrl(user.profileImage || instructor.profileImage);
  const studentsCount = instructorCourses.reduce((sum, course) => sum + Number(course.students || 0), 0);
  const description = cleanDescription(instructor.bio || instructor.headline || `${name}، محاضر في الأكاديمية.`);
  const personSchema = schemaName ? { "@context": "https://schema.org", "@type": "Person", name: schemaName, url: `${SITE_URL}/instructors/${encodeURIComponent(slug)}`, ...(instructor.bio ? { description } : {}), ...(avatar ? { image: avatar } : {}) } : undefined;

  return <><Seo title={name} description={description} path={`/instructors/${slug}`} image={avatar} structuredData={personSchema} /><div className="min-h-screen bg-[#F8FBFF] py-6 sm:py-9" dir="rtl"><div className="container-custom">
    <div className="mb-6"><Link to="/courses" className="flex items-center gap-1 text-sm font-medium text-[#657080] hover:text-[#123C91]"><ChevronLeft size={16} className="rotate-180" />العودة إلى الدورات</Link></div>
    <div className="mb-8 rounded-2xl border border-[#DDE4EC] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-4 text-right">
          {avatar ? <img src={avatar} alt={name} className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#12C6B0] to-[#123C91] text-2xl font-bold text-white">{name.charAt(0)}</div>}
          <div><h1 className="text-xl font-bold text-[#1F2937]">{name}</h1><p className="text-sm text-[#7B8490]">{instructor.headline || "محاضر معتمد"}</p></div>
        </div>
        <div className="flex items-center gap-8 text-center"><Stat value={instructorCourses.length} label="دورات" /><Stat value={studentsCount.toLocaleString("ar-EG")} label="طالب" /><Stat value={instructor.status === "active" ? "نشط" : "غير متاح"} label="الحالة" /></div>
      </div>
      {instructor.bio && <p className="mt-6 border-t border-[#EDF0F4] pt-5 text-sm leading-7 text-[#657080]">{instructor.bio}</p>}
    </div>
    <section className="py-0!"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-[#123C91] sm:text-xl">الدورات المنشورة لـ {name}</h2><span className="rounded-full bg-[#EAF2FF] px-3 py-1.5 text-xs font-bold text-[#123C91]">{instructorCourses.length} دورة</span></div>
      {instructorCourses.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(260px,310px))]">{instructorCourses.map((course) => <CourseCard key={course.id} course={course} compact />)}</div> : <div className="rounded-xl border border-[#DDE4EC] bg-white p-10 text-center text-[#7B8490]"><BookOpen className="mx-auto mb-3" />لا توجد دورات منشورة لهذا المحاضر حاليًا.</div>}
    </section>
  </div></div></>;
}

function Stat({ value, label }) { return <div><div className="text-xl font-bold text-[#1F2937]">{value}</div><div className="text-xs text-[#7B8490]">{label}</div></div>; }
function PageState({ children }) { return <div dir="rtl" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#F8FBFF] text-[#667085]">{children}</div>; }
