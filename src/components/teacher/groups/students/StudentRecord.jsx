// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green:  "bg-green-100 text-green-700",
    red:    "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-500",
    gray:   "bg-gray-100 text-gray-500",
    blue:   "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}>
      {label}
    </span>
  );
};

const attendanceBadge = (v) =>
  v === "حاضر" ? <Badge label={v} type="green" /> : <Badge label={v} type="red" />;

const homeworkBadge = (v) => {
  if (v === "تم التسليم" || v === "تم تسليم") return <Badge label={v} type="green" />;
  if (v === "لا يوجد واجب")                    return <Badge label={v} type="gray" />;
  return <Badge label={v} type="orange" />;
};

const gradeBadge = (v) => {
  if (v === "مكتمل")          return <Badge label={v} type="green" />;
  if (v === "قيد الانتظار")   return <Badge label={v} type="orange" />;
  if (v === "لايوجد اختبار")  return <Badge label={v} type="gray" />;
  return <Badge label={v} type="gray" />;
};

// ─── Stats Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg, icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </div>
  </div>
);

// ─── StudentRecord ────────────────────────────────────────────────────────────
/**
 * Props:
 *  student: {
 *    name, level,
 *    totalLessons, attendanceCount, absenceCount, homeworkDone, homeworkTotal,
 *    lessons: Array<{
 *      id, title, date,
 *      attendance, homeworkStatus, grade, gradeStatus, examGrade
 *    }>
 *  }
 */
const StudentRecord = ({ student }) => {
  if (!student) return null;

  return (
    <div className="space-y-6">
      {/* Student header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{student.level}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي الحصص" value={student.totalLessons}
          color="text-blue-600" bg="bg-blue-50"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
        />
        <StatCard
          label="عدد مرات الحضور" value={student.attendanceCount}
          color="text-green-600" bg="bg-green-50"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="عدد مرات الغياب" value={student.absenceCount}
          color="text-red-500" bg="bg-red-50"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="الواجبات" value={`${student.homeworkDone}/${student.homeworkTotal}`}
          color="text-purple-600" bg="bg-purple-50"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
        />
      </div>

      {/* Lessons table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["اسم الحصة", "التاريخ", "الحضور", "حالة الواجب", "الدرجة", "حالة الاختبار", "درجة الاختبار"].map((h) => (
                <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(student.lessons ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">لا توجد بيانات</td>
              </tr>
            ) : (
              student.lessons.map((lesson, i) => (
                <tr
                  key={lesson.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{lesson.title}</td>
                  <td className="px-4 py-3 text-gray-600">{lesson.date}</td>
                  <td className="px-4 py-3">{attendanceBadge(lesson.attendance)}</td>
                  <td className="px-4 py-3">{homeworkBadge(lesson.homeworkStatus)}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{lesson.grade}</td>
                  <td className="px-4 py-3">{gradeBadge(lesson.gradeStatus)}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{lesson.examGrade}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRecord;