import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";
import { getCurrentAccessToken } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";

let socket = null;

export function getSocket() {
  if (socket && socket.connected) return socket;
  return null;
}

export function connectSocket() {
  if (typeof window === "undefined") return null;
  if (isMockEnabled()) return null;
  if (socket && socket.connected) return socket;

  const accessToken = getCurrentAccessToken();
  if (!accessToken) return null;

  if (socket) {
    socket.connect();
    return socket;
  }

  socket = io(API_BASE_URL, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    autoConnect: false,
  });

  socket.on("connect", () => {
    // Connection established
  });

  socket.on("connect_error", () => {
    // Connection failed — will retry on next call
  });

  socket.on("disconnect", () => {
    // Disconnected
  });

  socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function updateSocketToken(token) {
  if (!socket || !token) return;
  socket.auth = { token };
  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
}

export function onNewNotification(callback) {
  if (isMockEnabled()) return () => {};
  if (!socket) connectSocket();
  if (!socket) return () => {};
  socket.on("newNotification", callback);
  return () => {
    socket.off("newNotification", callback);
  };
}
