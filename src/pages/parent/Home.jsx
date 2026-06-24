import { useState, useEffect } from "react";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import WelcomeSection from "../../components/parent/dashboard/WelcomeSection";
import StatsCards from "../../components/parent/dashboard/StatsCards";
import ChildrenOverviewSection from "../../components/parent/dashboard/ChildrenOverviewSection";
import NotificationsSection from "../../components/parent/dashboard/NotificationsSection";
import { getMyStudents, getStudentsStatistics } from "../../services/authService";

const Home = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error("فشل تحميل بيانات لوحة التحكم:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <ParentLayout>
        <div className="p-2" dir="rtl">
          <p className="text-[#1F2937BF]">جاري التحميل...</p>
        </div>
      </ParentLayout>
    );
  }

  const hasChildren = students.length > 0;

  return (
    <ParentLayout>
      <div className="space-y-6 p-2" dir="rtl">
        <WelcomeSection hasChildren={hasChildren} />

        <StatsCards stats={stats} hasChildren={hasChildren} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <NotificationsSection />
          </div>
          <div className="lg:col-span-1">
            <ChildrenOverviewSection children={students} />
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default Home;