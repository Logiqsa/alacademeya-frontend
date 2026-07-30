import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import AssignmentStatsBar from "../../../components/teacher/assignments/AssignmentStatsBar";
import AssignmentFilters from "../../../components/teacher/assignments/AssignmentFilters";
import AssignmentsTable from "../../../components/teacher/assignments/AssignmentsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LoadingState from "../../../components/shared/LoadingState";
import {
  getMyClassrooms,
  getAssignmentsByClassroom,
  getClassroomSessions,
  getAssignmentSubmissions,
  getClassroomStudents,
} from "../../../services/APIService"; // عدّل المسار حسب مكان api.js عندك

const PAGE_SIZE = 6;

const mapStatus = (status) => (status === "active" ? "نشط" : "منتهي");

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const AssignmentsPage = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [groupNames, setGroupNames] = useState([]); // لأسماء المجموعات في فلتر الـ dropdown
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  // بيجيب كل مجموعات المعلّم، وبعدين واجبات وحصص وطلاب كل مجموعة،
  // ويقرأ تسليمات كل واجب لحساب أرقام التسليم والتصحيح الفعلية.
  const fetchAllAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const classroomsRes = await getMyClassrooms();
      const classrooms = classroomsRes.data?.data || [];
      setGroupNames(classrooms.map((c) => c.name));

      const perClassroom = await Promise.all(
        classrooms.map(async (classroom) => {
          const [assignmentsRes, sessionsRes, studentsRes] = await Promise.all([
            getAssignmentsByClassroom(classroom.id),
            getClassroomSessions(classroom.id).catch(() => ({
              data: { data: [] },
            })),
            getClassroomStudents(classroom.id).catch(() => ({
              data: { data: [] },
            })),
          ]);

          const sessionsById = {};
          (sessionsRes.data?.data || []).forEach((s) => {
            sessionsById[s.id] = s.title;
          });

          const roster = studentsRes.data?.data || [];
          const classroomAssignments = assignmentsRes.data?.data || [];

          return Promise.all(
            classroomAssignments.map(async (a) => {
              const submissionsRes = await getAssignmentSubmissions(a.id).catch(
                () => ({ data: { data: [] } }),
              );
              const submissions = submissionsRes.data?.data || [];
              const gradedCount = submissions.filter(
                (submission) => submission.status === "graded",
              ).length;

              let correctionStatus = "لم يبدأ التصحيح";
              if (gradedCount > 0 && gradedCount < submissions.length) {
                correctionStatus = "قيد التصحيح";
              } else if (
                submissions.length > 0 &&
                gradedCount === submissions.length
              ) {
                correctionStatus = "تم التصحيح";
              }

              const sessionId =
                a.session?.id ?? a.session?._id ?? a.session;

              return {
                id: a.id,
                title: a.title,
                group: classroom.name,
                lesson: a.session?.title || sessionsById[sessionId] || "-",
                dueDate: formatDate(a.dueDate),
                submitted: submissions.length,
                totalStudents:
                  roster.length ||
                  classroom.students?.length ||
                  classroom.studentsCount ||
                  0,
                status: mapStatus(a.status),
                correctionStatus,
              };
            }),
          );
        }),
      );

      setAssignments(perClassroom.flat());
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "حدث خطأ أثناء تحميل الواجبات",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAssignments();
  }, [fetchAllAssignments]);

  const filtered = assignments.filter(
    (a) =>
      a.title.includes(search) &&
      (filterGroup === "جميع المجموعات" || a.group === filterGroup) &&
      (filterStatus === "جميع الحالات" || a.status === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedAssignments = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = {
    pendingCorrection: assignments.filter(
      (a) => a.correctionStatus === "قيد التصحيح",
    ).length,
    corrected: assignments.filter((a) => a.correctionStatus === "تم التصحيح")
      .length,
    active: assignments.filter((a) => a.status === "نشط").length,
    total: assignments.length,
  };

  return (
    <TeacherLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              الواجبات
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة ومتابعة جميع الواجبات في جميع المجموعات.
            </p>
          </div>
          <button
            onClick={() => navigate("/assignments/new")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إضافة واجب
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-[#FFE9E9] text-[#D32F2F] text-sm rounded-lg px-4 py-3">
            {errorMsg}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6">
          <AssignmentStatsBar {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <AssignmentFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterGroup={filterGroup}
            onFilterGroupChange={(v) => {
              setFilterGroup(v);
              setPage(1);
            }}
            groupOptions={["جميع المجموعات", ...groupNames]}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedAssignments.length}
          unitLabel="واجب"
        />

        <div className="mt-4">
          {loading ? (
            <LoadingState
              label="جاري تحميل الواجبات..."
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            />
          ) : (
            <AssignmentsTable
              assignments={paginatedAssignments}
              onView={(id) => navigate(`/teacher/assignments/${id}`)}
            />
          )}
        </div>

      </div>
    </TeacherLayout>
  );
};

export default AssignmentsPage;
