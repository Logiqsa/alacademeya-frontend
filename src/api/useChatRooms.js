import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "./socket";
import {
  getChatRooms,
  getRoomMessages,
  sendMessageApi,
  startSupportRoom,
} from "./chatApi";

const normalizeRoom = (room) => ({
  id: room.id ?? room._id,
  name: room.displayName ?? room.name ?? "بدون اسم",
  role: room.subtitle ?? room.role ?? "",
  // ✅ نسيب القيمة الخام من الباك إند (support / classroom) بدل ترجمتها
  // لكلمة ثابتة، عشان تشتغل مع فلاتر الوالد ("teachers") والطالب ("groups")
  // مع بعض من غير تعارض — كل صفحة بتربط الـ key بتاعها بنفس القيمة دي.
  category: room.type === "support" ? "admin" : "classroom",
  type: room.type,
  classroomId:
    room.classroom?.id ??
    room.classroom?._id ??
    room.classroomId ??
    room.classroom ??
    room.classroom?._id ??
    room.classroom?.id ??
    room.classroomId ??
    room.classroom ??
    room.metadata?.classroomId ??
    room.data?.classroomId ??
    room.data?.classroom?.id ??
    room.data?.classroom?._id ??
    room.reference?.id ??
    room.reference?._id ??
    room.relatedEntity?.id ??
    room.relatedEntity?._id ??
    room.room?.classroomId ??
    room.room?.classroom?._id ??
    room.room?.classroom?.id ??
    room.classroom_id ??
    room.info?.classroomId ??
    room.parent?.classroomId,
  participants: room.participants ?? [],
  avatarInitial: (room.displayName ?? room.name ?? "?").trim().charAt(0),
  studentName: room.studentName ?? null,
  unreadCount: room.unreadCount ?? 0,
  lastActivityAt:
    room.lastMessageAt ?? room.updatedAt ?? room.createdAt ?? null,
  lastMessageTime: room.lastMessageAt
    ? new Date(room.lastMessageAt).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "",
  lastMessagePreview: room.lastMessage ?? "",
  messages: [],
});

const sortByLatestActivity = (rooms) =>
  [...rooms].sort(
    (first, second) =>
      new Date(second.lastActivityAt || 0).getTime() -
      new Date(first.lastActivityAt || 0).getTime(),
  );

