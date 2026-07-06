import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import GroupsFilters from "../../../components/admin/groups/Groupsfilters";
import GroupTable from "../../../components/admin/groups/Groupstable";
import GroupsStatsBar from "../../../components/admin/groups/Groupsstatsbar";
import {
  getClassrooms,
  getAllSubjects,
  getAllGrades,
  getStage,
  getUser,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك

const PAGE_SIZE = 6;

// ⚠️ عدّل القيم دي لو الباك إند بيرجع أسماء status مختلفة
const STATUS_LABELS = {
  active: "نشطة",
  full: "مكتملة العدد",
  pending: "قيد التسجيل",
  paused: "متوقفة",
  completed: "منتهية",
};

const SUBJECT_FILTER_OPTIONS = [
  "جميع المواد",
  "رياضيات",
  "علوم",
  "لغة عربية",
  "لغة إنجليزية",
];

const GroupsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("جميع المواد");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // نجيب الـ lookups والـ classrooms مع بعض
      const [classroomsRes, subjectsRes, gradesRes] = await Promise.all([
        getClassrooms({ type: "group" }),
        getAllSubjects(),
        getAllGrades(),
      ]);

      const subjects = subjectsRes.data?.data || [];
      const grades = gradesRes.data?.data || [];
      const rawClassrooms = classroomsRes.data?.data || [];

      const subjectMap = Object.fromEntries(
        subjects.map((s) => [s.id, s.name?.ar || s.name]),
      );
      const gradeMap = Object.fromEntries(
        grades.map((g) => [g.id, g.name?.ar || g.name]),
      );

      // مفيش endpoint بيرجع كل المراحل مرة واحدة (getCurriculumStages بياخد curriculum id)
      // فبنجيب اسم كل مرحلة فريدة (unique) موجودة في المجموعات عن طريق /stages/{id}
      const uniqueStageIds = [
        ...new Set(rawClassrooms.map((c) => c.stage).filter(Boolean)),
      ];

      const stageEntries = await Promise.all(
        uniqueStageIds.map(
          (id) =>
            getStage(id)
              .then((res) => [
                id,
                res.data?.data?.name?.ar || res.data?.data?.name || id,
              ])
              .catch(() => [id, id]), // لو فشل الريكوست، نرجع نعرض الـ id كـ fallback بدل ما نكسر الصفحة
        ),
      );
      const stageMap = Object.fromEntries(stageEntries);

      // نفس الفكرة بالظبط للمعلم: classrooms ممكن ترجع teacher كـ id خام
      // بدل object فيه fullName، فبنجيب اسم كل معلم فريد عن طريق /users/{id}
      const uniqueTeacherIds = [
        ...new Set(
          rawClassrooms
            .map((c) =>
              typeof c.teacher === "string"
                ? c.teacher
                : c.teacher?.id || c.teacher?._id,
            )
            .filter(Boolean),
        ),
      ];

      const teacherEntries = await Promise.all(
        uniqueTeacherIds.map((id) =>
          getUser(id)
            .then((res) => [
              id,
              res.data?.data?.fullName ||
                res.data?.data?.user?.fullName ||
                null,
            ])
            .catch(() => [id, null]),
        ),
      );
      const teacherMap = Object.fromEntries(teacherEntries);

      // اسم المجموعة نفسه ممكن يكون نص عادي أو object {ar, en} زي باقي الحقول
      const resolveName = (val) => {
        if (!val) return "--";
        if (typeof val === "string") return val;
        return val.ar || val.en || "--";
      };

      const mapped = rawClassrooms.map((c) => {
        const teacherId =
          typeof c.teacher === "string"
            ? c.teacher
            : c.teacher?.id || c.teacher?._id;
        return {
          id: c.id,
          name: resolveName(c.name),
          teacher:
            c.teacher?.user?.fullName ||
            c.teacher?.fullName ||
            teacherMap[teacherId] ||
            null,
          // fallback: لو الماده/الصف مش لاقيينها في الـ map، نجرب نجيبها من بيانات المعلم نفسه
          subject:
            subjectMap[c.subject] ||
            c.teacher?.subjects?.find((s) => s.id === c.subject)?.name?.ar ||
            "--",
          grade:
            gradeMap[c.grade] ||
            c.teacher?.grades?.find((g) => g.id === c.grade)?.name?.ar ||
            "--",
          stage: stageMap[c.stage] || c.stage || "--",
          enrolled: c.students?.length || 0,
          capacity: c.capacity,
          status: STATUS_LABELS[c.status] || c.status,
        };
      });

      setGroups(mapped);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filtered = groups.filter(
    (g) =>
      (g.name?.includes(search) ||
        (g.teacher ?? "").includes(search) ||
        g.subject.includes(search)) &&
      (filterSubject === "جميع المواد" || g.subject === filterSubject) &&
      (filterStatus === "جميع الحالات" || g.status === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedGroups = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = {
    paused: groups.filter((g) => g.status === "متوقفة").length,
    active: groups.filter((g) => g.status === "نشطة").length,
    full: groups.filter((g) => g.status === "مكتملة العدد").length,
    total: groups.length,
  };

  return (
    <AdminLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              إدارة المجموعات
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              مراقبة وإدارة المجموعات الدراسية على المنصة.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/groups/new")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إنشاء مجموعة
          </button>
        </div>

        <div className="mb-6">
          <GroupsStatsBar {...stats} />
        </div>

        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <GroupsFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterSubject={filterSubject}
            onFilterSubjectChange={(v) => {
              setFilterSubject(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10 text-[#575F69]">
              جارٍ التحميل...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <GroupTable groups={paginatedGroups} />
          )}
        </div>

        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedGroups.length}
          unitLabel="مجموعة"
        />
      </div>
    </AdminLayout>
  );
};

export default GroupsPage;
