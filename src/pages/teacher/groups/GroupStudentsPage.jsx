import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 1, name: "محمد أحمد",   joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "احمد علي",     status: "نشط" },
  { id: 2, name: "احمد سامى",   joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "سامى علي",     status: "مستبعد" },
  { id: 3, name: "سميرة شادي",  joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "شادي صلاح",    status: "نشط" },
  { id: 4, name: "زين محمد",    joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "محمد كريف",    status: "نشط" },
  { id: 5, name: "مليكه محمد",  joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "محمد علي",     status: "نشط" },
  { id: 6, name: "محمد باسل",   joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "باسل احمد",    status: "مستبعد" },
  { id: 7, name: "فاطمة عمر",   joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "عمر حسن",      status: "نشط" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    "نشط":     "bg-green-100 text-green-700",
    "مستبعد":  "bg-red-100 text-red-600",
    "معلق":    "bg-orange-100 text-orange-500",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const GroupStudentsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [sortBy, setSortBy] = useState("تاريخ الإنضمام");
  const [page, setPage] = useState(1);

  const filtered = MOCK_STUDENTS.filter(s =>
    s.name.includes(search) &&
    (filterStatus === "جميع الحالات" || s.status === filterStatus)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Breadcrumb */}
      <button onClick={() => navigate(`/teacher/groups/${groupId}/lessons`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        الطلاب
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">مجموعة الرياضيات A</h1>
        <p className="text-sm text-gray-500 mt-1">إدارة طلاب هذه المجموعة: متابعة الحضور، الدرجات، والبيانات الشخصية.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "إجمالي الطلاب",    value: 22, color: "text-blue-600",  bg: "bg-blue-50" },
          { label: "الطلاب النشطين",   value: 18, color: "text-green-600", bg: "bg-green-50" },
          { label: "الطلاب المستبعدون", value: 4,  color: "text-red-500",   bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option>جميع الحالات</option>
          <option>نشط</option><option>مستبعد</option><option>معلق</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option>تاريخ الإنضمام</option>
          <option>الاسم</option><option>الحالة</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["اسم الطالب", "تاريخ الإنضمام", "رقم الهاتف", "ولي الأمر", "الحالة", "الإجراءات"].map(h => (
                <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, i) => (
              <tr key={student.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                onClick={() => navigate(`/teacher/groups/${groupId}/students/${student.id}`)}>
                <td className="px-4 py-3 font-semibold text-gray-800">{student.name}</td>
                <td className="px-4 py-3 text-gray-600">{student.joinDate}</td>
                <td className="px-4 py-3 text-gray-600 font-mono">{student.phone}</td>
                <td className="px-4 py-3 text-gray-600">{student.parent}</td>
                <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/teacher/groups/${groupId}/students/${student.id}`)}
                    className="text-gray-400 hover:text-blue-500 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>عرض 6 من اصل 22 طالب</span>
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

export default GroupStudentsPage;