import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import StudentStatsBar from "../../../components/teacher/groups/students/StudentStatsBar";
import StudentFilters from "../../../components/teacher/groups/students/StudentFilters";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 1, name: "محمد أحمد", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "احمد علي", status: "نشط" },
  { id: 2, name: "احمد سامى", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "سامى علي", status: "مستبعد" },
  { id: 3, name: "سميرة شادي", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "شادي صلاح", status: "نشط" },
  { id: 4, name: "زين محمد", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "محمد كريف", status: "نشط" },
  { id: 5, name: "مليكه محمد", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "محمد علي", status: "نشط" },
  { id: 6, name: "محمد باسل", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "باسل احمد", status: "مستبعد" },
  { id: 7, name: "فاطمة عمر", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "عمر حسن", status: "نشط" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    "نشط": "bg-green-100 text-green-700",
    "مستبعد": "bg-red-100 text-red-600",
    "معلق": "bg-orange-100 text-orange-500",
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
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">مجموعة الرياضيات A</h3>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">إدارة طلاب هذه المجموعة: متابعة الحضور، الدرجات، والبيانات الشخصية.</p>
          </div>
        </div>

        {/* Stats */}
        <div className=" mb-6">
          {/* Stats */}

          <StudentStatsBar />

        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <StudentFilters />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border mt-6 border-gray-100 shadow-sm overflow-hidden mb-4">
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
    </TeacherLayout>
  );
};

export default GroupStudentsPage;