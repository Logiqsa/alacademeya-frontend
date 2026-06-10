import ParentLayout from "../../components/parent/layout/ParentLayout";
import WelcomeSection from "../../components/parent/dashboard/WelcomeSection";
import StatsCards from "../../components/parent/dashboard/StatsCards";
import NotificationsSection from "../../components/parent/dashboard/NotificationsSection";
import UpcomingLessonsSection from "../../components/parent/dashboard/UpcomingLessonsSection";

const Home = () => {
  return (
    <ParentLayout>
      <div className="space-y-6">
        <WelcomeSection />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotificationsSection />
          <UpcomingLessonsSection />
        </div>
      </div>
    </ParentLayout>
  );
};

export default Home;