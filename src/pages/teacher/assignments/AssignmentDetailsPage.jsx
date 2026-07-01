import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import AssignmentDetailsStatsCards from "../../../components/teacher/assignments/AssignmentDetailsStatsCards";
import AssignmentDetailsFilters from "../../../components/teacher/assignments/AssignmentDetailsFilters";
import StudentSubmissionsTable from "../../../components/teacher/assignments/StudentSubmissionsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import {
  getAssignment,
  getAssignmentSubmissions,
  getClassroomStudents,
  gradeSubmission, // TODO: عدّل الاستدعاء في handleAction لما تأكدلي شكل الـ endpoint
} from "../../../services/authService"; // عدّل المسار حسب مكان api.js عندك

const PAGE_SIZE = 5;

const formatBytes = (bytes) => {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
};

// بيدمج: بيانات الواجب + قايمة تسليمات الطلاب + قايمة كل طلاب الفصل
// عشان نعرف مين سلّم ومين لأ (submissions بترجع بس اللي سلّموا فعلاً)
const buildAssignmentDetails = (assignmentRaw, submissionsRaw, rosterRaw) => {
  const submissionByStudentId = {};
  submissionsRaw.forEach((s) => {
    submissionByStudentId[s.student?.id] = s;
  });

  const students = rosterRaw.map((st) => {
    const fullName = st.user?.fullName ?? st.fullName ?? "طالب";
    const base = {
      id: st.id ?? st.user?.id,
      name: fullName,
      initial: fullName.trim().charAt(0),
    };

    const sub = submissionByStudentId[st.id ?? st.user?.id];
    if (!sub) {
      return { ...base, submitted: false };
    }

    const graded = sub.status === "graded";
    return {
      ...base,
      submitted: true,
      submissionId: sub.id,
      submittedCount: graded ? `${sub.score}/${assignmentRaw.totalScore}` : undefined,
      correctionStatus: graded ? "تم التصحيح" : "قيد التصحيح",
      fileName: sub.attachments?.[0]?.originalName,
      fileSize: formatBytes(sub.attachments?.[0]?.size) ?? undefined,
    };
  });

  const totalSubmissions = submissionsRaw.length;
  const corrected = submissionsRaw.filter((s) => s.status === "graded").length;
  const pendingCorrection = totalSubmissions - corrected;

  return {
    id: assignmentRaw.id,
    title: assignmentRaw.title,
    subtitle: assignmentRaw.description || "إدارة ومتابعة واجبات الطلاب وتصحيحها.",
    stats: { pendingCorrection, corrected, totalSubmissions },
    students,
  };
};

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

      const assignmentRes = await getAssignment(assignmentId);
      const assignmentRaw = assignmentRes.data?.data;
      const classroomId = assignmentRaw.classroom?.id ?? assignmentRaw.classroom;

      const [submissionsRes, rosterRes] = await Promise.all([
        getAssignmentSubmissions(assignmentId),
        getClassroomStudents(classroomId).catch(() => ({ data: { data: [] } })),
      ]);

      setAssignment(
        buildAssignmentDetails(
          assignmentRaw,
          submissionsRes.data?.data || [],
          rosterRes.data?.data || []
        )
      );
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

  // TODO: أظبط الـ payload لما تأكدلي شكل الـ Grade/Review Submission endpoint
  const handleAction = async ({ student, type, grade }) => {
    if (type === "تصحيح" || type === "تعديل") {
      if (!student.submissionId) return;
      try {
        await gradeSubmission(student.submissionId, { score: Number(grade) });
        fetchAssignment(); // إعادة تحميل عشان نعرض الدرجة والحالة الجديدة
      } catch (err) {
        setErrorMsg(
          err?.response?.data?.message || "حدث خطأ أثناء حفظ الدرجة"
        );
      }
    }
  };

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
            onAction={handleAction}
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