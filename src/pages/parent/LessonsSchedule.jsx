import ParentLayout from "../../components/parent/layout/ParentLayout";
import MonthlySchedule from "../../components/schedule/MonthlySchedule";

const LessonsSchedule = () => (
  <ParentLayout>
    <MonthlySchedule role="parent" title="جدول دروس الأبناء" subtitle="متابعة حصص أبنائك خلال الشهر الحالي والتنقل بين الشهور." />
  </ParentLayout>
);

export default LessonsSchedule;
