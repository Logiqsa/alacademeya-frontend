import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import GroupStatsBar from "../../../components/teacher/groups/GroupStatsBar";
import GroupCard from "../../../components/teacher/groups/GroupCard";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import Pagination from "../../../components/teacher/groups/Pagination";

// ─── Data ────────────────────────────────────────────────────────────────────
const MOCK_GROUPS = [
  { id: 1, name: "مجموعة الرياضيات A", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 2, name: "مجموعة الرياضيات B", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "معلقة", enrolled: 22, max: 30, nextLesson: "هذه المجموعة غير نشطة حالياً" },
  { id: 3, name: "مجموعة الرياضيات C", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "قيد التسجيل", enrolled: 22, max: 30, nextLesson: "التسجيل مفتوح" },
  { id: 4, name: "مجموعة الرياضيات D", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 5, name: "مجموعة الرياضيات E", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 6, name: "مجموعة الرياضيات F", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 7, name: "مجموعة الرياضيات G", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
];

const ITEMS_PER_PAGE = 6;

// ─── Page Component ──────────────────────────────────────────────────────────
const GroupsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const paginatedGroups = MOCK_GROUPS.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
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
              استعرض جميع مجموعاتك الدراسية، ونظّم الحصص والمهام والاختبارات.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-new-group")}
            className="w-full sm:w-40 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5 hover:bg-[#0e2d6b] transition-all shrink-0"
          >
            إنشاء مجموعة
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <GroupStatsBar />
        </div>

        {/* Groups grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedGroups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onViewLessons={(id) => navigate(`/teacher/groups/${id}/lessons`)}
              onViewStudents={(id) => navigate(`/teacher/groups/${id}/students`)}
              onEdit={(id) => console.log("edit", id)}
              onDelete={(id) => console.log("delete", id)}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination page={page} totalItems={MOCK_GROUPS.length} itemsPerPage={ITEMS_PER_PAGE} onChange={setPage} />
      </div>
    </TeacherLayout>
  );
};

export default GroupsPage;