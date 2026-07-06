import { useEffect, useRef, useState } from "react";
import { Send, CheckCheck, ArrowRight } from "lucide-react";

export default function ChatBox({ conversation, onSend, onBack }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
          <Send size={20} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 font-['IBM_Plex_Sans_Arabic']">
          اختر محادثة لعرض الرسائل
        </p>
      </div>
    );
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(conversation.id, trimmed);
    setText("");
    textareaRef.current?.focus();
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
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-gray-100 md:hidden"
          aria-label="رجوع"
        >
          <ArrowRight size={18} />
        </button>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white text-sm font-bold text-white sm:h-10 sm:w-10">
          {conversation.avatarInitial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-slate-800 font-['IBM_Plex_Sans_Arabic'] sm:text-[15px]">
            {conversation.name}
          </p>
          <p className="truncate text-[11px] text-gray-400 font-['IBM_Plex_Sans_Arabic'] sm:text-[12px]">
            {conversation.role}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-5">
        <div className="mt-auto space-y-3 sm:space-y-4">
          {conversation.messages.map((m) => {
            const isMe = m.sender === "me";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:max-w-[75%] sm:px-4 sm:py-3 ${
                    isMe
                      ? "rounded-tr-sm bg-[#123C91] text-white [&_svg]:text-white"
                      : "rounded-tl-sm border border-blue-100 bg-[#EAF4FF] text-slate-700"
                  }`}
                >
                  <p
                    className={`mb-1 text-[11px] font-semibold ${
                      isMe ? "text-blue-100" : "text-[#123C91]"
                    }`}
                  >
                    {m.senderName || (isMe ? "أنت" : conversation.name)}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed font-['IBM_Plex_Sans_Arabic'] sm:text-sm">
                    {m.text}
                  </p>
                  <div className={`mt-1 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] sm:text-[11px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                      {m.time}
                    </span>
                    {isMe && m.status === "read" && <CheckCheck size={13} className="text-blue-200" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-100 p-2.5 sm:gap-3 sm:p-4">
        <input
          ref={textareaRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-slate-700 placeholder:text-gray-400 focus:border-[#123C91] focus:outline-none focus:ring-1 focus:ring-[#123C91] font-['IBM_Plex_Sans_Arabic'] sm:px-4 sm:text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="إرسال"
          className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#123C91] text-white [&_svg]:text-white transition-colors hover:bg-[#0f2f70] disabled:cursor-not-allowed disabled:bg-[#123C91]/25 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5"
        >
          <Send size={16} />
          <span className="hidden text-sm font-semibold font-['IBM_Plex_Sans_Arabic'] sm:inline">
            إرسال
          </span>
        </button>
      </div>
    </div>
  );
}
