import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import GroupStatsBar from "../../../components/teacher/groups/GroupStatsBar";
import GroupCard from "../../../components/teacher/groups/GroupCard";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import Pagination from "../../../components/teacher/groups/Pagination";
import LoadingState from "../../../components/shared/LoadingState";
import {
  getMyClassrooms,
  getAllSubjects,
  getAllGrades,
  deleteClassroom,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك

const ITEMS_PER_PAGE = 6;

// ⚠️ عدّل القيم دي لو الباك إند بيرجع أسماء status مختلفة
const STATUS_LABELS = {
  active: "نشطة",
  paused: "معلقة",
  pending: "قيد التسجيل",
  full: "مكتملة العدد",
  completed: "منتهية",
};

// اسم الحقل ممكن يكون نص عادي أو object {ar, en}
const resolveName = (val) => {
  if (!val) return "--";
  if (typeof val === "string") return val;
  return val.ar || val.en || "--";
};

// ─── Page Component ──────────────────────────────────────────────────────────
const GroupsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(false);
  const [page, setPage] = useState(1);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classroomsRes, subjectsRes, gradesRes] = await Promise.all([
        getMyClassrooms({ type: "group" }),
        getAllSubjects(),
        getAllGrades(),
      ]);

      const subjects = subjectsRes.data?.data || [];
      const grades = gradesRes.data?.data || [];
      const rawClassrooms = classroomsRes.data?.data || [];

      const subjectMap = Object.fromEntries(
        subjects.map((s) => [s.id, resolveName(s.name)]),
      );
      const gradeMap = Object.fromEntries(
        grades.map((g) => [g.id, resolveName(g.name)]),
      );

      // لو الحقل جه كـ object كامل (populated من الباك إند) نجيب اسمه مباشرة
      // لو جه كـ id string نبحث عنه في الـ map
      const resolveField = (field, map) => {
        if (!field) return "--";
        if (typeof field === "object") return resolveName(field.name) || "--";
        return map[field] || "--";
      };

      const resolveTeacher = (teacher) => {
        if (!teacher) return "—";
        if (typeof teacher === "string") return teacher;
        return (
          resolveName(teacher?.user?.fullName) ||
          resolveName(teacher?.user?.name) ||
          resolveName(teacher?.fullName) ||
          resolveName(teacher?.name) ||
          "—"
        );
      };

      const resolveTeacherId = (teacher) => {
        if (!teacher) return null;
        if (typeof teacher === "string") return teacher;
        return teacher?.id || teacher?._id || teacher?.user?.id || teacher?.user?._id || null;
      };

      const mapped = rawClassrooms.map((c) => {
        const enrolled = c.students?.length || 0;
        const capacity = c.capacity || 0;
        const nextLessonText = c.nextSession?.date
          ? `الحصة القادمة: ${new Date(c.nextSession.date).toLocaleDateString("ar-EG")}`
          : c.status === "paused"
            ? "هذه المجموعة غير نشطة حالياً"
            : c.status === "pending"
              ? "التسجيل مفتوح"
              : "لا توجد حصص قادمة حالياً";
        const teacherName = resolveTeacher(c.teacher);
        const teacherId = resolveTeacherId(c.teacher) || c.teacherId || null;
        const subjectId =
          typeof c.subject === "string"
            ? c.subject
            : c.subject?.id || c.subject?._id || null;
        const classroomType = ["private", "group"].includes(c.type)
          ? c.type
          : "group";

        return {
          id: c.id,
          name: resolveName(c.name),
          grade: resolveField(c.grade, gradeMap),
          subject: resolveField(c.subject, subjectMap),
          status: STATUS_LABELS[c.status] || c.status,
          enrolled,
          max: capacity,
          nextLesson: nextLessonText,
          teacher: teacherName,
          teacherId,
          subjectId,
          classroomType,
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

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      window.history.replaceState({}, document.title);
      // بعد إنشاء مجموعة جديدة بنجاح، نعيد تحميل القائمة عشان تظهر فورًا
      fetchGroups();
    }
  }, [location, fetchGroups]);

  const totalPages = Math.max(1, Math.ceil(groups.length / ITEMS_PER_PAGE));
  const paginatedGroups = groups.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleDelete = async (id) => {
    try {
      await deleteClassroom(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "تعذر حذف المجموعة");
    }
  };

  return (
    <TeacherLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-semibold text-center w-[90%] sm:w-auto">
            ✓ تم إنشاء مجموعتك بنجاح !
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              مجموعاتك التعليمية
            </h1>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              استعرض جميع مجموعاتك الدراسية، ونظّم الحصص والمهام.
            </p>
          </div>
          {/* <button
            onClick={() => navigate("/add-new-group")}
            className="w-full sm:w-40 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5 hover:bg-[#0e2d6b] transition-all shrink-0"
          >
            إنشاء مجموعة
          </button> */}
        </div>

        {/* Stats */}
        <div className="mb-6">
          <GroupStatsBar
            total={groups.length}
            active={groups.filter((g) => g.status === "نشطة").length}
          />
        </div>

        {/* Groups grid */}
        {/* Pagination */}
        {!loading && !error && groups.length > 0 && (
          <Pagination
            page={page}
            totalItems={groups.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onChange={setPage}
          />
        )}

        {loading ? (
          <LoadingState
            label="جاري تحميل المجموعات..."
            className="rounded-2xl border border-gray-200 bg-white"
          />
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-10 text-[#575F69] bg-white rounded-2xl border border-gray-200">
            لا توجد مجموعات بعد، ابدأ بإنشاء مجموعتك الأولى.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedGroups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onViewLessons={() =>
                  navigate(`/teacher/groups/${g.id}/lessons`, {
                    state: {
                      groupName: g.name,
                      groupTeacher: g.teacher,
                      groupTeacherId: g.teacherId,
                      groupSubjectId: g.subjectId,
                      classroomType: g.classroomType,
                    },
                  })
                }
                onViewStudents={(id) =>
                  navigate(`/teacher/groups/${id}/students`)
                }
                onOpenChat={(group) =>
                  navigate(
                    `/teacher/messages?classroom=${encodeURIComponent(group.id)}&name=${encodeURIComponent(group.name)}`,
                    {
                      state: {
                        openClassroomId: group.id,
                        openClassroomName: group.name,
                      },
                    }
                  )
                }
                onEdit={(id) => navigate(`/teacher/groups/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};

export default GroupsPage;
