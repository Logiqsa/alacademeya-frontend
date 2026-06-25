import React, { useState } from "react";
import { HiOutlineShare, HiOutlineClipboardCopy, HiOutlineCheckCircle } from "react-icons/hi";
import { HiOutlineVideoCamera } from "react-icons/hi";

const LiveLessonLink = ({ lessonUrl = "https://lesson.link/abc123", isLive = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(lessonUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="w-full rounded-2xl bg-[#1F2937] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      dir="rtl"
    >
      <div className="flex-1">
        <h3
          className="text-base font-semibold mb-1"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          رابط الحصة المباشرة
        </h3>
        <p className="text-sm text-gray-400" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
          شارك الرابط مع الطلاب للانضمام
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
        >
          {copied ? <HiOutlineCheckCircle size={17} className="text-green-400" /> : <HiOutlineClipboardCopy size={17} />}
          {copied ? "تم النسخ" : "نسخ الرابط"}
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A63E] hover:bg-[#008f35] text-sm font-semibold transition-all"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
        >
          <HiOutlineVideoCamera size={17} />
          بدء الدرس
        </button>
      </div>
    </div>
  );
};

export default LiveLessonLink;