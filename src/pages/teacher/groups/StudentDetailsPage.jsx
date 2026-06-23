import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENT = {
  id: 1,
  name: "محمد أحمد",
  level: "المستوى الثالث الثانوي",
  totalLessons: 22,
  attendanceCount: 18,
  absenceCount: 4,
  homeworkDone: 24,
  homeworkTotal: 25,
  lessons: [
    { id: 1, title: "المصفوفات_2",     date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "تم التسليم", grade: "19/20",    gradeStatus: "مكتمل",        examGrade: "19/20" },
    { id: 2, title: "المصفوفات_1",     date: "21 يونيو 2026", attendance: "غائب", homeworkStatus: "تم التسليم", grade: "19/20",    gradeStatus: "قيد الانتظار", examGrade: "لم يتم التصحيح" },
    { id: 3, title: "المتتاليات",      date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "تم تسليم",  grade: "—",       gradeStatus: "مكتمل",        examGrade: "19/20" },
    { id: 4, title: "العدد الأولى",    date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "تم التسليم", grade: "19/20",    gradeStatus: "لايوجد اختبار", examGrade: "—" },
    { id: 5, title: "القيل الحسابي",  date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "لا يوجد واجب", grade: "19/20", gradeStatus: "مكتمل",        examGrade: "19/20" },
  ],
};

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green:  "bg-green-100 text-green-700",
    red:    "bg-red-100 text-red-600",
    blue:   "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-500",
    gray:   "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}>
      {label}
    </span>
  );
};

const attendanceBadge  = (v) => v === "حاضر"  ? <Badge label={v} type="green" /> : <Badge label={v} type="red" />;

const homeworkBadge = (v) => {
  if (v === "تم التسليم" || v === "تم تسليم") return <Badge label={v} type="green" />;
  if (v === "لا يوجد واجب") return <Badge label={v} type="gray" />;
  return <Badge label={v} type="orange" />;
};

const gradeBadge = (v) => {
  if (v === "مكتمل")          return <Badge label={v} type="green" />;
  if (v === "قيد الانتظار")   return <Badge label={v} type="orange" />;
  if (v === "لايوجد اختبار")  return <Badge label={v} type="gray" />;
  return <Badge label={v} type="gray" />;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudentDetailsPage = () => {
  const { groupId, studentId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("جميع الحالات");
  const [sortBy, setSort]           = useState("تاريخ الإنضمام");
  const [page, setPage]             = useState(1);

  const s = MOCK_STUDENT;
  const filtered = s.lessons.filter(l => l.title.includes(search));

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Breadcrumb */}
      <button onClick={() => navigate(`/teacher/groups/${groupId}/students`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        الطالب
      </button>

      {/* Student header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{s.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{s.level}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الحصص",   value: s.totalLessons,   color: "text-blue-600",   bg: "bg-blue-50",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          { label: "عدد مرات الحضور", value: s.attendanceCount, color: "text-green-600",  bg: "bg-green-50",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: "عدد مرات الغياب", value: s.absenceCount,   color: "text-red-500",    bg: "bg-red-50",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: "الواجبات",         value: `${s.homeworkDone}/${s.homeworkTotal}`, color: "text-purple-600", bg: "bg-purple-50",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {stat.icon}
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن طالب..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select value={filterStatus} onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option>جميع الحالات</option>
          <option>حاضر</option><option>غائب</option>
        </select>
        <select value={sortBy} onChange={e => setSort(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option>تاريخ الإنضمام</option>
          <option>الحضور</option><option>الدرجة</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["اسم الحصة", "التاريخ", "الحضور", "حالة الواجب", "الدرجة", "حالة الاختبار", "درجة الاختبار"].map(h => (
                <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lesson, i) => (
              <tr key={lesson.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                <td className="px-4 py-3 font-medium text-gray-800">{lesson.title}</td>
                <td className="px-4 py-3 text-gray-600">{lesson.date}</td>
                <td className="px-4 py-3">{attendanceBadge(lesson.attendance)}</td>
                <td className="px-4 py-3">{homeworkBadge(lesson.homeworkStatus)}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{lesson.grade}</td>
                <td className="px-4 py-3">{gradeBadge(lesson.gradeStatus)}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{lesson.examGrade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>عرض 5 من اصل 22 حصة</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === n ? "bg-[#1F2937] text-white" : "border border-gray-200 hover:bg-gray-100"}`}>
              {n}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(3, p + 1))}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsPage;