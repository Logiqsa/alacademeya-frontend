import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "./socket";
import { getChatRooms, getRoomMessages, sendMessageApi, startSupportRoom } from "./chatApi";

const normalizeRoom = (room) => ({
  id: room.id ?? room._id,
  name: room.displayName ?? room.name ?? "بدون اسم",
  role: room.subtitle ?? room.role ?? "",
  // ✅ نسيب القيمة الخام من الباك إند (support / classroom) بدل ترجمتها
  // لكلمة ثابتة، عشان تشتغل مع فلاتر الوالد ("teachers") والطالب ("groups")
  // مع بعض من غير تعارض — كل صفحة بتربط الـ key بتاعها بنفس القيمة دي.
  category: room.type === "support" ? "admin" : "classroom",
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

const normalizeMessage = (msg, currentUserId) => {
  const senderId = msg.sender?._id ?? msg.sender?.id ?? msg.sender;
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  return {
    id: msg._id ?? msg.id,
    sender: senderId === currentUserId ? "me" : "them",
    text: msg.text ?? msg.content ?? "",
    time,
    status: msg.readBy?.length > 1 ? "read" : "sent",
  };
};

export function useChatRooms(currentUserId) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentRoomRef = useRef(null);

  const fetchRooms = useCallback(async () => {
    const res = await getChatRooms();
    return (res.data?.data ?? res.data?.rooms ?? res.data ?? []).map(normalizeRoom);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const rooms = await fetchRooms();
        if (isMounted) {
          setConversations(rooms);
          // لا نحدد أي محادثة تلقائيًا — تفضل فاضية لحد ما المستخدم يضغط (زي واتساب)
        }
      } catch (err) {
        console.error("فشل تحميل المحادثات:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [fetchRooms]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (payload) => {
      const roomId = payload.roomId ?? payload.room;
      const rawMsg = payload.message ?? payload;
      const normalized = normalizeMessage(rawMsg, currentUserId);
      const senderId = rawMsg.sender?._id ?? rawMsg.sender?.id ?? rawMsg.sender;

      // لو الرسالة من "me" — الـ optimistic موجودة بالفعل، متضيفهاش
      if (senderId === currentUserId) return;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== roomId) return c;
          const exists = c.messages.some((m) => m.id === normalized.id);
          if (exists) return c;
          const alreadyOpen = c.id === currentRoomRef.current;

          return {
            ...c,
            messages: [...c.messages, normalized],
            lastMessagePreview: normalized.text,
            lastMessageTime: normalized.time,
            unreadCount: alreadyOpen ? c.unreadCount : c.unreadCount + 1,
          };
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [currentUserId]);

  const openConversation = useCallback(async (roomId) => {
    setActiveId(roomId);
    currentRoomRef.current = roomId;

    // لو roomId فاضي (null) يبقى المستخدم رجع للقائمة فقط — مفيش حاجة تانية مطلوبة
    if (!roomId) return;

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
            const msgs = (
              res.data?.data ?? res.data?.messages ?? res.data ?? []
            ).map((m) => normalizeMessage(m, currentUserId));
            setConversations((p) =>
              p.map((c) => (c.id === roomId ? { ...c, messages: msgs } : c))
            );
          })
          .catch((err) => console.error("فشل تحميل الرسائل:", err));
      }
      return prev;
    });
  }, [currentUserId]);

  const leaveConversation = useCallback((roomId) => {
    if (!roomId) return;
    const socket = getSocket();
    socket.emit("leaveRoom", roomId);
    if (currentRoomRef.current === roomId) currentRoomRef.current = null;
  }, []);

  const sendMessage = useCallback(async (roomId, text) => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // أضف optimistic message
    const optimisticMessage = {
      id: tempId,
      sender: "me",
      text,
      time: now,
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === roomId
          ? {
              ...c,
              messages: [...c.messages, optimisticMessage],
              lastMessagePreview: text,
              lastMessageTime: now,
            }
          : c
      )
    );

    try {
      const res = await sendMessageApi(roomId, text);
      const saved = res.data?.data ?? res.data?.message ?? res.data;
      const realId = saved?._id ?? saved?.id;
      const realTime = saved?.createdAt
        ? new Date(saved.createdAt).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : now;

      // استبدل الـ temp بالـ real id والوقت الحقيقي
      if (realId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === roomId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === tempId
                      ? { ...m, id: realId, time: realTime, status: "sent" }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("فشل إرسال الرسالة:", err);
      // في حالة الفشل امسح الـ optimistic
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
      // ✅ الباك إند مستني حقل "userId" (مش "participants") — راجع Postman collection
      const res = await startSupportRoom({
        userId: currentUserId,
      });
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
  }, [fetchRooms, openConversation, currentUserId]);

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