import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  LoaderCircle,
  Search,
  Tags,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { fetchAdminCourses } from "../../features/course-management/api/coursesApi";
import { getAdminCourseCategories } from "../../services/APIService";
import { getApiErrorMessage } from "../../services/apiError";

const listOf = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return Array.isArray(data) ? data : data?.items || [];
};
const statusStyle = (status) =>
  status === "published"
    ? "bg-emerald-50 text-emerald-700"
    : status === "archived"
      ? "bg-slate-100 text-slate-700"
      : status === "rejected"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

export default function CategoryCoursesPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getAdminCourseCategories(), fetchAdminCourses()])
      .then(([categoryResponse, courseItems]) => {
        if (!active) return;
        const selected = listOf(categoryResponse).find(
          (item) => String(item._id || item.id) === String(categoryId),
        );
        setCategory(selected || null);
        setCourses(
          courseItems.filter(
            (course) => String(course.categoryId || "") === String(categoryId),
          ),
        );
      })
      .catch(
        (requestError) =>
          active &&
          setError(
            getApiErrorMessage(requestError, "تعذر تحميل دورات التصنيف"),
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [categoryId]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return query
      ? courses.filter((course) =>
          `${course.title} ${course.instructor}`
            .toLocaleLowerCase("ar")
            .includes(query),
        )
      : courses;
  }, [courses, search]);
  const categoryName = category?.name?.ar || category?.name?.en || "التصنيف";

  return (
    <AdminLayout>
      <main dir="rtl" className="min-h-full space-y-4 bg-[#F5F7FB] p-4 sm:p-6">
        <nav
          className="flex flex-wrap items-center gap-2 text-sm text-[#667085]"
          aria-label="مسار الصفحة"
        >
          <Link to="/admin-dashboard" className="hover:text-[#123C91]">
            الرئيسية
          </Link>
          <ChevronLeft size={14} />
          <Link to="/admin/course-categories" className="hover:text-[#123C91]">
            التصنيفات
          </Link>
          <ChevronLeft size={14} />
          <span className="font-bold text-[#123C91]">{categoryName}</span>
        </nav>
        <header className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#1E55B3] p-6 text-white sm:p-8">
          <div className="absolute -left-10 -top-14 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm font-semibold text-[#8FE3D8]">
              تصنيف الدورات
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {categoryName}
            </h1>
            <p className="mt-2 text-sm text-white/75">
              كل الدورات المرتبطة بهذا التصنيف وحالتها الحالية.
            </p>
          </div>
        </header>
        <section className="overflow-hidden rounded-2xl border border-[#E3E9F2] bg-white py-0! shadow-xs">
          <div className="flex flex-col gap-3 border-b border-[#EEF1F5] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-extrabold text-[#17213A]">دورات التصنيف</h2>
              <p className="mt-1 text-xs text-[#98A2B3]">
                إجمالي {courses.length} دورة
              </p>
            </div>
            <label className="relative sm:w-80">
              <Search
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث عن دورة أو محاضر..."
                className="h-11 w-full rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] pr-10 pl-3 text-sm outline-none focus:border-[#123C91]"
              />
            </label>
          </div>
          {loading ? (
            <State>
              <LoaderCircle size={34} className="animate-spin text-[#123C91]" />
            </State>
          ) : error ? (
            <State>
              <span className="text-red-700">{error}</span>
            </State>
          ) : visible.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-right text-sm">
                <thead className="bg-[#F8FAFC] text-xs text-[#667085]">
                  <tr>
                    <th className="px-5 py-4">الدورة</th>
                    <th className="px-5 py-4">المحاضر</th>
                    <th className="px-5 py-4">المستوى</th>
                    <th className="px-5 py-4 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F5]">
                  {visible.map((course) => (
                    <tr key={course.id} className="hover:bg-[#FAFCFF]">
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="inline-flex items-center gap-2 font-bold text-[#123C91] hover:underline"
                        >
                          <BookOpen size={17} />
                          {course.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[#475467]">
                        {course.instructor || "—"}
                      </td>
                      <td className="px-5 py-4 text-[#667085]">
                        {course.level || "—"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(course.rawStatus)}`}
                        >
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <State>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF4FF] text-[#123C91]">
                <Tags size={27} />
              </span>
              <h2 className="font-bold text-[#17213A]">
                لا توجد دورات في هذا التصنيف
              </h2>
              <p className="text-sm">
                ستظهر هنا الدورات فور إضافتها إلى التصنيف.
              </p>
            </State>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}

const State = ({ children }) => (
  <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 py-12 text-center text-[#667085]">
    {children}
  </div>
);
