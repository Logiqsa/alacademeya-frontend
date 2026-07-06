import { HiOutlineDownload, HiOutlinePlay } from "react-icons/hi";

const assetUrl = (url) => !url ? "" : /^https?:\/\//i.test(url) ? url : `https://api.alacademeya.com/${url.replace(/^\//, "")}`;

const LessonRecordings = ({ recording }) => {
  const url = assetUrl(recording?.url || recording?.recording?.url || recording?.file?.url);
  return <div dir="rtl" className="rounded-2xl border border-[#E5E5E5] bg-white p-5"><h3 className="mb-4 text-xl font-semibold">تسجيل الحصة</h3>{!recording ? <p className="py-6 text-center text-sm text-[#9CA3AF]">لم يرفع الأدمن تسجيل الحصة بعد</p> : <div className="flex items-center justify-between rounded-xl border p-4"><div><p className="font-medium">{recording.title}</p><p className="mt-1 text-xs text-[#8C9198]">{recording.createdAt ? new Date(recording.createdAt).toLocaleDateString("ar-EG") : ""}</p></div><div className="flex gap-2"><a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-[#123C91] p-2 text-white"><HiOutlinePlay /></a><a href={url} download className="rounded-lg border p-2"><HiOutlineDownload /></a></div></div>}</div>;
};

export default LessonRecordings;
