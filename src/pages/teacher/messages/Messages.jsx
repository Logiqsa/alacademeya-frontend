import React, { useState } from "react";

import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import ConversationsList from "../../../components/teacher/messages/ConversationsList";
import ChatBox from "../../../components/teacher/messages/ChatBox";

const initialConversations = [
  {
    id: 1,
    name: "عادل منصور",
    role: "معلم الرياضيات",
    category: "teachers",
    avatarInitial: "ع",
    studentName: "محمد",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "شكراً جزيلاً على متابعتك. سأحرص...",
    messages: [
      { id: 1, sender: "them", text: "السلام عليكم، أنا المعلم عادل منصور، معلم الرياضيات لابنك محمد", time: "10:32" },
      { id: 2, sender: "me", text: "وعليكم السلام، تشرفنا. كيف حال محمد في المادة؟", time: "10:35", status: "read" },
      { id: 3, sender: "them", text: "الحمد لله، محمد يبلي بلاءً حسناً. لكن أنصح بالتركيز أكثر على الهندسة", time: "10:37" },
      { id: 4, sender: "them", text: 'من الأفضل مراجعة درس "التحويلات الهندسية" مع محمد لتحسين أداءه', time: "10:37" },
      { id: 5, sender: "me", text: "شكراً جزيلاً على متابعتك. سأحرص على مراجعة الهندسة معه", time: "10:42", status: "read" },
    ],
  },
  {
    id: 2,
    name: "خالد علاء",
    role: "معلم الجغرافيا",
    category: "teachers",
    avatarInitial: "خ",
    studentName: "سامي",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم استلام الواجب المنزلي بنجاح، شكراً على المتابعة", time: "10:45" },
    ],
  },
  {
    id: 3,
    name: "سامي محمد",
    role: "معلم اللغة العربية",
    category: "teachers",
    avatarInitial: "س",
    studentName: "محمد",
    unreadCount: 1,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم استلام الواجب المنزلي بنجاح، أداء محمد ممتاز هذا الأسبوع", time: "10:45" },
    ],
  },
];

export default function TeacherMessages() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const handleSelect = (id) => {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  };

  const handleSend = (conversationId, text) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const newMessage = {
          id: c.messages.length + 1,
          sender: "me",
          text,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          status: "sent",
        };
        return { ...c, messages: [...c.messages, newMessage], lastMessagePreview: text, lastMessageTime: newMessage.time };
      })
    );
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto p-2 space-y-6 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        <div >
          <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">مركز الرسائل</h1>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">التواصل مع المعلمين و الإدارة حول أبنائك</p>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "1.3fr 3fr",
            gap: "16px",
          }}
        >
          <div
            className="flex flex-col overflow-hidden bg-white"
            style={{
              height: "700px",
              borderRadius: "24px",
              border: "1px solid #E5E5E5",
              paddingLeft: "10px",
              paddingRight: "10px",
              gap: "8px",
            }}
          >
            <ConversationsList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div
            className="flex flex-col overflow-hidden bg-white"
            style={{
              height: "700px",
              borderRadius: "24px",
              border: "1px solid #E5E5E5",
              gap: "24px",
            }}
          >
            <ChatBox conversation={activeConversation} onSend={handleSend} />
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}