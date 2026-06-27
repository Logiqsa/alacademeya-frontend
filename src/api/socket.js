import { io } from "socket.io-client";

// ⚠️ افتراضي: عنوان السوكت هو نفس الدومين بدون /api.
// لو فيه باترن مختلف (subdomain منفصل للسوكت مثلاً) عدّليه هنا.
const SOCKET_URL = "https://api.alacademeya.com";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io(SOCKET_URL, {
      // ⚠️ افتراضي: التوكين بيتبعت في auth. لو الباك إند بيتوقعه في
      // query بدل ده، استخدمي: query: { token }
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect_error", (err) => {
      console.error("فشل الاتصال بالسوكت:", err.message);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}