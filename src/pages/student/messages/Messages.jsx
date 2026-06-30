import React, { useState } from "react";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import ConversationsList from "../../../components/student/messgaes/ConversationsList";
import ChatBox from "../../../components/student/messgaes/ChatBox";



const initialConversations = [
  {
    id: 1,
    name: "مجموعة الرياضيات A",
    role: "معلم الرياضيات",
    category: "groups",
    avatarInitial: "ر",
    teacherName: "عادل منصور",
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
    name: "مجموعة الكيمياء A",
    role: "معلم الكيمياء",
    category: "groups",
    avatarInitial: "ك",
    teacherName: "سامي علي",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم استلام الواجب المنزلي بنجاح، شكراً على المتابعة", time: "10:45" },
    ],
  },
  {
    id: 3,
    name: "مجموعة الفيزياء A",
    role: "معلم الفيزياء",
    category: "groups",
    avatarInitial: "ف",
    teacherName: "محمد عبدالله",
    unreadCount: 1,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم استلام الواجب المنزلي بنجاح، أداؤك ممتاز هذا الأسبوع", time: "10:45" },
    ],
  },
  {
    id: 4,
    name: "إدارة الأكاديمية",
    role: "الدعم الفني",
    category: "admin",
    avatarInitial: "إ",
    teacherName: "",
    unreadCount: 0,
    lastMessageTime: "أمس",
    lastMessagePreview: "تم تحديث اشتراكك بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم تحديث اشتراكك بنجاح، يمكنك متابعة حصصك كالمعتاد", time: "09:10" },
    ],
  },
];

export default function StudentMessagess() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const handleSelect = (id) => {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
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
    <StudentLayout>
      <div
        className="mx-auto flex h-full max-w-7xl flex-col pb-3 font-['IBM_Plex_Sans_Arabic'] text-right md:h-auto md:pb-0"
        dir="rtl"
      >
        <div className="shrink-0 pb-3 md:pb-6">
          <h1 className="text-[20px] font-semibold leading-7 text-[#123C91] md:text-[24px] md:leading-8 mb-1 md:mb-2">
            مركز الرسائل
          </h1>
          <p className="hidden text-[16px] font-normal leading-6 text-[#575F69] md:block">
            التواصل مع المعلمين والإدارة حول دراستك
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:flex-none md:grid-cols-[1.3fr_3fr]">

          <div
            className={`${showChatOnMobile ? "hidden" : "flex"} md:flex min-h-0 flex-col overflow-hidden bg-white md:h-175`}
            style={{
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
            className={`${showChatOnMobile ? "flex" : "hidden"} md:flex min-h-0 flex-col overflow-hidden bg-white md:h-175`}
            style={{
              borderRadius: "24px",
              border: "1px solid #E5E5E5",
              gap: "24px",
            }}
          >
            <ChatBox conversation={activeConversation} onSend={handleSend} onBack={handleBackToList} />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}