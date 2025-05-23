import { io } from "socket.io-client";

const socket = io("http://localhost:9001", { autoConnect: false });

socket.on("connect", ()    => console.log("🔌 Socket connected:", socket.id));
socket.on("disconnect", (reason) => console.log("❌ Socket disconnected:", reason));
socket.on("connect_error", (err) => console.error("⚠️ Socket error:", err.message));

export default socket;
