import bellIcon from "../../../assets/icons/bell-icon.svg"; 

const notifications = [
  { id: 1, text: "درس الفيزياء يبدأ بعد 30 دقيقة", time: "منذ 5 دقائق" },
  { id: 2, text: "حصل محمد على درجة 95% في اختبار الرياضيات", time: "منذ ساعة" },
  { id: 3, text: "تم تحديث الجدول الدراسي", time: "منذ ساعتين" },
  { id: 4, text: "حصلت سلمى على درجة 100% في اختبار الجغرافيا", time: "منذ 3 ساعات" },
];

const NotificationsSection = () => {
  return (
    // <div className="bg-white border border-[#1F293726] rounded-2xl p-6 flex flex-col">
    //   <div className="flex items-center justify-between mb-6">
    //     <div className="flex items-center gap-2">
    //       <img src={bellIcon} alt="bell" className="w-6 h-6" />
    //       <h3 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[20px] text-[#123C91]">الإشعارات الأخيرة</h3>
    //     </div>
    //     <span className="text-[#123C91] cursor-pointer text-sm font-medium">عرض الكل</span>
    //   </div>

    //   <div className="space-y-4">
    //     {notifications.map((n) => (
    //       <div key={n.id} className="p-4 border-r-4 border-[#00BFA6] bg-[#F9FAFB] rounded-lg flex items-center justify-between">
    //         <span className="text-[#1F2937] font-medium">{n.text}</span>
    //         <span className="text-[#1F2937BF] text-xs">{n.time}</span>
    //       </div>
    //     ))}
    //   </div>
    // </div>

    <></>
  );
};
export default NotificationsSection;