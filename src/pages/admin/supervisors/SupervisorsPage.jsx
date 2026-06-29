import { useState } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import SupervisorsStatsBar from "../../../components/admin/supervisors/SupervisorsStatsBar";
import SupervisorsFilters from "../../../components/admin/supervisors/SupervisorsFilters";
import SupervisorsTable from "../../../components/admin/supervisors/SupervisorsTable";
import AddSupervisorModal from "../../../components/admin/supervisors/AddSupervisorModal";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUPERVISORS = [
  { id: 1,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 2,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 3,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 4,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "متوقف" },
  { id: 5,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 6,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "متوقف" },
  { id: 7,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 8,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 9,  name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "متوقف" },
  { id: 10, name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 11, name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "نشط" },
  { id: 12, name: "محمد أحمد", email: "mohamed@gmail.com", phone: "+20 100 123 4567", status: "متوقف" },
];

const PAGE_SIZE = 6;

const SupervisorsPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = MOCK_SUPERVISORS.filter(
    (s) =>
      (s.name.includes(search) || s.email.includes(search)) &&
      (filterStatus === "جميع الحالات" || s.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    paused: MOCK_SUPERVISORS.filter((s) => s.status === "متوقف").length,
    active: MOCK_SUPERVISORS.filter((s) => s.status === "نشط").length,
    total:  MOCK_SUPERVISORS.length,
  };

  return (
    <AdminLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              إدارة المشرفين
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة حسابات وصلاحيات المشرفين على المنصة.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إضافة مشرف
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <SupervisorsStatsBar {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full">
          <SupervisorsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <SupervisorsTable supervisors={paginated} />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginated.length}
          unitLabel="مشرف"
        />

        {/* Add Supervisor Modal */}
        <AddSupervisorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default SupervisorsPage;