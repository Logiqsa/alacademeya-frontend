import React, { useContext, useState } from "react";
import ConversationsList from "../../components/parent/messages/ConversationsList";
import ChatBox from "../../components/parent/messages/ChatBox";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import { useChatRooms } from "../../api/useChatRooms";
import { AuthContext } from "../../context/AuthContext";

export default function Messages() {
  // ⚠️ تأكد إن AuthContext فيه user._id أو user.id - عدّل السطر ده لو
  // اسم الحقل مختلف عندك.
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id ?? user?.id;

  const {
    conversations,
    activeId,
    loading,
    openConversation,
    leaveConversation,
    sendMessage,
    startSupportConversation, // 👈 جديد
  } = useChatRooms(currentUserId);

  const handleNewConversation = async () => {
    const newId = await startSupportConversation();
    if (newId) setShowChatOnMobile(true);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // على الموبايل: بيتحكم في إظهار الـ ChatBox بدل القائمة.
  // من md فوق القائمتين بيبانوا دايمًا جنب بعض فمتغيرة دي مالها قيمة هناك.
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const handleSelect = (id) => {
    openConversation(id);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    leaveConversation(activeId);
    setShowChatOnMobile(false);
  };

  const handleSend = (conversationId, text) => {
    sendMessage(conversationId, text);
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <ParentLayout>
      <div
        className="mx-auto flex h-full max-w-7xl flex-col pb-3 font-['IBM_Plex_Sans_Arabic'] text-right md:h-auto md:pb-0"
        dir="rtl"
      >
        <div className="shrink-0 pb-3 md:pb-6">
          <h1 className="text-[20px] font-semibold leading-7 text-[#123C91] md:text-[24px] md:leading-8 mb-1 md:mb-2">
            مركز الرسائل
          </h1>
          <p className="hidden text-[16px] font-normal leading-6 text-[#575F69] md:block">
            التواصل مع المعلمين و الإدارة حول أبنائك
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            جاري تحميل المحادثات...
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:flex-none md:grid-cols-[1.3fr_3fr]">
            {/* قائمة المحادثات - على الموبايل تبان بس لو مفيش محادثة مفتوحة */}
            <div
              className={`${showChatOnMobile ? "hidden" : "flex"} md:flex min-h-0 flex-col overflow-hidden bg-white md:h-[700px]`}
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
                onNewConversation={handleNewConversation} // 👈 جديد
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* صندوق المحادثة - على الموبايل يبان بس لو فيه محادثة مفتوحة */}
            <div
              className={`${showChatOnMobile ? "flex" : "hidden"} md:flex min-h-0 flex-col overflow-hidden bg-white md:h-[700px]`}
              style={{
                borderRadius: "24px",
                border: "1px solid #E5E5E5",
                gap: "24px",
              }}
            >
              <ChatBox conversation={activeConversation} onSend={handleSend} onBack={handleBackToList} />
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}