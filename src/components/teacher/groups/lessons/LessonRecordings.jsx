import React from "react";
import { HiOutlinePlay, HiOutlineDownload, HiOutlineShare } from "react-icons/hi";

const RecordingCard = ({ title, subject, date, size, thumbnail, isLive, onPlay, onDownload, onShare }) => (
  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-all">
    {/* Thumbnail */}
    <div className="relative aspect-video bg-gradient-to-br from-[#1F2937] to-[#374151] overflow-hidden">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <HiOutlinePlay size={40} className="text-white/40" />
        </div>
      )}
      {/* Live badge */}
      {isLive && (
        <span className="absolute top-2 right-2 bg-[#00A63E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          الآن
        </span>
      )}
      {/* Play overlay */}
      <button
        onClick={onPlay}
        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <HiOutlinePlay size={22} className="text-[#1F2937] ml-0.5" />
        </div>
      </button>
    </div>

    {/* Info */}
    <div className="p-3" dir="rtl">
      <h4
        className="text-sm font-semibold text-[#1A1A1A] truncate"
        style={{ fontFamily: "Tajawal, sans-serif" }}
      >
        {title}
      </h4>
      <p className="text-xs text-[#8C9198] mt-0.5 mb-3" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
        {subject} • {date}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8C9198] flex items-center gap-1">
          <span>💾</span> {size}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onShare}
            className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-blue-50 transition-all"
          >
            <HiOutlineShare size={16} />
          </button>
          <button
            onClick={onDownload}
            className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-blue-50 transition-all"
          >
            <HiOutlineDownload size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LessonRecordings = ({ recordings = [] }) => {
  const defaultRecordings = [
    {
      id: 1,
      title: "حساب المتجهات والمصفوفات",
      subject: "رياضيات A",
      date: "2024-06-13",
      size: "1.8 GB",
      isLive: false,
      thumbnail: null,
    },
    {
      id: 2,
      title: "حساب المتجهات والمصفوفات",
      subject: "رياضيات A",
      date: "2024-06-13",
      size: "1.8 GB",
      isLive: true,
      thumbnail: null,
    },
  ];

  const displayRecordings = recordings.length > 0 ? recordings : defaultRecordings;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3
        className="text-base font-semibold text-[#1A1A1A] mb-4"
        style={{ fontFamily: "Tajawal, sans-serif" }}
      >
        التسجيلات
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRecordings.map((rec) => (
          <RecordingCard
            key={rec.id}
            {...rec}
            onPlay={() => console.log("Play", rec.id)}
            onDownload={() => console.log("Download", rec.id)}
            onShare={() => console.log("Share", rec.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonRecordings;