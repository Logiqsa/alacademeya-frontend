import React, { useState, useContext } from "react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import ConversationsList from "../../../components/admin/messages/Conversationslist";
import ChatBox from "../../../components/admin/messages/Chatbox";
import { useChatRooms } from "../../../api/useChatRooms"; // تأكد من المسار الصحيح
import { AuthContext } from "../../../context/AuthContext";

// الفلترات الجديدة بناءً على طلبك
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

  // Logic الفلترة الجديد
  const filteredConversations = conversations.filter((c) => {
    console.log(c);

    if (activeFilter === "all") return true;

    // الفصول (تعتمد على الـ category أو الـ type)
    if (activeFilter === "groups") {
      return c.category === "groups" || c.type === "classroom";
    }

    // الأدوار (تعتمد على الـ role داخل الـ participants)
    return c.participants?.some((p) => p.role === activeFilter);
  });

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <AdminLayout>
      <div
        className="w-full font-['IBM_Plex_Sans_Arabic'] text-right pb-4"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[#123C91] mb-2">
            مركز الرسائل
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4 h-[800px] ">
            {/* Conversations List */}
            <div
              className={`${showChatMobile ? "hidden" : "flex"} md:flex flex-col bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden`}
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
              className={`${showChatMobile ? "flex" : "hidden"} md:flex flex-col  bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden`}
            >
              {activeConversation ? (
                <ChatBox
                  conversation={activeConversation}
                  onSend={sendMessage}
                  onBack={handleBack}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
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
