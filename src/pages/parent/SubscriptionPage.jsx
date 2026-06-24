import ParentLayout from "../../components/parent/layout/ParentLayout";
import ChildCard from "../../components/parent/subscription/ChildCard";
import SubscriptionTable from "../../components/parent/subscription/SubscriptionTable";
import SubscriptionFilters from "../../components/parent/subscription/SubscriptionFilters";

import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const SubscriptionPage = () => {
  const navigate = useNavigate();

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

        {/* Children Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChildCard
            name="محمد أحمد"
            plan="المتقدمة"
            status="نشط"
            date="15 يوليو 2026"
            isExpiring={false}
          />

          <ChildCard
            name="سلمى أحمد"
            plan="المتقدمة"
            status="ينتهي قريباً"
            date="خلال 3 أيام"
            isExpiring={true}
          />
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
          <SubscriptionFilters />
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
          <SubscriptionTable />
        </div>
      </div>
    </ParentLayout>
  );
};

export default SubscriptionPage;