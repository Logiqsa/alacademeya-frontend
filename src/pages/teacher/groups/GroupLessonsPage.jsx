import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LessonStatsBar from "../../../components/teacher/groups/lessons/LessonStatsBar";
import LessonsTable from "../../../components/teacher/groups/lessons/LessonsTable";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import Pagination from "../../../components/teacher/groups/lessons/Paginationn";


// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LESSONS = [
  { id: 1, title: "المصفوفات_2", date: "السبت 21 يونيو 2026", time: "06:00 PM", duration: 45, attendance: null, absence: null, status: "قادمة" },
  { id: 2, title: "المصفوفات_1", date: "غداً 18 يونيو 2026", time: "08:30 PM", duration: 40, attendance: null, absence: null, status: "قادمة" },
  { id: 3, title: "التبادليل والتوافيق", date: "اليوم 17 يونيو 2026", time: "06:00 PM", duration: 60, attendance: 21, absence: 1, status: "مباشر الآن" },
  { id: 4, title: "المتتاليات", date: "السبت 24 مايو 2026", time: "05:30 PM", duration: 50, attendance: null, absence: null, status: "ملغية" },
  { id: 5, title: "العدد الأولى", date: "السبت 24 مايو 2026", time: "11:00 AM", duration: 40, attendance: 19, absence: 3, status: "منتهية" },
  { id: 6, title: "القيل الحسابي", date: "السبت 24 مايو 2026", time: "06:00 PM", duration: 60, attendance: 22, absence: 0, status: "منتهية" },
];

// const Pagination = ({ page, totalPages, onChange, totalItems, displayedCount }) => {
//   return (
//     <div className="flex items-center justify-between px-2 py-6 text-sm text-gray-500 w-full" dir="ltr">
//       {/* الأزرار على اليسار */}
//       <div className="flex items-center gap-1">
//         <button 
//           onClick={() => onChange(Math.max(1, page - 1))}
//           disabled={page === 1}
//           className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all"
//         >
//           <HiChevronRight size={20} />
//         </button>

//         {[...Array(totalPages)].map((_, i) => (
//           <button 
//             key={i + 1} 
//             onClick={() => onChange(i + 1)}
//             className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
//               page === i + 1 
//                 ? "bg-[#1F2937] text-white shadow-sm" 
//                 : "border border-gray-200 hover:bg-gray-100 text-gray-600"
//             }`}
//           >
//             {i + 1}
//           </button>
//         ))}

//         <button 
//           onClick={() => onChange(Math.min(totalPages, page + 1))}
//           disabled={page === totalPages}
//           className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all"
//         >
//           <HiChevronLeft size={20} />
//         </button>
//       </div>

//       {/* النص على اليمين */}
//       <span className="font-medium text-gray-500">
//         عرض {displayedCount} من اصل {totalItems} حصة
//       </span>
//     </div>
//   );
// };

// ─── Page ─────────────────────────────────────────────────────────────────────
const GroupLessonsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [search] = useState("");
  const [filterStatus] = useState("جميع الحالات");

  const [page, setPage] = useState(1);



  const ITEMS_PER_PAGE = 5;


  const filtered = MOCK_LESSONS.filter(
    (l) =>
      l.title.includes(search) &&
      (filterStatus === "جميع الحالات" || l.status === filterStatus)
  );


  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedLessons = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
        <div className="mt-4">
          <LessonsTable
            lessons={paginatedLessons}
            onView={(id) => console.log("view", id)}
            onEdit={(id) => console.log("edit", id)}
            onDelete={(id) => console.log("delete", id)}
          />
        </div>


        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length} 
          displayedCount={paginatedLessons.length} 
          onChange={(p) => setPage(p)}
        />

      </div>

    </TeacherLayout>
  );
};

export default GroupLessonsPage;