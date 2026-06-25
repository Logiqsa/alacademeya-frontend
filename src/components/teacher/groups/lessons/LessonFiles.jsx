import React from "react";
import { HiOutlineDocumentText, HiOutlineDownload } from "react-icons/hi";

const FileCard = ({ name, size, onDownload }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] flex items-center justify-center flex-shrink-0">
        <HiOutlineDocumentText size={18} className="text-[#123C91]" />
      </div>
      <div className="min-w-0">
        <p
          className="text-sm font-medium text-[#1A1A1A] truncate"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {name}
        </p>
        <p className="text-xs text-[#8C9198]" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
          {size}
        </p>
      </div>
    </div>
    <button
      onClick={onDownload}
      className="p-2 rounded-lg text-[#8C9198] group-hover:text-[#123C91] hover:bg-blue-100 transition-all flex-shrink-0"
    >
      <HiOutlineDownload size={18} />
    </button>
  </div>
);

const LessonFiles = ({ files = [] }) => {
  const defaultFiles = [
    { id: 1, name: "شرح المصفوفات", size: "PDF • 24MB" },
    { id: 2, name: "حل واجب المعادلات", size: "PDF • 24MB" },
    { id: 3, name: "شرح المصفوفات", size: "PDF • 24MB" },
    { id: 4, name: "حل واجب المعادلات", size: "PDF • 24MB" },
  ];

  const displayFiles = files.length > 0 ? files : defaultFiles;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3
        className="text-base font-semibold text-[#1A1A1A] mb-4"
        style={{ fontFamily: "Tajawal, sans-serif" }}
      >
        الملفات
      </h3>
      {displayFiles.length === 0 ? (
        <p className="text-sm text-[#8C9198] text-center py-4" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
          لا توجد ملفات
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayFiles.map((file) => (
            <FileCard
              key={file.id}
              name={file.name}
              size={file.size}
              onDownload={() => console.log("Download", file.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonFiles;