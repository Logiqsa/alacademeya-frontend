import { Bell } from "lucide-react";

const notifications = [
  { id: 1, title: "درس الرياضيات مجموعة A يبدأ بعد 30 دقيقة", time: "منذ 5 دقائق" },
  { id: 2, title: "لديك رسالة جديدة من ولي أمر محمد أحمد", time: "منذ 2 ساعة" },
  { id: 3, title: "تمت الموافقة على طلب سحب الأرباح الخاص بك", time: "منذ 3 ساعة" },
  { id: 4, title: "لديك رسالة جديدة من ولي أمر محمد أحمد", time: "منذ 2 ساعة" },
];

const NotificationsSection = () => {
  return (
    <div
      className="bg-white border border-[#1F293726] rounded-2xl p-4 sm:p-6 w-full h-full font-['Tajawal'] flex flex-col"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-[18px] font-medium text-[#1F2937]">الإشعارات الأخيرة</h3>
        <button className="text-sm sm:text-[16px] text-[#123C91] font-medium hover:underline shrink-0">
          عرض الكل
        </button>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="w-full min-h-18 flex items-center gap-3 p-3 sm:p-4 border border-[#1F29371A] rounded-lg relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#12C6B0]" />

            <div className="p-2 bg-[#EAF4FF] rounded-lg text-[#12C6B0] shrink-0">
              <Bell size={20} />
            </div>

            <div className="text-right min-w-0">
              <p className="font-['IBM_Plex_Sans_Arabic'] font-normal mb-1.5 sm:mb-2 text-[13px] sm:text-[14px] leading-4 text-[#1F2937]">
                {notif.title}
              </p>
              <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[11px] sm:text-[12px] leading-4 text-[#8C9198] mt-1">
                {notif.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsSection;