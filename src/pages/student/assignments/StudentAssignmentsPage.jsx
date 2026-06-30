import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import StudentAssignmentStatsBar from "../../../components/student/assignments/StudentAssignmentStatsBar";
import StudentAssignmentsTable from "../../../components/student/assignments/StudentAssignmentsTable";
import AssignmentFilters from "../../../components/teacher/assignments/AssignmentFilters";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import SubmitAssignmentModal from "../../../components/student/assignments/SubmitAssignmentModal";



// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ASSIGNMENTS = [
    { id: 1, title: "حل المعادلات", group: "الرياضيات A", lesson: "المعادلات التربيعية", dueDate: "2026 يونيو 21", status: "نشط", timeRemaining: "2 ساعة", grade: null },
    { id: 2, title: "مسائل تطبيقية", group: "الرياضيات A", lesson: "الهندسة", dueDate: "2026 يونيو 21", status: "تم التسليم", grade: "28/30" },
    { id: 3, title: "حل المعادلات", group: "الرياضيات C", lesson: "الجبر", dueDate: "2026 يونيو 21", status: "تم التسليم", grade: "--" },
    { id: 4, title: "مراجعة شاملة", group: "الرياضيات A", lesson: "--", dueDate: "2026 يونيو 21", status: "لم يتم التسليم", grade: null },
    { id: 5, title: "حل المعادلات", group: "الرياضيات B", lesson: "المعادلات التربيعية", dueDate: "2026 يونيو 21", status: "نشط", timeRemaining: "2 ساعة", grade: null },
    { id: 6, title: "مسائل تطبيقية", group: "الرياضيات C", lesson: "المعادلات التربيعية_2", dueDate: "2026 يونيو 21", status: "تم التسليم", grade: "25/25" },
];

const PAGE_SIZE = 6;

const StudentAssignmentsPage = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
    const [search, setSearch] = useState("");
    const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
    const [filterStatus, setFilterStatus] = useState("جميع الحالات");
    const [page, setPage] = useState(1);
    const [submitTargetId, setSubmitTargetId] = useState(null);

    const filtered = assignments.filter(
        (a) =>
            a.title.includes(search) &&
            (filterGroup === "جميع المجموعات" || a.group === filterGroup.replace("مجموعة ", "")) &&
            (filterStatus === "جميع الحالات" || a.status === filterStatus)
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginatedAssignments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const stats = {
        notSubmitted: assignments.filter((a) => a.status === "لم يتم التسليم").length,
        submitted: assignments.filter((a) => a.status === "تم التسليم").length,
        active: assignments.filter((a) => a.status === "نشط").length,
        total: assignments.length,
    };

    const handleConfirmSubmit = (file) => {
        setAssignments((prev) =>
            prev.map((a) => (a.id === submitTargetId ? { ...a, status: "تم التسليم" } : a))
        );
        setSubmitTargetId(null);
        // TODO: send `file` to the backend for the selected assignment
    };

    return (
        <StudentLayout>
            <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">الواجبات</h3>
                    <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
                        تابع جميع واجباتك وسلّم حلولك في الوقت المحدد.
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <StudentAssignmentStatsBar {...stats} />
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
                        filterStatus={filterStatus}
                        onFilterStatusChange={(v) => {
                            setFilterStatus(v);
                            setPage(1);
                        }}
                    />
                </div>

                {/* Table */}
                <div className="mt-4">
                    <StudentAssignmentsTable
                        assignments={paginatedAssignments}
                        onView={(id) => navigate(`/student/assignments/${id}`)}
                        onSubmit={(id) => setSubmitTargetId(id)}
                    />
                </div>

                {/* Pagination */}
                <Paginationn
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                    totalItems={filtered.length}
                    displayedCount={paginatedAssignments.length}
                    unitLabel="واجب"
                />
            </div>

            {/* Submit modal */}
            <SubmitAssignmentModal
                open={submitTargetId !== null}
                onClose={() => setSubmitTargetId(null)}
                onSubmit={handleConfirmSubmit}
            />
        </StudentLayout>
    );
};

export default StudentAssignmentsPage;