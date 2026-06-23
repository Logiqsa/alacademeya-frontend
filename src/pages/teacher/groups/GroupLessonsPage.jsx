import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LessonStatsBar from "../../../components/teacher/groups/lessons/LessonStatsBar";
import LessonsTable from "../../../components/teacher/groups/lessons/LessonsTable";
import CreateLessonModal from "../../../components/teacher/groups/lessons/CreateLessonModal";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LESSONS = [
  { id: 1, title: "المصفوفات_2", date: "السبت 21 يونيو 2026", time: "06:00 PM", duration: 45, attendance: null, absence: null, status: "قادمة" },
  { id: 2, title: "المصفوفات_1", date: "غداً 18 يونيو 2026", time: "08:30 PM", duration: 40, attendance: null, absence: null, status: "قادمة" },
  { id: 3, title: "التبادليل والتوافيق", date: "اليوم 17 يونيو 2026", time: "06:00 PM", duration: 60, attendance: 21, absence: 1, status: "مباشر الآن" },
  { id: 4, title: "المتتاليات", date: "السبت 24 مايو 2026", time: "05:30 PM", duration: 50, attendance: null, absence: null, status: "ملغية" },
  { id: 5, title: "العدد الأولى", date: "السبت 24 مايو 2026", time: "11:00 AM", duration: 40, attendance: 19, absence: 3, status: "منتهية" },
  { id: 6, title: "القيل الحسابي", date: "السبت 24 مايو 2026", time: "06:00 PM", duration: 60, attendance: 22, absence: 0, status: "منتهية" },
];

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, onChange }) => (
  <div className="flex items-center justify-between text-sm text-gray-500">
    <span>عرض 6 من اصل 12 حصة</span>
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
const GroupLessonsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الأوقات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_LESSONS.filter(
    (l) =>
      l.title.includes(search) &&
      (filterStatus === "جميع الحالات" || l.status === filterStatus)
  );

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">مجموعة الرياضيات A</h3>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة كاملة لحصص هذه المجموعة: الجدول، الواجبات، والتقييمات في مكان واحد.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-new-lesson")}
            className="w-40 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5 "          >
            إنشاء حصة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <LessonStatsBar />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <LessonFilters />
        </div>

        {/* Table */}
        {/* <div className="mb-4">
          <LessonsTable
            lessons={filtered}
            onView={(id) => console.log("view lesson", id)}
            onEdit={(id) => console.log("edit lesson", id)}
            onDelete={(id) => console.log("delete lesson", id)}
          />
        </div> */}

        {/* Pagination */}
        {/* <Pagination page={page} onChange={setPage} /> */}

        {/* Modal */}
        {showModal && (
          <CreateLessonModal
            onClose={() => setShowModal(false)}
            onSuccess={(data) => console.log("new lesson", data)}
          />
        )}
      </div>

    </TeacherLayout>
  );
};

export default GroupLessonsPage;