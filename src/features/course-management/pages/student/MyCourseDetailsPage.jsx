import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import StudentLayout from "../../../../components/student/layout/StudentLayout";
import { fetchStudentCourses } from "../../api/coursesApi";

// Compatibility entry for old /my-courses/:slug links. Enrollment data, rather
// than the public catalogue, resolves the canonical course id.
export default function MyCourseDetailsPage() {
  const { slug } = useParams();
  const [courseId, setCourseId] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    fetchStudentCourses()
      .then((courses) => {
        const course = courses.find((item) =>
          [item.id, item.slug].some((value) => String(value || "") === String(slug)),
        );
        if (active) setCourseId(course?.id || "");
      })
      .finally(() => active && setDone(true));
    return () => { active = false; };
  }, [slug]);

  if (courseId) return <Navigate to={`/learn/${courseId}`} replace />;
  if (!done) return <StudentLayout><div className="grid min-h-[60vh] place-items-center"><LoaderCircle className="animate-spin text-[#123C91]" /></div></StudentLayout>;
  return <StudentLayout><div dir="rtl" className="p-12 text-center"><h1 className="text-xl font-bold">هذه الدورة غير متاحة ضمن تسجيلاتك النشطة.</h1><Link to="/student-dashboard/courses" className="mt-4 inline-block text-[#123C91]">العودة إلى دوراتي</Link></div></StudentLayout>;
}
