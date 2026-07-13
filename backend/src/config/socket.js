import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174", "https://mkhe.netlify.app"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.info(`[Socket] Client connected: ${socket.id}`);

    // User joins their own private room to receive personal notifications
    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
      // console.info(`[Socket] User ${userId} joined their room.`);
    });

    // Admin joins the admin room for global updates
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      // console.info(`[Socket] An admin joined admin_room.`);
    });

    socket.on("disconnect", () => {
      // console.info(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
