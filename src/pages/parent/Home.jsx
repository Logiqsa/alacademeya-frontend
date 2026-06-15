import ParentLayout from "../../components/parent/layout/ParentLayout";
import WelcomeSection from "../../components/parent/dashboard/WelcomeSection";
import StatsCards from "../../components/parent/dashboard/StatsCards";
import NotificationsSection from "../../components/parent/dashboard/NotificationsSection";
import ChildrenOverviewSection from "../../components/parent/dashboard/ChildrenOverviewSection";

const Home = () => {
  return (
    <ParentLayout>
      <div className="space-y-6 p-2" dir="rtl">
        <WelcomeSection />
        <StatsCards />

        {/* الشبكة الجديدة بتوزيع 3 أعمدة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* نظرة عامة على الأبناء تأخذ عمودين (أكبر) */}
          <div className="lg:col-span-2">
            <ChildrenOverviewSection />
          </div>

          {/* الإشعارات تأخذ عمود واحد (أصغر) */}
          <div className="lg:col-span-1">
            <NotificationsSection />
          </div>
          
        </div>
      </div>
    </ParentLayout>
  );
};

export default Home;