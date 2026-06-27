import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "./socket";
import { getChatRooms, getRoomMessages, sendMessageApi, startSupportRoom } from "./chatApi";

// 🔧 ده الحقل الوحيد اللي محتاجة تغيّريه وقت التجربة. بدّلي القيمة
// وجربي "+" تاني. الخيارات: "participants" | "recipientId" | "teacherId" | "adminId" | "userId"
const SUPPORT_ROOM_FIELD_NAME = "participants";

const buildSupportRoomPayload = (currentUserId) => {
  if (SUPPORT_ROOM_FIELD_NAME === "participants") {
    return { participants: [currentUserId] };
  }
  return { [SUPPORT_ROOM_FIELD_NAME]: currentUserId };
};

const normalizeRoom = (room) => ({
  id: room.id ?? room._id,
  name: room.displayName ?? room.name ?? "بدون اسم",
  role: room.subtitle ?? room.role ?? "",
  category: room.type === "support" ? "admin" : "teachers",
  avatarInitial: (room.displayName ?? room.name ?? "?").trim().charAt(0),
  studentName: room.studentName ?? null,
  unreadCount: room.unreadCount ?? 0,
  lastMessageTime: room.lastMessageAt
    ? new Date(room.lastMessageAt).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "",
  lastMessagePreview: room.lastMessage ?? "",
  messages: [],
});

const normalizeMessage = (msg, currentUserId) => ({
  id: msg._id ?? msg.id,
  sender: (msg.sender?._id ?? msg.sender?.id ?? msg.sender) === currentUserId ? "me" : "them",
  text: msg.text ?? msg.content ?? "",
  time: msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    : "",
  status: msg.readBy?.length > 1 ? "read" : "sent",
});

export function useChatRooms(currentUserId) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentRoomRef = useRef(null);

  const fetchRooms = useCallback(async () => {
    const res = await getChatRooms();
    return (res.data?.data ?? res.data?.rooms ?? res.data ?? []).map(normalizeRoom);
  }, []);

  // 1) جلب قائمة الغرف أول ما الكومبوننت يفتح
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const rooms = await fetchRooms();
        if (isMounted) {
          setConversations(rooms);
          setActiveId(rooms[0]?.id ?? null);
        }
      } catch (err) {
        console.error("فشل تحميل المحادثات:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchRooms]);

  // 2) الاستماع للرسائل الجديدة اللحظية من السوكت
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (payload) => {
      const roomId = payload.roomId ?? payload.room;
      const normalized = normalizeMessage(payload.message ?? payload, currentUserId);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== roomId) return c;
          const alreadyOpen = c.id === currentRoomRef.current;
          const exists = c.messages.some((m) => m.id === normalized.id);

          return {
            ...c,
            messages: exists ? c.messages : [...c.messages, normalized],
            lastMessagePreview: normalized.text,
            lastMessageTime: normalized.time,
            unreadCount: alreadyOpen || exists ? c.unreadCount : c.unreadCount + 1,
          };
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [currentUserId]);

  // 3) لما تفتح محادثة: تجيب رسائلها القديمة + تدخل غرفة السوكت
  const openConversation = useCallback(
    async (roomId) => {
      setActiveId(roomId);
      currentRoomRef.current = roomId;

      const socket = getSocket();
      socket.emit("joinRoom", roomId);

      setConversations((prev) =>
        prev.map((c) => (c.id === roomId ? { ...c, unreadCount: 0 } : c))
      );

      setConversations((prev) => {
        const room = prev.find((c) => c.id === roomId);
        if (room && room.messages.length === 0) {
          getRoomMessages(roomId)
            .then((res) => {
              const msgs = (res.data?.data ?? res.data?.messages ?? res.data ?? []).map((m) =>
                normalizeMessage(m, currentUserId)
              );
              setConversations((p) =>
                p.map((c) => (c.id === roomId ? { ...c, messages: msgs } : c))
              );
            })
            .catch((err) => console.error("فشل تحميل الرسائل:", err));
        }
        return prev;
      });
    },
    [currentUserId]
  );

  const leaveConversation = useCallback((roomId) => {
    if (!roomId) return;
    const socket = getSocket();
    socket.emit("leaveRoom", roomId);
    if (currentRoomRef.current === roomId) currentRoomRef.current = null;
  }, []);

  const sendMessage = useCallback(async (roomId, text) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender: "me",
      text,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === roomId
          ? {
              ...c,
              messages: [...c.messages, optimisticMessage],
              lastMessagePreview: text,
              lastMessageTime: optimisticMessage.time,
            }
          : c
      )
    );

    try {
      const res = await sendMessageApi(roomId, text);
      const saved = res.data?.data ?? res.data?.message ?? res.data;
      const realId = saved?._id ?? saved?.id;
      if (realId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === roomId
              ? { ...c, messages: c.messages.map((m) => (m.id === tempId ? { ...m, id: realId } : m)) }
              : c
          )
        );
      }
    } catch (err) {
      console.error("فشل إرسال الرسالة:", err);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === roomId
            ? { ...c, messages: c.messages.filter((m) => m.id !== tempId) }
            : c
        )
      );
    }
  }, []);

const startSupportConversation = useCallback(async () => {
  try {
    const SUPPORT_USER_ID = import.meta.env.VITE_SUPPORT_USER_ID; // 👈 هنا

    const res = await startSupportRoom({ userId: SUPPORT_USER_ID });
    const created = res.data?.data ?? res.data;
    const newRoomId = created?.id ?? created?._id;

    const rooms = await fetchRooms();
    setConversations(rooms);

    if (newRoomId) await openConversation(newRoomId);
    return newRoomId;
  } catch (err) {
    console.error("فشل بدء محادثة الدعم:", err.response?.data ?? err.message);
    return null;
  }
}, [fetchRooms, openConversation]);

  return {
    conversations,
    activeId,
    loading,
    openConversation,
    leaveConversation,
    sendMessage,
    startSupportConversation,
  };
}