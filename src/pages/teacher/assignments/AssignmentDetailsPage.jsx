import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import AssignmentDetailsStatsCards from "../../../components/teacher/assignments/AssignmentDetailsStatsCards";
import AssignmentDetailsFilters from "../../../components/teacher/assignments/AssignmentDetailsFilters";
import StudentSubmissionsTable from "../../../components/teacher/assignments/StudentSubmissionsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getAssignment } from "../../../services/authService"; // عدّل المسار حسب مكان api.js عندك

const PAGE_SIZE = 5;

// TODO: GET /assignments/:id بيرجع بيانات الواجب نفسه بس مش بيرجع تسليمات
// الطلاب ولا إحصائيات التصحيح. لما يتوفر endpoint زي
// GET /assignments/:id/submissions حط استدعاؤه هنا واستبدل students/stats.
const mapAssignmentDetails = (a) => ({
  id: a.id,
  title: a.title,
  subtitle: a.description || "إدارة ومتابعة واجبات الطلاب وتصحيحها.",
  dueDate: a.dueDate,
  totalScore: a.totalScore,
  attachments: a.attachments || [],
  stats: {
    pendingCorrection: 0, // TODO: من endpoint التسليمات
    corrected: 0, // TODO: من endpoint التسليمات
    totalSubmissions: 0, // TODO: من endpoint التسليمات
  },
  students: [], // TODO: من endpoint التسليمات
});

const AssignmentDetailsPage = () => {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الطلاب");
  const [page, setPage] = useState(1);

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getAssignment(assignmentId);
      setAssignment(mapAssignmentDetails(res.data?.data));
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "حدث خطأ أثناء تحميل بيانات الواجب"
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="w-full p-2 flex items-center justify-center gap-2 text-[#575F69] py-16">
          <Loader2 size={18} className="animate-spin" />
          جارٍ تحميل بيانات الواجب...
        </div>
      </TeacherLayout>
    );
  }

  if (errorMsg || !assignment) {
    return (
      <TeacherLayout>
        <div className="w-full p-2" dir="rtl">
          <div className="bg-[#FFE9E9] text-[#D32F2F] text-sm rounded-lg px-4 py-3">
            {errorMsg || "لم يتم العثور على الواجب"}
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const filtered = assignment.students.filter((s) => {
    const matchesSearch = s.name.includes(search);
    const matchesFilter =
      filterStatus === "جميع الطلاب" ||
      (filterStatus === "تم التسليم" && s.submitted) ||
      (filterStatus === "لم يسلّم" && !s.submitted);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Assignment header */}
        <div className="mb-6">
          <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-1">{assignment.title}</h3>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">{assignment.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <AssignmentDetailsStatsCards stats={assignment.stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <AssignmentDetailsFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <StudentSubmissionsTable
            students={paginatedStudents}
            onAction={(payload) =>
              console.log("correct/edit submission", payload, "in assignment", assignmentId)
            }
          />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedStudents.length}
          unitLabel="طالب"
        />
      </div>
    </TeacherLayout>
  );
};

export default AssignmentDetailsPage;