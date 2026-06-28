import { io } from "socket.io-client";

const SOCKET_URL = "https://api.alacademeya.com";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io(SOCKET_URL, {
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