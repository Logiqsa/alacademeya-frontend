import { useState, useEffect } from "react";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import ChildrenStatsCards from "../../components/parent/children/ChildrenStatsCard";
import ChildrenSearch from "../../components/parent/children/ChildrenSearch";
import ChildrenTable from "../../components/parent/children/ChildrenTable";

import {
  getMyStudents,
  getStudentsStatistics,
} from "../../services/APIService";
import Paginationn from "../../components/teacher/groups/students/Paginationn";

const PER_PAGE = 10;

const ChildrenPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, statsRes] = await Promise.all([
          getMyStudents(),
          getStudentsStatistics(),
        ]);
        setStudents(studentsRes.data?.data || []);
        setStats(statsRes.data?.data || null);
      } catch (err) {
        console.error("فشل تحميل بيانات الأبناء:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasChildren = students.length > 0;

  const filteredStudents = students.filter((s) =>
    (s.user?.fullName || "").toLowerCase().includes(search.toLowerCase()),
  );

  // — Pagination —
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredStudents.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  // reset to page 1 whenever search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <ParentLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">
              إدارة الأبناء
            </h1>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة ومتابعة بيانات وأداء أبنائك
            </p>
          </div>
          <button
            onClick={() => navigate("/parent-dashboard/add-child")}
            className="flex items-center justify-center bg-[#123C91] text-white [&_svg]:text-white text-sm rounded-lg w-40 h-3 py-3 px-6 gap-2"
            style={{ height: "48px" }}
          >
            <Plus size={20} />
            <span>إضافة ابن</span>
          </button>
        </div>

        <div className="w-full mb-8">
          <ChildrenStatsCards stats={stats} hasChildren={hasChildren} />
        </div>

        <div className="bg-white border mb-8 border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ChildrenSearch value={search} onChange={handleSearch} />
        </div>

        <div>
          {loading ? (
            <p className="text-[#575F69] text-center py-10">جاري التحميل...</p>
          ) : (
            <>
              <ChildrenTable
                children={paginated}
                onStudentRemoved={(removedId) =>
                  setStudents((prev) => prev.filter((s) => s.id !== removedId))
                }
              />

              <Paginationn
                page={safePage}
                totalPages={totalPages}
                onChange={setPage}
                totalItems={filteredStudents.length}
                displayedCount={paginated.length}
                unitLabel="ابن"
              />
            </>
          )}
        </div>
      </div>
    </ParentLayout>
  );
};

export default ChildrenPage;