const normalizeMessage = (msg, currentUserId) => {
  const senderId = msg.sender?._id ?? msg.sender?.id ?? msg.sender;
  const senderName =
    msg.sender?.fullName ??
    msg.sender?.name ??
    msg.senderName ??
    msg.author?.fullName ??
    msg.author?.name ??
    "مستخدم";
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

  return {
    id: msg._id ?? msg.id,
    sender: String(senderId) === String(currentUserId) ? "me" : "them",
    senderName,
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
    return sortByLatestActivity(
      (res.data?.data ?? res.data?.rooms ?? res.data ?? []).map(normalizeRoom),
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const rooms = await fetchRooms();
        if (isMounted) {
          setConversations(rooms);
          const socket = getSocket();
          rooms.forEach((room) => socket.emit("joinRoom", room.id));
          // لا نحدد أي محادثة تلقائيًا — تفضل فاضية لحد ما المستخدم يضغط (زي واتساب)
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

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (payload) => {
      const roomId = payload.roomId ?? payload.room;
      const rawMsg = payload.message ?? payload;
      const normalized = normalizeMessage(rawMsg, currentUserId);
      const senderId = rawMsg.sender?._id ?? rawMsg.sender?.id ?? rawMsg.sender;

      // لو الرسالة من "me" — الـ optimistic موجودة بالفعل، متضيفهاش
      if (String(senderId) === String(currentUserId)) return;

      setConversations((prev) =>
        sortByLatestActivity(
          prev.map((c) => {
            if (String(c.id) !== String(roomId)) return c;
            const exists = c.messages.some((m) => m.id === normalized.id);
            if (exists) return c;
            const alreadyOpen = String(c.id) === String(currentRoomRef.current);

            return {
              ...c,
              messages: [...c.messages, normalized],
              lastMessagePreview: normalized.text,
              lastMessageTime: normalized.time,
              lastActivityAt: rawMsg.createdAt || new Date().toISOString(),
              unreadCount: alreadyOpen ? 0 : c.unreadCount + 1,
            };
          }),
        ),
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [currentUserId]);

  const openConversation = useCallback(
    async (roomId) => {
      setActiveId(roomId);
      currentRoomRef.current = roomId;

      // لو roomId فاضي (null) يبقى المستخدم رجع للقائمة فقط — مفيش حاجة تانية مطلوبة
      if (!roomId) return;

      const socket = getSocket();
      socket.emit("joinRoom", roomId);

      setConversations((prev) =>
        prev.map((c) => (c.id === roomId ? { ...c, unreadCount: 0 } : c)),
      );

      setConversations((prev) => {
        const room = prev.find((c) => c.id === roomId);
        if (room && room.messages.length === 0) {
          getRoomMessages(roomId)
            .then((res) => {
              const msgs = (
                res.data?.data ??
                res.data?.messages ??
                res.data ??
                []
              ).map((m) => normalizeMessage(m, currentUserId));
              setConversations((p) =>
                p.map((c) => (c.id === roomId ? { ...c, messages: msgs } : c)),
              );
            })
            .catch((err) => console.error("فشل تحميل الرسائل:", err));
        }
        return prev;
      });
    },
    [currentUserId],
  );

  const leaveConversation = useCallback((roomId) => {
    if (!roomId) return;
    // Keep listening to this room so the rooms list continues to receive
    // unread messages after the user returns from the open chat.
    if (currentRoomRef.current === roomId) currentRoomRef.current = null;
  }, []);

  const sendMessage = useCallback(async (roomId, text) => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // أضف optimistic message
    const optimisticMessage = {
      id: tempId,
      sender: "me",
      senderName: "أنت",
      text,
      time: now,
      status: "sent",
    };

    setConversations((prev) =>
      sortByLatestActivity(
        prev.map((c) =>
          String(c.id) === String(roomId)
            ? {
                ...c,
                messages: [...c.messages, optimisticMessage],
                lastMessagePreview: text,
                lastMessageTime: now,
                lastActivityAt: new Date().toISOString(),
              }
            : c,
        ),
      ),
    );

    try {
      const res = await sendMessageApi(roomId, text);
      const saved = res.data?.data ?? res.data?.message ?? res.data;
      const realId = saved?._id ?? saved?.id;
      const realTime = saved?.createdAt
        ? new Date(saved.createdAt).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
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
                      : m,
                  ),
                }
              : c,
          ),
        );
      }
    } catch (err) {
      console.error("فشل إرسال الرسالة:", err);
      // في حالة الفشل امسح الـ optimistic
      setConversations((prev) =>
        prev.map((c) =>
          c.id === roomId
            ? { ...c, messages: c.messages.filter((m) => m.id !== tempId) }
            : c,
        ),
      );
    }
  }, []);

  const startSupportConversation = useCallback(
    async (userId = currentUserId) => {
      try {
        // ✅ الباك إند مستني حقل "userId" (مش "participants") — راجع Postman collection
        const res = await startSupportRoom({
          userId,
        });
        const created = res.data?.data ?? res.data;
        const newRoomId =
          created?.id ??
          created?._id ??
          created?.room?.id ??
          created?.room?._id;

        const rooms = await fetchRooms();
        setConversations(rooms);
        const socket = getSocket();
        rooms.forEach((room) => socket.emit("joinRoom", room.id));

        if (newRoomId) await openConversation(newRoomId);
        return newRoomId;
      } catch (err) {
        console.error(
          "فشل بدء محادثة الدعم:",
          err.response?.data ?? err.message,
        );
        return null;
      }
    },
    [fetchRooms, openConversation, currentUserId],
  );

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
