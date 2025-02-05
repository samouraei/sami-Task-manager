const io = require("socket.io-client");

// Connect to the actual Socket.IO server
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

// Listen for task updates
socket.on("taskUpdates", (taskUpdate) => {
  console.log("📩 Task update received from server:", taskUpdate);
});

// Simulate connection success
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server.");
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("❌ Disconnected from server.");
});

// socket.onAny((event, data) => {
//   console.log(`📡 Received event: ${event}`, data);
// });

