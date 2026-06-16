import ParentLayout from "../../components/parent/layout/ParentLayout";
import ChildCard from "../../components/parent/subscription/ChildCard";
import PlanCard from "../../components/parent/subscription/PlanCard";
import SubscriptionTable from "../../components/parent/subscription/SubscriptionTable";
import { useNavigate } from "react-router-dom";
import { Plus } from 'lucide-react';
import SubscriptionFilters from "../../components/parent/subscription/SubscriptionFilters";
import ChildrenPackageHeader from "../../components/parent/subscription/ChildrenPackageHeader";

const SubscriptionPage = () => {
    const navigate = useNavigate();
    return (
        <ParentLayout>
            <div className="max-w-7xl mx-auto p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
                <div className="flex items-center justify-between mb-4">

                    <div>
                        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-1">
                            الاشتراك والباقات
                        </h1>
                        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
                            قم بمتابعة وتجديد باقات تعليم أبنائك في مكان واحد
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/parent-dashboard/add-child")}
                        className="flex items-center justify-center bg-[#123C91] text-white text-sm rounded-lg  w-40 h-3 py-3 px-6 gap-2"
                        style={{
                            height: '48px',
                        }}
                    >
                        <Plus size={20} />
                        <span>إضافة ابن</span>
                    </button>
                </div>

                <ChildrenPackageHeader />

                <div className="flex gap-4 mb-10">

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

                <PlanCard />

                <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
                    <SubscriptionFilters />
                </div>

                <SubscriptionTable />
            </div>

        </ParentLayout>
    );
};

export default SubscriptionPage;