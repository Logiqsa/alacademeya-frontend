import { io } from "socket.io-client";
import { API_ORIGIN } from "../services/apiUrl";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io(API_ORIGIN, {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("newMessage", (payload) => {
      handleNewMessage(payload);
    });
  }
  return socket;
}

export const handleNewMessage = (payload) => {
  void payload;
};

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
