import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonFiles from "../../../components/student/groupLesson/Lessonfiles";

const LessonFilesPage = () => {
  return (
    <StudentLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
            ملفات الحصة
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            كل الملفات والمرفقات الخاصة بهذه الحصة في مكان واحد.
          </p>
        </div>

        <LessonFiles />
      </div>
    </StudentLayout>
  );
};

export default LessonFilesPage;
