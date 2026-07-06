import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import MonthlySchedule from "../../../components/schedule/MonthlySchedule";

const Schedule = () => (
  <TeacherLayout>
    <MonthlySchedule title="جدول دروسك" subtitle="متابعة حصصك خلال الشهر الحالي والتنقل بين الشهور." />
  </TeacherLayout>
);

export default Schedule;
