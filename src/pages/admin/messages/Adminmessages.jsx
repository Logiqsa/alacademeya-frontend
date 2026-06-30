import React, { useState } from "react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import ConversationsLists from "../../../components/admin/messages/Conversationslist";
import MonitorBox from "../../../components/admin/messages/Monitorbox";
import ChatBox from "../../../components/admin/messages/Chatbox";


// ─── Mock Data ────────────────────────────────────────────────────────────────
const MY_CONVERSATIONS = [
  {
    id: 1,
    name: "فارس محمد",
    role: "معلم الرياضيات",
    category: "teachers",
    avatarInitial: "ف",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "شكراً جزيلاً على متابعتك. سأحر...",
    messages: [
      { id: 1, sender: "them", text: "السلام عليكم، بخصوص جدول الحصص القادم", time: "10:32" },
      { id: 2, sender: "me",   text: "وعليكم السلام، سيتم إرساله قريباً", time: "10:35", status: "read" },
      { id: 3, sender: "them", text: "شكراً جزيلاً على متابعتك. سأحرص على المراجعة", time: "10:45" },
    ],
  },
  {
    id: 2,
    name: "فارس محمد",
    role: "معلم الرياضيات",
    category: "teachers",
    avatarInitial: "ف",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم استلام الواجب المنزلي بنجاح، شكراً", time: "10:45" },
    ],
  },
  {
    id: 3,
    name: "فارس محمد",
    role: "معلم الرياضيات",
    category: "teachers",
    avatarInitial: "ف",
    unreadCount: 1,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "them", text: "تم استلام الواجب المنزلي بنجاح", time: "10:45" },
    ],
  },
];

const MONITOR_CONVERSATIONS = [
  {
    id: 101,
    name: "مجموعة الرياضيات A",
    role: "معلم ← ولي أمر",
    category: "groups",
    avatarInitial: "ر",
    teacherName: "عادل منصور",
    parentName: "أحمد علي",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "شكراً جزيلاً على متابعتك. سأحر...",
    messages: [
      { id: 1, sender: "teacher", text: "السلام عليكم، أنا المعلم عادل منصور، معلم الرياضيات لابنك محمد", time: "10:32", senderName: "عادل منصور", senderRole: "معلم" },
      { id: 2, sender: "parent",  text: "وعليكم السلام، تشرفنا. كيف حال أحمد في المادة؟", time: "10:35", senderName: "أحمد علي", senderRole: "ولي أمر" },
      { id: 3, sender: "teacher", text: "الحمد لله، محمد يبلي بلاءً حسناً. لكن أنصح بالتركيز أكثر على الهندسة", time: "10:37", senderName: "عادل منصور", senderRole: "معلم" },
      { id: 4, sender: "teacher", text: 'من الأفضل مراجعة درس "التحويلات الهندسية" مع محمد لتحسين أداءه', time: "10:37", senderName: "عادل منصور", senderRole: "معلم" },
      { id: 5, sender: "parent",  text: "شكراً جزيلاً على متابعتك. سأحرص على مراجعة الهندسة معه", time: "10:42", senderName: "أحمد علي", senderRole: "ولي أمر" },
    ],
  },
  {
    id: 102,
    name: "مجموعة الكيمياء A",
    role: "معلم ← ولي أمر",
    category: "groups",
    avatarInitial: "ك",
    teacherName: "سامي نور",
    parentName: "خالد رضا",
    unreadCount: 2,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "teacher", text: "تم استلام الواجب المنزلي بنجاح، شكراً على المتابعة", time: "10:45", senderName: "سامي نور", senderRole: "معلم" },
    ],
  },
  {
    id: 103,
    name: "مجموعة الفيزياء A",
    role: "معلم ← ولي أمر",
    category: "groups",
    avatarInitial: "ف",
    teacherName: "محمد علاء",
    parentName: "يوسف كمال",
    unreadCount: 1,
    lastMessageTime: "10:45 ص",
    lastMessagePreview: "تم استلام الواجب المنزلي بنجاح",
    messages: [
      { id: 1, sender: "teacher", text: "تم استلام الواجب المنزلي بنجاح", time: "10:45", senderName: "محمد علاء", senderRole: "معلم" },
    ],
  },
];

