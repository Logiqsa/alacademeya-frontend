// Messages.jsx
import React, { useContext, useState } from "react";
import ConversationsList from "../../components/parent/messages/ConversationsList";
import ChatBox from "../../components/parent/messages/ChatBox";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import { useChatRooms } from "../../api/useChatRooms";
import { AuthContext } from "../../context/AuthContext";

export default function Messages() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id ?? user?.id;

  const {
    conversations,
    activeId,
    loading,
    openConversation,
    leaveConversation,
    sendMessage,
    startSupportConversation,
  } = useChatRooms(currentUserId);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const handleNewConversation = async () => {
    const newId = await startSupportConversation();
    if (newId) setShowChatOnMobile(true);
  };

  const handleSelect = (id) => {
    openConversation(id);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    leaveConversation(activeId);
    setShowChatOnMobile(false);
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
            التواصل مع المعلمين والإدارة حول أبنائك
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">جاري تحميل المحادثات...</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-4 md:h-[700px]">

            {/* قائمة المحادثات */}
            <div
              className={`
                ${showChatOnMobile ? "hidden" : "flex"}
                md:flex
                w-full md:w-[320px] lg:w-[360px]
                shrink-0
                flex-col
                bg-white
                rounded-3xl
                border border-[#E5E5E5]
                min-h-0
              `}
            >
              <ConversationsList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onNewConversation={handleNewConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* صندوق المحادثة */}
            <div
              className={`
                ${showChatOnMobile ? "flex" : "hidden"}
                md:flex
                flex-1
                flex-col
                bg-white
                rounded-3xl
                border border-[#E5E5E5]
                min-h-0
                overflow-visible
              `}
            >
              <ChatBox
                conversation={activeConversation}
                onSend={sendMessage}
                onBack={handleBackToList}
              />
            </div>

          </div>
        )}
      </div>
    </ParentLayout>
  );
}