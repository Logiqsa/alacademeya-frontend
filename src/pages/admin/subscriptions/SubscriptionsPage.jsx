import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Package, TicketPercent } from "lucide-react";
import PackagesTab from "../../../components/admin/subscriptions/tabs/PackagesTab";
import DiscountCodesTab from "../../../components/admin/subscriptions/tabs/DiscountCodesTab";
import SubscriptionsTab from "../../../components/admin/subscriptions/tabs/SubscriptionsTab";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { AuthContext } from "../../../context/AuthContext";

const TABS = [
  { key: "subscriptions", path: "orders", label: "الاشتراكات", icon: CreditCard },
  { key: "packages", path: "packages", label: "الباقات", icon: Package },
  { key: "discounts", path: "discount-codes", label: "أكواد الخصم", icon: TicketPercent },
];

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const { tab: tabPath } = useParams();
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === "super-admin";
  const visibleTabs = isSuperAdmin
    ? TABS
    : TABS.filter((tab) => tab.key !== "packages");
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const selectedTab = visibleTabs.find((tab) => tab.path === tabPath);
  const currentTab = selectedTab?.key || visibleTabs[0]?.key;

  useEffect(() => {
    if (user?.role && !selectedTab && visibleTabs[0]) {
      navigate(`/admin/subscription/${visibleTabs[0].path}`, { replace: true });
    }
  }, [navigate, selectedTab, user?.role, visibleTabs]);

  const tabBtnLabel = {
    packages: "إضافة باقة",
    discounts: "إنشاء كود",
  };

  const handleHeaderBtn = () => {
    if (currentTab === "packages") setShowAddPackage(true);
    if (currentTab === "discounts") setShowAddDiscount(true);
  };

  return (
    <AdminLayout>
       <Breadcrumbs homeTo="/admin-dashboard" />
      <div
        dir="rtl"
        className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-5 sm:mb-6 gap-3">
          <div className="text-right min-w-0">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[18px] sm:text-[20px] text-[#1F2937] truncate">
              إدارة الاشتراكات
            </h2>
            <p className="text-[#575F69] text-[13px] sm:text-[14px] mt-0.5">
              متابعة الاشتراكات والباقات وأكواد الخصم
            </p>
          </div>

          {currentTab === "subscriptions" ? (
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => navigate("/admin/subscriptions/requests")}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-[#E5E7EB] text-[#374151] rounded-xl font-medium text-[14px] hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap"
              >
                طلبات الاشتراك
              </button>
              <button
                onClick={() => navigate("/admin/subscriptions/add")}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] active:bg-[#0c285f] transition-colors whitespace-nowrap"
              >
                إضافة اشتراك
              </button>
            </div>
          ) : (
            <button
              onClick={handleHeaderBtn}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] active:bg-[#0c285f] transition-colors whitespace-nowrap"
            >
              {tabBtnLabel[currentTab]}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-[#E4E7EC] bg-white p-1.5 shadow-sm w-full sm:w-fit mb-5 sm:mb-6 overflow-x-auto no-scrollbar">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate(`/admin/subscription/${t.path}`)}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all whitespace-nowrap ${
                currentTab === t.key
                  ? "bg-[#123C91] text-white shadow-sm"
                  : "text-[#667085] hover:bg-[#F5F8FF] hover:text-[#123C91]"
              }`}
            >
              <t.icon size={16} strokeWidth={2.25} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-w-0">
          {currentTab === "packages" && (
            <PackagesTab
              showAdd={showAddPackage}
              onCloseAdd={() => setShowAddPackage(false)}
            />
          )}
          {currentTab === "discounts" && (
            <DiscountCodesTab
              showAdd={showAddDiscount}
              onCloseAdd={() => setShowAddDiscount(false)}
            />
          )}
          {currentTab === "subscriptions" && <SubscriptionsTab />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionsPage;
