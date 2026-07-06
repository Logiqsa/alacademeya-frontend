import React, { useState, useContext } from "react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import ConversationsList from "../../../components/admin/messages/Conversationslist";
import ChatBox from "../../../components/admin/messages/Chatbox";
import { useChatRooms } from "../../../api/useChatRooms"; // تأكد من المسار الصحيح
import { AuthContext } from "../../../context/AuthContext";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "groups", label: "الفصول" },
  { key: "student", label: "الطلاب" },
  { key: "teacher", label: "المعلمون" },
  { key: "parent", label: "أولياء الأمور" },
];

export default function AdminMessages() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?._id ?? user?.id;

  const {
    conversations,
    activeId,
    loading,
    openConversation,
    leaveConversation,
    sendMessage,
  } = useChatRooms(currentUserId);

  const [showChatMobile, setShowChatMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const handleSelect = (id) => {
    openConversation(id);
    setShowChatMobile(true);
  };

  const handleBack = () => {
    leaveConversation(activeId);
    setShowChatMobile(false);
    openConversation(null);
  };

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "groups") {
      return c.category === "groups" || c.type === "classroom";
    }
    return c.participants?.some((p) => p.role === activeFilter);
  });

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <AdminLayout>
      <div className="w-full pb-4 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-[20px] font-semibold text-[#123C91] sm:text-[24px]">مركز الرسائل</h1>
        </div>

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center sm:h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          </div>
        ) : (
          <div className="grid h-[calc(100dvh-160px)] grid-cols-1 gap-3 sm:gap-4 md:h-[750px] md:grid-cols-[300px_1fr] lg:h-[800px] lg:grid-cols-[350px_1fr]">
            {/* Conversations List */}
            <div
              className={`${
                showChatMobile ? "hidden" : "flex"
              } min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white sm:rounded-3xl md:flex`}
            >
              <ConversationsList
                conversations={filteredConversations}
                activeId={activeId}
                onSelect={handleSelect}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* Chat Box */}
            <div
              className={`${
                showChatMobile ? "flex" : "hidden"
              } min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white sm:rounded-3xl md:flex`}
            >
              {activeConversation ? (
                <ChatBox conversation={activeConversation} onSend={sendMessage} onBack={handleBack} />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-400">
                  اختر محادثة للبدء
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}