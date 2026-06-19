import StudentWelcome from "../../components/student/dashboard/StudentWelcome";
import StudentLayout from "../../components/student/layout/StudentLayout";



const StudentHome = () => {
  return (
    <StudentLayout>
      <div className="space-y-6 p-2" dir="rtl">
        <StudentWelcome />
        {/* <StatsCards /> */}


        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        
          <div className="lg:col-span-2">
            <ChildrenOverviewSection />
          </div>

          <div className="lg:col-span-1">
            <NotificationsSection />
          </div>
          
        </div> */}

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="lg:col-span-1">
            <UpcomingLessonsSection />
          </div>

          <div className="lg:col-span-1">
            <NotificationsSection />
          </div>

        </div> */}
      </div>
    </StudentLayout>
  );
};

export default StudentHome;