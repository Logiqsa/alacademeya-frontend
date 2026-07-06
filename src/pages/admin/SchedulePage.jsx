import AdminLayout from "../../components/admin/layout/AdminLayout";
import MonthlySchedule from "../../components/schedule/MonthlySchedule";

const SchedulePage = () => (
  <AdminLayout>
    <MonthlySchedule title="جدول الحصص" subtitle="متابعة جميع حصص الفصول النشطة خلال الشهر." />
  </AdminLayout>
);

export default SchedulePage;
