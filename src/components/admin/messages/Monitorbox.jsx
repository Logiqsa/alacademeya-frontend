import { useEffect, useRef } from "react";
import { ArrowRight, Trash2 } from "lucide-react";

// Color per sender role
const bubbleStyle = (sender) => {
  if (sender === "teacher")
    return "rounded-tr-sm bg-[#123C91] text-white ml-auto";
  // parent
  return "rounded-tl-sm border border-blue-100 bg-[#EAF4FF] text-slate-700 mr-auto";
};

const timeStyle = (sender) =>
  sender === "teacher" ? "text-blue-200 justify-end" : "text-gray-400 justify-start";

export default function MonitorBox({ conversation, onBack }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400 font-['IBM_Plex_Sans_Arabic']">اختر محادثة لعرض الرسائل</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-gray-100 md:hidden"
            aria-label="رجوع"
          >
            <ArrowRight size={18} />
          </button>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-sm font-bold text-white">
            {conversation.avatarInitial}
          </span>
          <div>
            <p className="text-[15px] font-semibold text-slate-800 font-['IBM_Plex_Sans_Arabic']">
              {conversation.teacherName}
              <span className="mx-1.5 text-gray-400">←</span>
              {conversation.parentName}
            </p>
            <p className="text-[12px] text-gray-400 font-['IBM_Plex_Sans_Arabic']">
              معلم &nbsp;←&nbsp; ولي أمر
            </p>
          </div>
        </div>

        {/* Delete conversation button */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="حذف المحادثة"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* Messages — read only */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
        <div className="mt-auto space-y-4">
          {conversation.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "teacher" ? "items-end" : "items-start"}`}
            >
              {/* Sender label */}
              <span className="text-[11px] text-gray-400 mb-1 px-1 font-['IBM_Plex_Sans_Arabic']">
                {m.senderName} · {m.senderRole}
              </span>

              <div className={`max-w-[85%] md:max-w-[72%] rounded-2xl px-4 py-3 ${bubbleStyle(m.sender)}`}>
                <p className="text-sm leading-relaxed font-['IBM_Plex_Sans_Arabic']">{m.text}</p>
                <div className={`mt-1 flex items-center gap-1 ${timeStyle(m.sender)}`}>
                  <span className="text-[11px]">{m.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Monitor notice bar — no input */}
      <div className="border-t border-[#FDE68A] bg-[#FFFBEB] px-5 py-3">
        <p className="text-[13px] text-[#B45309] text-center font-['IBM_Plex_Sans_Arabic']">
          <span className="font-semibold">وضع المراقبة</span> — يمكنك مشاهدة المحادثة وحذف الرسائل غير اللائقة فقط
        </p>
      </div>
    </div>
  );
}