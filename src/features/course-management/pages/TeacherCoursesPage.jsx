import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  GraduationCap,
  Eye,
  LoaderCircle,
  Plus,
  Search,
  Share2,
  SquarePen,
  Star,
  Trash2,
} from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import { AuthContext } from "../../../context/AuthContext";
import CoursesStatusBar from "../components/CoursesStatusBar";
import {
  deleteTeacherCourse,
  fetchTeacherCourses,
  removeTeacherCourse,
} from "../api/coursesApi";
import { confirmToast } from "../../../utils/confirmToast";
import { getMyInstructorProfile } from "../../../services/APIService";
import {
  getApiErrorMessage,
  normalizeApiError,
} from "../../../services/apiError";
import { getEarningsCourses } from "../../instructor-earnings/api/earningsApi";
import { courseStatusStyles } from "../utils/courseStatusStyles";

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("ar-EG")} جنيه`;

const CourseActionsMenu = ({ position, courseStatus, onAction, onClose }) => (
  <>
    <button
      type="button"
      aria-label="إغلاق قائمة الإجراءات"
      onClick={onClose}
      className="fixed inset-0 z-40 cursor-default"
    />
    <div
      dir="rtl"
      role="menu"
      className="fixed z-50 w-37.5 overflow-hidden rounded-xl bg-[#1F2937] py-2 text-right text-sm text-white shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      {[
        {
          action: "edit",
          label:
            courseStatus === "rejected" ? "تعديل وإعادة الإرسال" : "تعديل",
          icon: SquarePen,
          show: ["draft", "rejected"].includes(courseStatus),
        },
        {
          action: "share",
          label: "مشاركة",
          icon: Share2,
          show: courseStatus === "published",
        },
      ]
        .filter((item) => item.show)
        .map(({ action, label, icon: Icon, danger }) => (
          <button
            type="button"
            role="menuitem"
            key={label}
            onClick={() => onAction(action)}
            className={`flex w-full items-center justify-start gap-2 px-4 py-2 text-right transition hover:bg-white/10 ${
              danger ? "hover:text-[#FFB4B4]" : ""
            }`}
          >
            <Icon size={15} className="shrink-0" />
            <span>{label}</span>
          </button>
        ))}
    </div>
  </>
);

const TeacherCoursesPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("الكل");
  const [sort, setSort] = useState("الأحدث");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [actionsMenu, setActionsMenu] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileState, setProfileState] = useState("loading");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const profileResponse = await getMyInstructorProfile();
        if (!active) return;
        const profileData =
          profileResponse?.data?.data ??
          profileResponse?.data ??
          profileResponse;
        const instructorProfile =
          profileData?.instructor || profileData?.profile || profileData;
        if (!instructorProfile?.id && !instructorProfile?._id) {
          setProfileState("missing");
          return;
        }
        setProfile(instructorProfile);
        setProfileState("ready");
        updateUser((currentUser) => ({
          ...currentUser,
          accountType: "instructor",
          instructorId: instructorProfile._id || instructorProfile.id,
          instructorStatus: instructorProfile.status,
          instructorProfileSlug: instructorProfile.profileSlug || "",
        }));
        const items = await fetchTeacherCourses();
        const earningsResult = await Promise.allSettled([getEarningsCourses()]);
        if (!active) return;

        const earningsByCourse = new Map();
        if (earningsResult[0].status === "fulfilled") {
          earningsResult[0].value.forEach((earning) => {
            const courseId = String(earning.id);
            const current = earningsByCourse.get(courseId) || 0;
            earningsByCourse.set(courseId, current + Number(earning.net || 0));
          });
        }

        setTeacherCourses(
          items.map((course) => ({
            ...course,
            revenue: earningsByCourse.has(String(course.id))
              ? earningsByCourse.get(String(course.id))
              : course.revenue,
          })),
        );
      } catch (error) {
        if (!active) return;
        const apiError = normalizeApiError(error);
        if (
          apiError.code === "INSTRUCTOR_PROFILE_NOT_FOUND" ||
          apiError.status === 404
        ) {
          setProfileState("missing");
        } else {
          setProfileState("error");
          toast.error(getApiErrorMessage(error, "تعذر تحميل صفحة دوراتي"));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [updateUser]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = teacherCourses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.category.toLowerCase().includes(normalizedSearch);
      const matchesStatus = status === "الكل" || course.status === status;
      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sort === "الأكثر طلابًا") return b.students - a.students;
      if (sort === "الأعلى ربحًا") return b.revenue - a.revenue;
      if (sort === "الاسم") return a.title.localeCompare(b.title, "ar");
      return teacherCourses.indexOf(a) - teacherCourses.indexOf(b);
    });
  }, [search, sort, status, teacherCourses]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));

  const safePage = Math.min(page, totalPages);

  const visibleCourses = filteredCourses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const publishedCount = teacherCourses.filter(
    (course) => course.status === "منشور",
  ).length;
  const pendingCount = teacherCourses.filter(
    (course) => course.status === "قيد المراجعة",
  ).length;
  const totalRevenue = teacherCourses.reduce(
    (sum, course) => sum + course.revenue,
    0,
  );

  const startItem =
    filteredCourses.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredCourses.length);

  const toggleActionsMenu = (event, courseId) => {
    if (actionsMenu?.courseId === courseId) {
      setActionsMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 150;
    setActionsMenu({
      courseId,
      top: rect.bottom + 6,
      left: Math.max(
        12,
        Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12),
      ),
    });
  };

  const handleAction = async (action, courseFromButton = null) => {
    const selectedCourse =
      courseFromButton ||
      teacherCourses.find(
        (course) => String(course.id) === String(actionsMenu?.courseId),
      );
    setActionsMenu(null);
    if (!selectedCourse) return;
    if (
      action === "edit" &&
      !["draft", "rejected"].includes(selectedCourse.rawStatus)
    ) {
      toast.error(
        selectedCourse.rawStatus === "pending_review"
          ? "لا يمكن تعديل الدورة أثناء مراجعتها. يمكن تعديلها بعد أن تعيدها الإدارة كمرفوضة."
          : "التعديل متاح للمسودة أو الدورة المرفوضة فقط.",
      );
      return;
    }

    if (action === "details") {
      navigate(`/teacher/courses/${selectedCourse.id}`);
      return;
    }
    if (action === "edit")
      navigate(`/teacher/courses/${selectedCourse.id}/edit`);
    if (action === "share") {
      if (selectedCourse.rawStatus !== "published") {
        toast.error("المشاركة متاحة للدورات المنشورة فقط.");
        return;
      }
      const url = `${window.location.origin}/courses/${selectedCourse.slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("تم نسخ رابط الدورة");
      } catch {
        toast.error("تعذر نسخ الرابط");
      }
    }
    if (action === "delete") {
      const permanentlyDeletableStatuses = [
        "draft",
        "pending_review",
        "rejected",
        "archived",
      ];
      if (permanentlyDeletableStatuses.includes(selectedCourse.rawStatus)) {
        const confirmed = await confirmToast({
          title: "حذف الدورة نهائيًا",
          message: `هل تريد حذف دورة «${selectedCourse.title}» نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`,
          confirmLabel: "حذف الدورة",
          danger: true,
        });
        if (!confirmed) return;
        const deletingToast = toast.loading("جاري حذف الدورة...");
        try {
          await deleteTeacherCourse(selectedCourse.id);
          setTeacherCourses((items) =>
            items.filter((course) => String(course.id) !== String(selectedCourse.id)),
          );
          toast.success("تم حذف الدورة بنجاح", { id: deletingToast });
        } catch (error) {
          toast.error(getApiErrorMessage(error, "تعذر حذف الدورة"), {
            id: deletingToast,
          });
        }
        return;
      }
      const archivableStatuses = ["published"];
      if (!archivableStatuses.includes(selectedCourse.rawStatus)) {
        toast.error(
          selectedCourse.rawStatus === "pending_review"
            ? "لا يمكن أرشفة الدورة وهي قيد المراجعة. انتظري قرار الإدارة أولاً."
            : "لا يمكن أرشفة هذه الدورة في حالتها الحالية.",
        );
        return;
      }
      const confirmed = await confirmToast({
        title: "أرشفة الدورة",
        message: `هل تريد أرشفة دورة «${selectedCourse.title}»؟ لا يمكن إلغاء الأرشفة من الواجهة الحالية.`,
        confirmLabel: "أرشفة الدورة",
        danger: true,
      });
      if (!confirmed) return;
      const deletingToast = toast.loading("جاري أرشفة الدورة...");
      try {
        await removeTeacherCourse(selectedCourse.id);
        setTeacherCourses((items) =>
          items.map((course) =>
            String(course.id) === String(selectedCourse.id)
              ? { ...course, rawStatus: "archived", status: "مؤرشف" }
              : course,
          ),
        );
        toast.success("تمت أرشفة الدورة بنجاح", { id: deletingToast });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "تعذر أرشفة الدورة"), {
          id: deletingToast,
        });
      }
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="grid min-h-[65vh] place-items-center">
          <LoaderCircle className="animate-spin text-[#123C91]" size={36} />
        </div>
      </TeacherLayout>
    );
  }

  if (profileState === "missing") {
    return (
      <TeacherLayout>
        <main
          dir="rtl"
          className="grid min-h-[68vh] place-items-center rounded-2xl bg-[#F7F9FC] p-5"
        >
          <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#DDE5F0] bg-white py-0! text-center shadow-[0_18px_55px_rgba(18,60,145,.08)]">
            <div className="h-2 bg-linear-to-l from-[#123C91] via-[#3567C8] to-[#12C6B0]" />
            <div className="p-8 sm:p-12">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[#EAF2FF] text-[#123C91]">
                <GraduationCap size={38} />
              </div>
              <p className="mt-6 text-sm font-bold text-[#12AFA0]">دوراتي</p>
              <h1 className="mt-2 text-2xl font-extrabold text-[#17213A]">
                لم تقدّم كمحاضر حتى الآن
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#667085]">
                أنشئ ملف المحاضر ووافق على اتفاقية تقديم المحتوى، وبعدها يمكنك
                إنشاء دوراتك ونشرها.
              </p>
              <button
                type="button"
                onClick={() => navigate("/instructor/onboarding")}
                className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-7 font-bold text-white shadow-sm transition hover:bg-[#0E327A]"
              >
                <GraduationCap size={19} />
                التقديم كمحاضر
              </button>
            </div>
          </section>
        </main>
      </TeacherLayout>
    );
  }

  if (profileState === "error") {
    return (
      <TeacherLayout>
        <div
          dir="rtl"
          className="rounded-2xl border bg-white p-10 text-center text-[#667085]"
        >
          تعذر تحميل صفحة دوراتي. حاول مرة أخرى.
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div
        dir="rtl"
        className="min-h-full rounded-xl bg-[#F7F8FC] p-3 text-right font-['IBM_Plex_Sans_Arabic'] sm:p-5"
      >
        {profile && (
          <section className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4! shadow-xs">
            <div>
              <p className="text-xs text-[#667085]">ملف المحاضر</p>
              <h1 className="mt-1 font-bold text-[#1F2937]">
                {profile.user?.fullName ||
                  profile.user?.username ||
                  "محاضر الأكاديمية"}
              </h1>
              <p className="mt-1 text-sm text-[#667085]">
                {profile.headline || "لم تتم إضافة عنوان مهني بعد"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {profile.status === "active" ? "نشط" : profile.status}
              </span>
              <Link
                to="/instructor/onboarding"
                className="rounded-lg bg-[#123C91] px-3 py-2 text-sm font-bold !text-white transition hover:bg-[#0E327A]"
              >
                تعديل الملف
              </Link>
            </div>
          </section>
        )}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-xl sm:text-[24px] leading-7 sm:leading-8 text-primary w-full text-right mb-2 sm:mb-4">
              إدارة الدورات
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base sm:-mt-3 px-1 sm:px-2">
              إنشاء وتعديل الدورات التعليمية
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/teacher/courses/new")}
            className="inline-flex h-10 w-full sm:w-fit items-center justify-center gap-2 rounded-md bg-[#123C91] px-5 text-sm font-semibold text-white transition hover:bg-[#0E327A]"
          >
            <Plus size={17} />
            دورة جديدة
          </button>
        </div>

        <div className="mb-4">
          <CoursesStatusBar
            total={teacherCourses.length}
            published={publishedCount}
            pending={pendingCount}
            revenue={totalRevenue}
          />
        </div>

        <div className="mb-4 grid gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-[minmax(220px,1fr)_200px_170px]">
          <label className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
            />
            <input
              dir="rtl"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث عن دورة..."
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-[#FAFAFA] pr-10 pl-3 text-sm outline-none transition focus:border-[#123C91]"
            />
          </label>

          <label className="relative">
            <select
              dir="rtl"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-sm text-[#475467] outline-none focus:border-[#123C91]"
            >
              <option value="الكل">كل التصنيفات والحالات</option>
              <option value="منشور">منشور</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مسودة">مسودة</option>
              <option value="مرفوض">مرفوض</option>
              <option value="مؤرشف">مؤرشف</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
              size={15}
            />
          </label>

          <label className="relative">
            <select
              dir="rtl"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full appearance-none rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-sm text-[#475467] outline-none focus:border-[#123C91]"
            >
              <option>الأحدث</option>
              <option>الأكثر طلابًا</option>
              <option>الأعلى ربحًا</option>
              <option>الاسم</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
              size={15}
            />
          </label>
        </div>

        {/* Desktop / Tablet table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <div className="overflow-x-auto">
            <table dir="rtl" className="w-full min-w-190 text-right">
              <thead className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                <tr className="text-xs font-medium text-[#667085]">
                  <th className="px-4 py-3">عنوان الدورة</th>
                  <th className="px-4 py-3">التصنيف</th>
                  <th className="px-4 py-3">الطلاب</th>
                  <th className="px-4 py-3">التقييم</th>
                  <th className="px-4 py-3">الأرباح</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {visibleCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="text-sm text-[#475467] transition hover:bg-[#FAFCFF]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md bg-[#EAF2FF] p-2 text-[#3567C8]">
                          <BookOpen size={18} />
                        </span>
                        <div className="min-w-0">
                          <Link
                            to={`/teacher/courses/${course.id}`}
                            className="font-semibold text-[#1F2937] transition hover:text-[#123C91] hover:underline"
                          >
                            {course.title}
                          </Link>
                          {course.rawStatus === "rejected" && course.rejectedReason && (
                            <p className="mt-1 max-w-80 truncate text-xs text-red-600" title={course.rejectedReason}>
                              سبب الرفض: {course.rejectedReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-medium text-[#3567C8]">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">{course.students}</td>
                    <td className="px-4 py-4">
                      {Number.isFinite(Number(course.rating)) ? (
                        <span
                          className="inline-flex items-center gap-1.5"
                          dir="ltr"
                        >
                          <Star
                            size={14}
                            className="fill-[#F5A623] text-[#F5A623]"
                            aria-hidden="true"
                          />
                          <span>{Number(course.rating).toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-[#98A2B3]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{formatMoney(course.revenue)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${courseStatusStyles[course.status] || courseStatusStyles['مسودة']}`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => handleAction("details", course)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#DCE3EC] text-[#123C91] transition hover:border-[#123C91] hover:bg-[#EEF4FF]" aria-label={`عرض تفاصيل ${course.title}`} title="عرض التفاصيل"><Eye size={17} /></button>
                        {["draft", "pending_review", "rejected", "published", "archived"].includes(course.rawStatus) && <button type="button" onClick={() => handleAction("delete", course)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50" aria-label={`${course.rawStatus === "published" ? "أرشفة" : "حذف"} ${course.title}`} title={course.rawStatus === "published" ? "أرشفة الدورة" : "حذف الدورة نهائيًا"}><Trash2 size={17} /></button>}
                        {["draft", "rejected", "published"].includes(course.rawStatus) && <button type="button" aria-label={`إجراءات إضافية ${course.title}`} aria-expanded={actionsMenu?.courseId === course.id} onClick={(event) => toggleActionsMenu(event, course.id)} className="grid h-9 w-9 place-items-center rounded-lg text-[#475467] hover:bg-[#EEF2F6]" title="إجراءات إضافية"><EllipsisVertical size={17} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && visibleCourses.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-[#667085]">
              {teacherCourses.length
                ? "لا توجد دورات مطابقة للبحث"
                : "لا توجد دورات بعد. أنشئ مسودتك الأولى للبدء."}
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {visibleCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-lg border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="rounded-md bg-[#EAF2FF] p-2 text-[#3567C8] shrink-0">
                    <BookOpen size={18} />
                  </span>
                  <Link
                    to={`/teacher/courses/${course.id}`}
                    className="font-semibold text-[#1F2937] text-sm transition hover:text-[#123C91] hover:underline break-words"
                  >
                    {course.title}
                  </Link>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => handleAction("details", course)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#DCE3EC] text-[#123C91]" aria-label={`عرض تفاصيل ${course.title}`}><Eye size={17} /></button>
                  {["draft", "pending_review", "rejected", "published", "archived"].includes(course.rawStatus) && <button type="button" onClick={() => handleAction("delete", course)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600" aria-label={`${course.rawStatus === "published" ? "أرشفة" : "حذف"} ${course.title}`} title={course.rawStatus === "published" ? "أرشفة الدورة" : "حذف الدورة نهائيًا"}><Trash2 size={17} /></button>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-medium text-[#3567C8]">
                  {course.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${courseStatusStyles[course.status] || courseStatusStyles['مسودة']}`}
                >
                  {course.status}
                </span>
              </div>

              {course.rawStatus === "rejected" && course.rejectedReason && (
                <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs leading-6 text-red-700">
                  <strong>سبب الرفض:</strong> {course.rejectedReason}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center border-t border-[#F1F2F4] pt-3">
                <div>
                  <p className="text-[11px] text-[#8C9198] mb-0.5">الطلاب</p>
                  <p className="text-sm font-medium text-[#475467]">
                    {course.students}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8C9198] mb-0.5">التقييم</p>
                  {Number.isFinite(Number(course.rating)) ? (
                    <span
                      className="inline-flex items-center justify-center gap-1 text-sm font-medium text-[#475467]"
                      dir="ltr"
                    >
                      <Star
                        size={12}
                        className="fill-[#F5A623] text-[#F5A623]"
                        aria-hidden="true"
                      />
                      {Number(course.rating).toFixed(1)}
                    </span>
                  ) : (
                    <p className="text-sm text-[#98A2B3]">—</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#8C9198] mb-0.5">الأرباح</p>
                  <p className="text-sm font-medium text-[#475467] break-words">
                    {formatMoney(course.revenue)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {visibleCourses.length === 0 && (
            <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-12 text-center text-sm text-[#667085]">
              لا توجد دورات مطابقة للبحث
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-right">
            عرض {startItem}–{endItem} من أصل {filteredCourses.length} دورة
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <label className="flex items-center gap-2">
              <span>عرض في الصفحة</span>
              <select
                dir="rtl"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-md border border-[#D0D5DD] bg-white px-2 outline-none focus:border-[#123C91]"
              >
                {[5, 10, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <nav
              aria-label="صفحات الدورات"
              className="flex flex-wrap items-center justify-center gap-1"
              dir="rtl"
            >
              <button
                type="button"
                aria-label="الصفحة السابقة"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="grid h-8 w-8 place-items-center rounded-md border border-[#D0D5DD] bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 min-w-8 rounded-md border px-2 font-semibold ${
                      safePage === pageNumber
                        ? "border-[#123C91] bg-[#123C91] text-white"
                        : "border-[#D0D5DD] bg-white text-[#344054]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="الصفحة التالية"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="grid h-8 w-8 place-items-center rounded-md border border-[#D0D5DD] bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
            </nav>
          </div>
        </div>

        {actionsMenu && (
          <CourseActionsMenu
            position={actionsMenu}
            courseStatus={
              teacherCourses.find(
                (course) => String(course.id) === String(actionsMenu.courseId),
              )?.rawStatus
            }
            onAction={handleAction}
            onClose={() => setActionsMenu(null)}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherCoursesPage;
