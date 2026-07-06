import { Copy, ExternalLink, Video } from "lucide-react";
import toast from "react-hot-toast";

const LiveLessonLink = ({ lessonUrl, status }) => {
  const isLive = status === "live";
  const stateText = status === "completed" ? "الحصة منتهية" : status === "missed" ? "الحصة فائتة" : "الحصة لم تبدأ بعد";

  const copyLink = async () => {
    if (!lessonUrl) return;
    await navigator.clipboard.writeText(lessonUrl);
    toast.success("تم نسخ رابط الحصة");
  };

  return (
    <div className="flex w-full flex-col items-start justify-between gap-4 rounded-2xl bg-[#1F2937] px-5 py-4 text-white sm:flex-row sm:items-center" dir="rtl">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold"><Video size={18} />{isLive ? "الحصة بدأت الآن" : stateText}</h3>
        <p className="text-sm text-gray-400">{isLive ? lessonUrl ? "يمكنك الدخول باستخدام رابط المجموعة" : "لا يوجد رابط لقاء محفوظ لهذه المجموعة" : stateText}</p>
      </div>

      {isLive && lessonUrl && (
        <div className="flex items-center gap-2">
          <a href={lessonUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 font-semibold text-[#1F2937] hover:bg-gray-100">
            <ExternalLink size={17} />دخول الحصة
          </a>
          <button type="button" onClick={copyLink} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="نسخ رابط الحصة"><Copy size={18} /></button>
        </div>
      )}
    </div>
  );
};

export default LiveLessonLink;
