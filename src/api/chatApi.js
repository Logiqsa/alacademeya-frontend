import axios from "axios";

const API = axios.create({
  baseURL: "https://api.alacademeya.com/api",
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
API.interceptors.request.use(attachToken);

// ====================================================================
// الـ endpoints دي مؤكدة من Postman collection بتاعت الباك إند (Alacademeya)
// ====================================================================

// بيرجع كل غرف المحادثة (chat rooms) بتاعة اليوزر الحالي
export const getChatRooms = () => API.get("/chats/rooms");

// بيرجع الرسائل القديمة لغرفة معينة (history)
export const getRoomMessages = (roomId, params = {}) =>
  API.get(`/chats/rooms/${roomId}/messages`, { params });

// بيبدأ/يرجع غرفة دعم (support room). من الـ Postman الريسبونس بيرجع
// شكل مختلف عن GET /chats/rooms (مفيهوش displayName/subtitle) -
// لذلك بعد إنشاءها هنعمل refetch لقائمة الغرف بدل الاعتماد على الريسبونس مباشرة.
// ⚠️ غير مؤكد لو الباك إند محتاج body خالص (ممكن يستنتج اليوزر من التوكين
// نفسه). جرّبيها الأول من غير payload، ولو رجعت 400 ضيفي الـ payload المطلوب.
export const startSupportRoom = (payload = {}) => API.post("/chats/support-room", payload);

// إرسال رسالة جديدة عبر REST
// ⚠️ تأكدي من شكل الـ body المطلوب بالضبط (roomId + text هنا افتراضي)
export const sendMessageApi = (roomId, text) => API.post("/messages", { roomId, text });

// تعديل رسالة
// ⚠️ من الـ Postman: هذا الإندبوينت رجع 500 (Server Error) وقت التجربة.
// متفعّليه في الواجهة لحد ما تتأكدي إنه شغال صح مع الباك إند.
export const editMessage = (messageId, text) => API.patch(`/messages/${messageId}`, { text });

// حذف رسالة
export const deleteMessage = (messageId) => API.delete(`/messages/${messageId}`);