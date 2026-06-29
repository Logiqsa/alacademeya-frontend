import { useState } from "react";
import { Upload } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import RecordingsFilters from "../../../components/admin/recordings/RecordingsFilters";
import RecordingsTable from "../../../components/admin/recordings/RecordingsTable";
import AddRecordingModal from "../../../components/admin/recordings/AddRecordingModal";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RECORDINGS = [
  { id: 1,  title: "شرح المعادلات التفاضلية - الجزء الأول", group: "مجموعة الرياضيات A", lesson: "الثانية", teacher: "عادل منصور", duration: "1:42:30", uploadDate: "2024-12-20" },
  { id: 2,  title: "شرح المعادلات التفاضلية - الجزء الأول", group: "مجموعة الرياضيات A", lesson: "الثانية", teacher: "عادل منصور", duration: "1:42:30", uploadDate: "2024-12-20" },
  { id: 3,  title: "شرح المعادلات التفاضلية - الجزء الأول", group: "مجموعة الرياضيات A", lesson: "الثانية", teacher: "عادل منصور", duration: "1:42:30", uploadDate: "2024-12-20" },
  { id: 4,  title: "شرح المعادلات التفاضلية - الجزء الأول", group: "مجموعة الرياضيات A", lesson: "الثانية", teacher: "عادل منصور", duration: "1:42:30", uploadDate: "2024-12-20" },
  { id: 5,  title: "شرح المعادلات التفاضلية - الجزء الأول", group: "مجموعة الرياضيات A", lesson: "الثانية", teacher: "عادل منصور", duration: "1:42:30", uploadDate: "2024-12-20" },
  { id: 6,  title: "شرح المعادلات التفاضلية - الجزء الأول", group: "مجموعة الرياضيات A", lesson: "الثانية", teacher: "عادل منصور", duration: "1:42:30", uploadDate: "2024-12-20" },
  { id: 7,  title: "شرح المعادلات التفاضلية - الجزء الثاني", group: "مجموعة الرياضيات B", lesson: "الأولى",  teacher: "عادل منصور", duration: "1:20:00", uploadDate: "2024-12-21" },
  { id: 8,  title: "شرح المعادلات التفاضلية - الجزء الثاني", group: "مجموعة الرياضيات B", lesson: "الأولى",  teacher: "عادل منصور", duration: "1:20:00", uploadDate: "2024-12-21" },
  { id: 9,  title: "شرح المعادلات التفاضلية - الجزء الثالث", group: "مجموعة الرياضيات C", lesson: "الثالثة", teacher: "عادل منصور", duration: "0:55:10", uploadDate: "2024-12-22" },
  { id: 10, title: "شرح المعادلات التفاضلية - الجزء الثالث", group: "مجموعة الرياضيات C", lesson: "الثالثة", teacher: "عادل منصور", duration: "0:55:10", uploadDate: "2024-12-22" },
  { id: 11, title: "شرح المعادلات التفاضلية - الجزء الرابع",  group: "مجموعة الرياضيات A", lesson: "الرابعة", teacher: "عادل منصور", duration: "1:10:45", uploadDate: "2024-12-23" },
  { id: 12, title: "شرح المعادلات التفاضلية - الجزء الرابع",  group: "مجموعة الرياضيات A", lesson: "الرابعة", teacher: "عادل منصور", duration: "1:10:45", uploadDate: "2024-12-23" },
];

const GROUP_OPTIONS = ["جميع المجموعات", "مجموعة الرياضيات A", "مجموعة الرياضيات B", "مجموعة الرياضيات C"];

const PAGE_SIZE = 6;

const RecordingsPages = () => {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = MOCK_RECORDINGS.filter(
    (r) =>
      (r.title.includes(search) || r.teacher.includes(search)) &&
      (filterGroup === "جميع المجموعات" || r.group === filterGroup)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              تسجيلات الحصص
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              رفع وإدارة تسجيلات حصص Zoom
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Upload size={18} />
            رفع تسجيل
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full mb-4">
          <RecordingsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterGroup={filterGroup}
            onFilterGroupChange={(v) => { setFilterGroup(v); setPage(1); }}
            groupOptions={GROUP_OPTIONS}
          />
        </div>

        {/* Table */}
        <RecordingsTable recordings={paginated} />

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginated.length}
          unitLabel="تسجيل"
        />

        {/* Modal */}
        <AddRecordingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          groupOptions={GROUP_OPTIONS.filter((g) => g !== "جميع المجموعات")}
        />
      </div>
    </AdminLayout>
  );
};

export default RecordingsPages;