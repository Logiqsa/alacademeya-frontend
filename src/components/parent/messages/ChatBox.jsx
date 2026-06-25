import { useEffect, useRef, useState } from "react";
import { Send, CheckCheck } from "lucide-react";

export default function ChatBox({ conversation, onSend }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">اختر محادثة لعرض الرسائل</p>
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
    <div className="flex flex-1 flex-col">
      {/* هيدر المحادثة */}
      <div className="flex items-center justify-end gap-3 border-b border-gray-100 p-4">
        <span className="text-sm font-semibold text-slate-800">
          {conversation.name}{" "}
          <span className="font-normal text-gray-400">({conversation.role})</span>
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
          {conversation.avatarInitial}
        </span>
      </div>

      {/* الرسائل */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {conversation.messages.map((m) => {
          const isMe = m.sender === "me";
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  isMe
                    ? "rounded-tl-sm bg-blue-900 text-white"
                    : "rounded-tr-sm border border-blue-100 bg-blue-50/60 text-slate-700"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
                <div className={`mt-1 flex items-center gap-1 ${isMe ? "justify-start" : "justify-end"}`}>
                  <span className={`text-[11px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>{m.time}</span>
                  {isMe && m.status === "read" && <CheckCheck size={14} className="text-blue-200" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* إدخال رسالة */}
      <div className="flex items-center gap-3 border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={handleSend}
          className="flex items-center gap-2 rounded-lg bg-blue-300/40 px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-300/60"
        >
          <Send size={16} />
          إرسال
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
      </div>
    </div>
  );
}