import { useEffect, useRef, useState } from "react";
import { Send, CheckCheck, ArrowRight } from "lucide-react";

export default function ChatBox({ conversation, onSend, onBack }) {
  const [text, setText] = useState("");
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

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(conversation.id, trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
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
            {conversation.name}
          </p>
          <p className="text-[12px] text-gray-400 font-['IBM_Plex_Sans_Arabic']">{conversation.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
        <div className="mt-auto space-y-4">
          {conversation.messages.map((m) => {
            const isMe = m.sender === "me";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMe
                      ? "rounded-tr-sm bg-[#123C91] text-white"
                      : "rounded-tl-sm border border-blue-100 bg-[#EAF4FF] text-slate-700"
                  }`}
                >
                  <p className="text-sm leading-relaxed font-['IBM_Plex_Sans_Arabic']">{m.text}</p>
                  <div className={`mt-1 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[11px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>{m.time}</span>
                    {isMe && m.status === "read" && <CheckCheck size={14} className="text-blue-200" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-100 p-3 md:gap-3 md:p-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-gray-400 focus:border-[#123C91] focus:outline-none focus:ring-1 focus:ring-[#123C91] font-['IBM_Plex_Sans_Arabic']"
        />
        <button
          type="button"
          onClick={handleSend}
          aria-label="إرسال"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#123C91]/20 text-[#123C91] hover:bg-[#123C91]/30 md:h-auto md:w-auto md:gap-2 md:px-5 md:py-2.5 transition-colors"
        >
          <Send size={16} />
          <span className="hidden text-sm font-semibold md:inline font-['IBM_Plex_Sans_Arabic']">إرسال</span>
        </button>
      </div>
    </div>
  );
}