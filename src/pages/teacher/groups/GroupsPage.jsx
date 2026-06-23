import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit3, Users, Calendar, ChevronRight, ChevronLeft } from "lucide-react";

import GroupStatsBar from "../../../components/teacher/groups/GroupStatsBar";
import GroupCard from "../../../components/teacher/groups/GroupCard";
// import CreateGroupModal from "../../../components/teacher/groups/CreateGroupPage";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";

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

// ─── Page Component ──────────────────────────────────────────────────────────
const GroupsPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;


  const totalPages = Math.ceil(MOCK_GROUPS.length / itemsPerPage);
  const paginatedGroups = MOCK_GROUPS.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSuccess = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold">
            ✓ تم إنشاء مجموعتك بنجاح !
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">مجموعاتك التعليمية</h1>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              استعرض جميع مجموعاتك الدراسية، ونظّم الحصص والمهام والاختبارات.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-new-group")}
            className="w-40 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-[22px] hover:bg-[#0e2d6b] transition-all"
          >
            إنشاء مجموعة
          </button>
        </div>

        <div className="mb-6">
          <GroupStatsBar />
        </div>

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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-sm text-gray-500 mt-6">
          <span>عرض {paginatedGroups.length} من أصل {MOCK_GROUPS.length} مجموعة</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === n ? "bg-[#123C91] text-white" : "border border-gray-200 hover:bg-gray-50"}`}>
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* {showModal && (
          <CreateGroupModal
            onClose={() => setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )} */}
      </div>
    </TeacherLayout>
  );
};

export default GroupsPage;