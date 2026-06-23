import { Video, Clock, Users } from "lucide-react";

const lessons = [
  {
    id: 1,
    title: "الرياضيات - الصف الثالث الثانوي",
    group: "مجموعة A",
    time: "10:00 ص",
    students: "8 طلاب",
    status: "active", 
  },
  {
    id: 2,
    title: "الرياضيات - الصف الثالث الثانوي",
    group: "مجموعة B",
    time: "5:00 م",
    students: "30 طالب",
    status: "upcoming",
  },
  {
    id: 3,
    title: "الرياضيات - الصف الثالث الثانوي",
    group: "مجموعة B",
    time: "5:00 م",
    students: "30 طالب",
    status: "upcoming",
  },
];

const UpcomingLessonsSection = () => {
  return (
    <div className="bg-white border border-[#1F293726] rounded-2xl p-6 w-full h-full font-['Tajawal']" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[18px] font-medium text-[#1F2937]">الدروس القادمة</h3>
          <p className="text-[16px] font-normal text-[#8C9198] font-['IBM_Plex_Sans_Arabic']">جدول دروسك القادم</p>
        </div>
        <button className="text-[#123C91] text-[16px] font-medium hover:underline">عرض الكل</button>
      </div>

     
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between p-4 border border-[#1F29371A] rounded-xl hover:border-[#123C91] transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#EAF4FF] rounded-lg text-[#123C91]">
                <Video size={24} />
              </div>
              <div>
                <h4 className="text-[16px] font-normal text-[#1F2937] font-['IBM_Plex_Sans_Arabic']">{lesson.title}</h4>
                <p className="text-[16px] font-normal text-[#123C91] font-['IBM_Plex_Sans_Arabic']">{lesson.group}</p>
                <div className="flex items-center gap-3 mt-1 text-[#8C9198] text-[12px]">
                  <span className="flex items-center gap-1"><Clock size={14} /> {lesson.time}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {lesson.students}</span>
                </div>
              </div>
            </div>

          
            <button
              className={`w-22 h-10 rounded-lg text-[14px] font-medium transition-all flex items-center justify-center ${
                lesson.status === "active"
                  ? "bg-[#123C91] text-white"
                  : "bg-[#123C9180] text-[#FFFFFF]" 
              }`}
            >
              {lesson.status === "active" ? "بدء الدرس" : "سيبدأ قريباً"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingLessonsSection;