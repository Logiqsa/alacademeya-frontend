import { useState } from "react";
import { useNavigate } from "react-router-dom";

import GroupStatsBar from "../../../components/teacher/groups/GroupStatsBar";
import GroupCard from "../../../components/teacher/groups/GroupCard";
import CreateGroupModal from "../../../components/teacher/groups/CreateGroupPage";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";

// ─── Mock Data (استبدليها بـ API call) ───────────────────────────────────────
const MOCK_GROUPS = [
  { id: 1, name: "مجموعة الرياضيات A", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 2, name: "مجموعة الرياضيات B", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "معلقة", enrolled: 22, max: 30, nextLesson: "هذه المجموعة غير نشطة حالياً" },
  { id: 3, name: "مجموعة الرياضيات C", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "قيد التسجيل", enrolled: 22, max: 30, nextLesson: "التسجيل مفتوح" },
  { id: 4, name: "مجموعة الرياضيات A", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 5, name: "مجموعة الرياضيات A", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
  { id: 6, name: "مجموعة الرياضيات A", grade: "الصف الثالث الثانوي", subject: "رياضيات", status: "نشطة", enrolled: 22, max: 30, nextLesson: "الحصة القادمة غداً" },
];

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, onChange }) => (
  <div className="flex items-center justify-between text-sm text-gray-500">
    <span>عرض 6 من اصل {total} مجموعة</span>
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(1, page - 1))}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {[1, 2].map((n) => (
        <button key={n} onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === n ? "bg-[#1F2937] text-white" : "border border-gray-200 hover:bg-gray-100"}`}>
          {n}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(2, page + 1))}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const GroupsPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(false);
  const [page, setPage] = useState(1);

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

        {/* Header */}

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">مجموعاتك التعليمية</h1>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              استعرض جميع مجموعاتك الدراسية، ونظّم الحصص والمهام والاختبارات، وتابع مستوى الطلاب وإنجازاتهم بكل سهولة.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-new-group")}
            className="w-40 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5 "
          >
            إنشاء مجموعة
          </button>

        </div>

        {/* Stats */}
        <div className="mb-6">
          <GroupStatsBar />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {MOCK_GROUPS.map((g) => (
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
        <Pagination page={page} total={12} onChange={setPage} />

        {/* Modal */}
        {showModal && (
          <CreateGroupModal
            onClose={() => setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default GroupsPage;