const TABS = [
  { key: "chat",    label: "محادثاتي" },
  { key: "monitor", label: "مراقبة المحادثات" },
];

export default function AdminMessages() {
  const [activeTab, setActiveTab]   = useState("chat");
  const [myConvs,   setMyConvs]     = useState(MY_CONVERSATIONS);
  const [monitorConvs]              = useState(MONITOR_CONVERSATIONS);

  const [chatActiveId,    setChatActiveId]    = useState(MY_CONVERSATIONS[0]?.id ?? null);
  const [monitorActiveId, setMonitorActiveId] = useState(MONITOR_CONVERSATIONS[0]?.id ?? null);
  const [showChatMobile,  setShowChatMobile]  = useState(false);

  const [searchQuery,   setSearchQuery]   = useState("");
  const [activeFilter,  setActiveFilter]  = useState("all");

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleSelectChat = (id) => {
    setChatActiveId(id);
    setMyConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    setShowChatMobile(true);
  };

  const handleSelectMonitor = (id) => {
    setMonitorActiveId(id);
    setShowChatMobile(true);
  };

  const handleSend = (conversationId, text) => {
    setMyConvs((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const newMsg = {
          id: c.messages.length + 1,
          sender: "me",
          text,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          status: "sent",
        };
        return { ...c, messages: [...c.messages, newMsg], lastMessagePreview: text, lastMessageTime: newMsg.time };
      })
    );
  };

  const activeMyConv      = myConvs.find((c) => c.id === chatActiveId);
  const activeMonitorConv = monitorConvs.find((c) => c.id === monitorActiveId);

  const conversations = activeTab === "chat" ? myConvs : monitorConvs;
  const activeId      = activeTab === "chat" ? chatActiveId : monitorActiveId;
  const onSelect      = activeTab === "chat" ? handleSelectChat : handleSelectMonitor;

  return (
    <AdminLayout>
      <div className="w-full font-['IBM_Plex_Sans_Arabic'] text-right pb-4" dir="rtl">

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-[20px] sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-1 sm:mb-2">
            مركز الرسائل
          </h1>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            مراقبة المحادثات والتواصل المباشر مع مستخدمي الأكاديمية
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-end gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setShowChatMobile(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors font-['IBM_Plex_Sans_Arabic']
                ${activeTab === t.key
                  ? "bg-[#123C91] text-white"
                  : "bg-white border border-[#E5E5E5] text-[#575F69] hover:bg-gray-50"}`}
            >
              {t.key === "chat"    && <span>💬</span>}
              {t.key === "monitor" && <span>👁️</span>}
              {t.label}
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_3fr] gap-4 min-h-0">

          {/* Conversations list */}
          <div className={`${showChatMobile ? "hidden" : "flex"} md:flex flex-col overflow-hidden bg-white rounded-3xl border border-[#E5E5E5]`}
            style={{ minHeight: "560px", maxHeight: "700px" }}>
            <ConversationsLists
              conversations={conversations}
              activeId={activeId}
              onSelect={onSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              mode={activeTab}
            />
          </div>

          {/* Chat / Monitor panel */}
          <div className={`${showChatMobile ? "flex" : "hidden"} md:flex flex-col overflow-hidden bg-white rounded-3xl border border-[#E5E5E5]`}
            style={{ minHeight: "560px", maxHeight: "700px" }}>
            {activeTab === "chat" ? (
              <ChatBox
                conversation={activeMyConv}
                onSend={handleSend}
                onBack={() => setShowChatMobile(false)}
              />
            ) : (
              <MonitorBox
                conversation={activeMonitorConv}
                onBack={() => setShowChatMobile(false)}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}