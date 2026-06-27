import { useEffect, useState } from "react";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import ChildCard from "../../components/parent/subscription/ChildCard";
import SubscriptionTable from "../../components/parent/subscription/SubscriptionTable";
import SubscriptionFilters from "../../components/parent/subscription/SubscriptionFilters";

import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getMyStudentsSubscriptions } from "../../services/authService";

const STATUS_MAP = {
  active: "نشطة",
  expired: "منتهية",
  pending: "قيد المراجعة",
};

const mapStatus = (status) => STATUS_MAP[status] || status;

const mapSubscriptionToRows = (sub) => {
  const groupId = sub.id;
  const studentName = sub.student?.user?.fullName || "--";
  const startDate = sub.createdAt
    ? new Date(sub.createdAt).toLocaleDateString("en-GB")
    : "--";
  const status = mapStatus(sub.status);

  if (!sub.items || sub.items.length === 0) {
    return [
      {
        id: groupId,
        groupId,
        groupSize: 1,
        name: studentName,
        subjectName: "--",
        teacherName: "",
        totalHours: "--",
        consumed: "--",
        remaining: "--",
        duration: "شهر",
        startDate,
        endDate: "--",
        amount: "--",
        status,
        studentId: sub.student?.id,
      },
    ];
  }

  const groupSize = sub.items.length;

  return sub.items.map((item) => {
    const subjectName = item.subject?.name?.ar || "--";
    const teacherName = item.teacher?.user?.fullName || "";

    return {
      id: item._id,
      groupId,
      groupSize,
      name: studentName,
      subjectName,
      teacherName,
     
      totalHours: item.package?.sessions != null ? `${item.package.sessions} ساعة` : "--",
      consumed: "--",
      remaining: "--",
      duration: "شهر",
      startDate,
  
      endDate: "--",
      amount: item.finalPrice != null ? `EGP ${item.finalPrice.toLocaleString()}` : "--",
      status: mapStatus(item.status || sub.status),
      studentId: sub.student?.id,
    };
  });
};

const SubscriptionPage = () => {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
    
        const res = await getMyStudentsSubscriptions();
        setSubscriptions(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
        setError("حدث خطأ أثناء تحميل الاشتراكات، حاول مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const tableRows = subscriptions.flatMap(mapSubscriptionToRows);

  const studentOptions = [...new Set(tableRows.map((row) => row.name))];
  const statusOptions = [...new Set(tableRows.map((row) => row.status))];

  const filteredTableRows = tableRows.filter((row) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      row.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      row.subjectName?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      row.teacherName?.toLowerCase().includes(searchTerm.trim().toLowerCase());

    const matchesStudent = selectedStudent === "all" || row.name === selectedStudent;
    const matchesStatus = selectedStatus === "all" || row.status === selectedStatus;

    return matchesSearch && matchesStudent && matchesStatus;
  });


  const cardRows = filteredTableRows.filter((row, index) => {
    const firstIndexOfGroup = filteredTableRows.findIndex((r) => r.groupId === row.groupId);
    return firstIndexOfGroup === index;
  });

  return (
    <ParentLayout>
      <div
        dir="rtl"
        className="
          max-w-7xl
          mx-auto
          px-3
          sm:px-5
          lg:px-2
          py-3
          sm:py-5
          font-['IBM_Plex_Sans_Arabic']
        "
      >
        {/* Header */}
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-6
          "
        >
          <div>
            <h1
              className="
                text-[#123C91]
                font-semibold
                text-[22px]
                sm:text-[26px]
                leading-8
                mb-2
              "
            >
              الاشتراك والباقات
            </h1>

            <p
              className="
                text-[#575F69]
                text-[14px]
                sm:text-[16px]
                leading-6
              "
            >
              قم بمتابعة وتجديد باقات تعليم أبنائك في مكان واحد
            </p>
          </div>

          <button
            onClick={() => navigate("/parent-dashboard/add-child")}
            className="
              w-full
              sm:w-auto
              h-12
              px-6
              rounded-xl
              bg-[#123C91]
              text-white
              flex
              items-center
              justify-center
              gap-2
              hover:bg-[#0E3178]
              transition-all
              shadow-sm
            "
          >
            <Plus size={18} />
            <span className="font-medium">
              إضافة ابن
            </span>
          </button>
        </div>

      
        {isLoading && (
          <div className="text-center py-10 text-[#575F69]">
            جاري تحميل الاشتراكات...
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-10 text-[#D32F2F]">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Children Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {cardRows.length === 0 ? (
                <p className="text-[#575F69] col-span-2 text-center py-6">
                  لا توجد اشتراكات حالياً
                </p>
              ) : (
                cardRows.map((row) => (
                  <ChildCard
                    key={row.groupId}
                    name={row.name}
                    plan={
                      row.teacherName
                        ? `${row.subjectName} - ${row.teacherName}`
                        : row.subjectName
                    }
                    status={row.status}
                    date={row.endDate !== "--" ? row.endDate : row.startDate}
                    isExpiring={row.status === "منتهية"}
                  />
                ))
              )}
            </div>

            {/* Filters */}
            <div
              className="
                bg-white
                border
                border-[#E5E5E5]
                rounded-2xl
                p-3
                sm:p-5
                shadow-sm
                mb-5
              "
            >
              <SubscriptionFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                studentOptions={studentOptions}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                statusOptions={statusOptions}
              />
            </div>

            {/* Table */}
            <div
              className="
                border
                border-[#E5E5E5]
                rounded-2xl
                shadow-sm
                overflow-hidden
              "
            >
              <SubscriptionTable data={filteredTableRows} />
            </div>
          </>
        )}
      </div>
    </ParentLayout>
  );
};

export default SubscriptionPage;