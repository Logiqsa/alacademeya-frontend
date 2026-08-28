import { useEffect, useRef, useState } from "react";
import { Send, CheckCheck, ArrowRight, Trash2, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";
import { getUser, updateUser, deleteUser as deleteUserApi } from "../../../services/APIService";
import { mapAdminUser } from "../../../utils/adminUser";
import { approveRegistrationRequest } from "../../../utils/approveRegistrationRequest";
import { UserDetailsModal } from "../users/Userstable";

export default function ChatBox({
  conversation,
  resolvedUser,
  onSend,
  onBack,
  onDeleteMessage,
  onToggleActive,
  onDeleteRoom,
}) {
  const [text, setText] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userPopup, setUserPopup] = useState(null);
  const [userPopupLoading, setUserPopupLoading] = useState(false);
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

  const handleDeleteMessage = async (messageId) => {
    try {
      await onDeleteMessage(conversation.id, messageId);
      toast.success("تم حذف الرسالة");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر حذف الرسالة");
    }
  };

  const handleToggleActive = async () => {
    const nextActive = !conversation.isActive;
    const action = nextActive ? "تفعيل" : "تعطيل";
    try {
      await onToggleActive(conversation.id, nextActive);
      toast.success(`تم ${action} المحادثة`);
    } catch (error) {
      toast.error(error.response?.data?.message || `تعذر ${action} المحادثة`);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await onDeleteRoom(conversation.id);
      toast.success("تم حذف المحادثة بالكامل");
      onBack?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر حذف المحادثة");
    }
  };

  const handleOpenUserPopup = async () => {
    if (!resolvedUser?.id) {
      toast.error(
        "تعذر تحديد المستخدم بدقة (الاسم غير فريد أو غير مسجل) — جرّب البحث عنه في صفحة المستخدمين",
      );
      return;
    }
    setUserPopupLoading(true);
    try {
      const res = await getUser(resolvedUser.id);
      const raw = res.data?.data ?? res.data;
      setUserPopup(mapAdminUser(raw));
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر تحميل بيانات المستخدم");
    } finally {
      setUserPopupLoading(false);
    }
  };

  const handleApproveUser = async (user) => {
    try {
      await approveRegistrationRequest({ userId: user.id, role: user.rawRole });
      setUserPopup((current) =>
        current
          ? { ...current, registrationStatus: "active", isActive: true, status: "نشط" }
          : current,
      );
      toast.success("تم قبول الطلب وتفعيل الحساب");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "تعذر قبول الطلب");
    }
  };

  const handleToggleUserStatus = async (user) => {
    const willActivate = user.status === "موقوف" || user.status === "معلق";
    try {
      await updateUser(user.id, { isActive: willActivate });
      setUserPopup((current) =>
        current
          ? { ...current, isActive: willActivate, status: willActivate ? "نشط" : "موقوف" }
          : current,
      );
      toast.success(willActivate ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر تحديث حالة المستخدم");
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUserApi(user.id);
      toast.success("تم حذف المستخدم");
      setUserPopup(null);
      try {
        await onDeleteRoom?.(conversation.id);
      } catch {
        // المستخدم اتمسح بنجاح حتى لو فشل تنظيف المحادثة — نكمل عادي
      }
      onBack?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر حذف المستخدم");
    }
  };

  const requestApproveUser = (user) => {
    setConfirmAction({
      title: "الموافقة على الطلب",
      message: "هل تريد الموافقة على طلب تسجيل هذا المستخدم وتفعيل حسابه؟",
      confirmLabel: "موافقة",
      destructive: false,
      run: () => handleApproveUser(user),
    });
  };

  const requestToggleUserStatus = (user) => {
    const activating = user.status === "موقوف" || user.status === "معلق";
    setConfirmAction({
      title: activating ? "تفعيل الحساب" : "إيقاف الحساب",
      message: activating
        ? "هل تريد تفعيل حساب هذا المستخدم؟"
        : "هل تريد إيقاف حساب هذا المستخدم؟",
      confirmLabel: activating ? "تفعيل" : "إيقاف",
      destructive: !activating,
      run: () => handleToggleUserStatus(user),
    });
  };

  const requestDeleteUser = (user) => {
    setConfirmAction({
      title: "حذف المستخدم",
      message: "هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع، وستُغلق محادثته أيضًا.",
      confirmLabel: "حذف المستخدم",
      destructive: true,
      run: () => handleDeleteUser(user),
    });
  };

  const requestDeleteMessage = (messageId) => {
    setConfirmAction({
      title: "حذف الرسالة",
      message: "هل تريد حذف هذه الرسالة نهائيًا؟",
      confirmLabel: "حذف الرسالة",
      destructive: true,
      run: () => handleDeleteMessage(messageId),
    });
  };

  const requestToggleActive = () => {
    const activating = conversation.isActive === false;
    setConfirmAction({
      title: activating ? "تفعيل المحادثة" : "تعطيل المحادثة",
      message: activating
        ? "هل تريد إعادة تفعيل هذه المحادثة والسماح للمستخدمين بإرسال الرسائل؟"
        : "بعد التعطيل لن يتمكن المستخدمون من إرسال الرسائل، بينما يظل الإرسال متاحًا للأدمن.",
      confirmLabel: activating ? "تفعيل" : "تعطيل",
      destructive: !activating,
      run: handleToggleActive,
    });
  };

  const requestDeleteRoom = () => {
    setConfirmAction({
      title: "حذف المحادثة بالكامل",
      message: "سيتم حذف المحادثة وجميع رسائلها نهائيًا، ولا يمكن التراجع عن هذا الإجراء.",
      confirmLabel: "حذف المحادثة",
      destructive: true,
      run: handleDeleteRoom,
    });
  };

  const confirmRequestedAction = async () => {
    if (!confirmAction || actionLoading) return;
    setActionLoading(true);
    try {
      await confirmAction.run();
      setConfirmAction(null);
    } finally {
      setActionLoading(false);
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
        <button
          type="button"
          onClick={handleOpenUserPopup}
          disabled={userPopupLoading}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-right transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60 sm:gap-3"
          aria-label={`عرض بيانات ${conversation.name}`}
          title="عرض بيانات المستخدم"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-white [&_svg]:text-white text-sm font-bold text-white sm:h-10 sm:w-10">
            {conversation.avatarInitial}
          </span>
          <span className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-slate-800 font-['IBM_Plex_Sans_Arabic'] sm:text-[15px]">
              {conversation.name}
            </p>
            <p className="truncate text-[11px] text-gray-400 font-['IBM_Plex_Sans_Arabic'] sm:text-[12px]">
              {conversation.role}
            </p>
          </span>
        </button>
        <button
          type="button"
          onClick={requestToggleActive}
          className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${conversation.isActive ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
          aria-label={conversation.isActive ? "تعطيل المحادثة" : "تفعيل المحادثة"}
          title={conversation.isActive ? "تعطيل المحادثة" : "تفعيل المحادثة"}
        >
          {conversation.isActive ? <PowerOff size={17} /> : <Power size={17} />}
          <span className="hidden sm:inline">{conversation.isActive ? "إلغاء التفعيل" : "تفعيل"}</span>
        </button>
        <button
          type="button"
          onClick={requestDeleteRoom}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 sm:px-3 sm:text-sm"
          aria-label="حذف المحادثة بالكامل"
          title="حذف المحادثة بالكامل"
        >
          <Trash2 size={17} />
          <span className="hidden sm:inline">حذف</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-5">
        <div className="mt-auto space-y-3 sm:space-y-4">
          {conversation.messages.map((m) => {
            const isMe = m.sender === "me";
            return (
              <div key={m.id} className={`group flex items-center gap-2 ${isMe ? "justify-start" : "justify-end"}`}>
                {isMe && (
                  <button type="button" onClick={() => requestDeleteMessage(m.id)} className="text-red-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100" aria-label="حذف الرسالة">
                    <Trash2 size={15} />
                  </button>
                )}
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
                {!isMe && (
                  <button type="button" onClick={() => requestDeleteMessage(m.id)} className="text-red-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100" aria-label="حذف الرسالة">
                    <Trash2 size={15} />
                  </button>
                )}
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
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[16px] text-slate-700 placeholder:text-gray-400 focus:border-[#123C91] focus:outline-none focus:ring-1 focus:ring-[#123C91] font-['IBM_Plex_Sans_Arabic'] sm:px-4 sm:text-sm"
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

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4" onClick={() => !actionLoading && setConfirmAction(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${confirmAction.destructive ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
              {confirmAction.destructive ? <Trash2 size={22} /> : <Power size={22} />}
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">{confirmAction.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{confirmAction.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={actionLoading} onClick={() => setConfirmAction(null)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60">
                إلغاء
              </button>
              <button type="button" disabled={actionLoading} onClick={confirmRequestedAction} className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${confirmAction.destructive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                {actionLoading ? "جاري التنفيذ..." : confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <UserDetailsModal
        open={Boolean(userPopup)}
        onClose={() => setUserPopup(null)}
        user={userPopup}
        onApprove={requestApproveUser}
        onToggleStatus={requestToggleUserStatus}
        onDelete={requestDeleteUser}
      />
    </div>
  );
}
