import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Maximize, Play, X } from "lucide-react";

const assetUrl = (url) =>
  !url
    ? ""
    : /^https?:\/\//i.test(url)
      ? typeof window !== "undefined" && window.location.protocol === "https:"
        ? url.replace(/^http:\/\//i, "https://")
        : url
      : `https://api.alacademeya.com/${url.replace(/^\//, "")}`;

const RecordingPlayer = ({ title, url, mimeType, onClose }) => {
  const videoRef = useRef(null);
  const [playError, setPlayError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (video?.requestFullscreen) video.requestFullscreen();
    else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-3 sm:p-6" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-[#111827] shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <h3 className="truncate font-semibold">{title || "تسجيل الحصة"}</h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={enterFullscreen} className="rounded-lg p-2 hover:bg-white/10" aria-label="ملء الشاشة"><Maximize size={20} /></button>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق المشغل"><X size={21} /></button>
          </div>
        </div>
        <div className="flex min-h-60 items-center justify-center bg-black sm:min-h-105">
          <video ref={videoRef} controls autoPlay playsInline preload="metadata" className="max-h-[78vh] w-full bg-black" onError={() => setPlayError("تعذر تشغيل هذا الملف داخل المتصفح. تأكد أن التسجيل MP4 بترميز H.264 وأن رابط الملف متاح للعرض.")} onContextMenu={(event) => event.preventDefault()}>
            <source src={url} type={mimeType || undefined} />
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
        </div>
        {playError && <p className="bg-red-950 px-4 py-3 text-center text-sm text-red-200">{playError}</p>}
      </div>
    </div>,
    document.body,
  );
};

const LessonRecordings = ({ recording }) => {
  const [open, setOpen] = useState(false);
  const url = assetUrl(
    recording?.url ||
      recording?.secureUrl ||
      recording?.secure_url ||
      (typeof recording?.recording === "string" ? recording.recording : "") ||
      recording?.recording?.url ||
      recording?.recording?.secureUrl ||
      recording?.recording?.secure_url ||
      recording?.file?.url ||
      recording?.recordingUrl ||
      recording?.videoUrl,
  );
  const mimeType =
    recording?.mimeType ||
    recording?.recording?.mimeType ||
    recording?.file?.mimeType ||
    (url.toLowerCase().includes(".mp4") ? "video/mp4" : undefined);

  return (
    <div dir="rtl" className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <h3 className="mb-4 text-xl font-semibold">تسجيل الحصة</h3>
      {!recording ? (
        <p className="py-6 text-center text-sm text-[#9CA3AF]">لم يرفع الأدمن تسجيل الحصة بعد</p>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{recording.title}</p>
            <p className="mt-1 text-xs text-[#8C9198]">{recording.createdAt ? new Date(recording.createdAt).toLocaleDateString("ar-EG") : ""}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => url && setOpen(true)} disabled={!url} className="flex items-center gap-2 rounded-lg bg-[#123C91] px-4 py-2 text-sm text-white [&_svg]:text-white disabled:cursor-not-allowed disabled:opacity-50"><Play size={17} />تشغيل</button>
            {url && <a href={url} download className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Download size={17} />تحميل</a>}
          </div>
        </div>
      )}
      {open && url && <RecordingPlayer title={recording.title} url={url} mimeType={mimeType} onClose={() => setOpen(false)} />}
    </div>
  );
};

export default LessonRecordings;
