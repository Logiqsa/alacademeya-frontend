import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import StudentStatsCards from "../../../components/teacher/groups/students/StudentStatsCards";
import StudentLessonFilters from "../../../components/teacher/groups/students/StudentLessonFilters";
import StudentLessonsTable from "../../../components/teacher/groups/students/StudentLessonsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

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
    { id: 1, title: "المصفوفات_2", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "تم التسليم", grade: "19/20", gradeStatus: "مكتمل", examGrade: "19/20" },
    { id: 2, title: "المصفوفات_1", date: "21 يونيو 2026", attendance: "غائب", homeworkStatus: "تم التسليم", grade: "19/20", gradeStatus: "قيد الانتظار", examGrade: "لم يتم التصحيح" },
    { id: 3, title: "المتتاليات", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "تم تسليم", grade: "—", gradeStatus: "مكتمل", examGrade: "19/20" },
    { id: 4, title: "العدد الأولى", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "تم التسليم", grade: "19/20", gradeStatus: "لايوجد اختبار", examGrade: "—" },
    { id: 5, title: "القيل الحسابي", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "لا يوجد واجب", grade: "19/20", gradeStatus: "مكتمل", examGrade: "19/20" },
    { id: 5, title: "القيل الحسابي", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "لا يوجد واجب", grade: "19/20", gradeStatus: "مكتمل", examGrade: "19/20" },
    { id: 5, title: "القيل الحسابي", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "لا يوجد واجب", grade: "19/20", gradeStatus: "مكتمل", examGrade: "19/20" },
    { id: 5, title: "القيل الحسابي", date: "21 يونيو 2026", attendance: "حاضر", homeworkStatus: "لا يوجد واجب", grade: "19/20", gradeStatus: "مكتمل", examGrade: "19/20" },
  ],
};

const PAGE_SIZE = 5;

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudentDetailsPage = () => {
  const { groupId, studentId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [sortBy, setSortBy] = useState("تاريخ الإنضمام");
  const [page, setPage] = useState(1);

  const student = MOCK_STUDENT;

  const filtered = student.lessons.filter(
    (l) => l.title.includes(search) && (filterStatus === "جميع الحالات" || l.attendance === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedLessons = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
       

        {/* Student header */}
        <div className="mb-6">
          <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-1">{student.name}</h3>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">{student.level}</p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StudentStatsCards student={student} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <StudentLessonFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <StudentLessonsTable lessons={paginatedLessons} />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedLessons.length}
          unitLabel="حصة"
        />
      </div>
    </TeacherLayout>
  );
};

export default StudentDetailsPage;