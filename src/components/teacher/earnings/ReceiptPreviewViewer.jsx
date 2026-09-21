import { useEffect, useRef, useState } from "react";
import { Download, FileText, Maximize2, Minimize2, X } from "lucide-react";

export default function ReceiptPreviewViewer({ receipt, onClose }) {
  const viewerRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const isImage = receipt.mimeType.startsWith("image/");
  const isPdf = receipt.mimeType === "application/pdf";

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === viewerRef.current);
    const handleEscape = (event) => { if (event.key === "Escape" && !document.fullscreenElement) onClose(); };
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const close = async () => {
    if (document.fullscreenElement === viewerRef.current) await document.exitFullscreen();
    onClose();
  };
  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    if (document.fullscreenElement === viewerRef.current) await document.exitFullscreen();
    else await viewerRef.current.requestFullscreen();
  };

  return <div dir="rtl" className="fixed inset-0 z-[120] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="عرض إيصال التحويل" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <div ref={viewerRef} className={`flex w-full flex-col overflow-hidden border border-white/15 bg-[#081A3A] shadow-2xl ${fullscreen ? "h-screen max-w-none rounded-none border-0" : "max-w-5xl rounded-2xl"}`}>
      <header className="flex items-center justify-between gap-3 bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white sm:px-5">
        <div className="min-w-0"><p className="text-[10px] text-[#8FE3D8]">إيصال سحب الأرباح</p><h2 className="truncate text-sm font-bold sm:text-base">عرض إيصال التحويل</h2></div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={toggleFullscreen} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20" aria-label={fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}><span className="hidden sm:inline">{fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}</span>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <a href={receipt.url} download={receipt.fileName} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"><span>تحميل</span><Download size={16} /></a>
          <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="إغلاق"><X size={18} /></button>
        </div>
      </header>
      <div className={`min-h-0 bg-[#050B17] p-2 sm:p-4 ${fullscreen ? "flex-1" : ""}`}>
        {isImage ? <img src={receipt.url} alt="إيصال التحويل" className={fullscreen ? "h-full w-full bg-white object-contain" : "mx-auto max-h-[75vh] max-w-full rounded-lg bg-white object-contain"} /> : isPdf ? <iframe src={receipt.url} title="إيصال التحويل" className={`${fullscreen ? "h-full" : "h-[75vh] rounded-lg"} w-full bg-white`} /> : <div className="grid min-h-64 place-items-center rounded-lg bg-white p-6 text-center text-[#344054]"><div><FileText size={36} className="mx-auto mb-3 text-[#123C91]" /><p>لا تتوفر معاينة لهذا النوع من الملفات. يمكنك تحميل الإيصال من الأعلى.</p></div></div>}
      </div>
    </div>
  </div>;
}
