import StatsTeacherCard from "../../components/teacher/dashboard/StatsTeacherCard";
import UpcomingLessonsSection from "../../components/teacher/dashboard/UpcomingLessonsSection";
import Welcome from "../../components/teacher/dashboard/WelcomeSection";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";


const TeacherHome = () => {
  return (
    <TeacherLayout>
      <div className="space-y-6 p-2" dir="rtl">
        <Welcome />
        <StatsTeacherCard />


        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        
          <div className="lg:col-span-2">
            <ChildrenOverviewSection />
          </div>

          <div className="lg:col-span-1">
            <NotificationsSection />
          </div>
          
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">
            <UpcomingLessonsSection />
          </div>

          {/* <div className="lg:col-span-1">
            <NotificationsSection />
          </div> */}

        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherHome;