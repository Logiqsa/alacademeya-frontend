import React from "react";
import WelcomeHeader from "../../components/student/dashboard/WelcomeHeader";
import StatsOverview from "../../components/student/dashboard/StatsOverview";
import SubscriptionsCard from "../../components/student/dashboard/SubscriptionsCard";
import GroupsCard from "../../components/student/dashboard/GroupsCard";
import ScheduleSection from "../../components/student/dashboard/ScheduleSection";
import LessonsList from "../../components/student/dashboard/LessonsList";
import StudentLayout from "../../components/student/layout/StudentLayout";

const StudentHome = () => {
  return (
    <StudentLayout>
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto" dir="rtl">
        <WelcomeHeader studentName="محمد" />

        <StatsOverview
          upcomingLessons={4}
          activeExams={1}
          activeAssignments={2}
          activeGroups={4}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5 sm:mb-6">
          <div className="lg:col-span-2">
            <GroupsCard />
          </div>
          <div className="lg:col-span-1">
            <SubscriptionsCard />
          </div>
        </div>

        <ScheduleSection weekLabel="22 يونيو 2026" />

        <div className="mb-2">
          <h3
            className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px] mb-4"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            دروس اليوم
          </h3>
          <LessonsList />
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentHome;