// server/index.js
const express    = require("express");
const http       = require("http");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const jwt        = require("jsonwebtoken");
const { Server } = require("socket.io");

// load environment variables
dotenv.config();

// express setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// import API routes
const postRoutes          = require("./routes/posts");
const commentRoutes       = require("./routes/comments");
const authRoutes          = require("./routes/auth");
const userRoutes          = require("./routes/users");
const eventsRoutes        = require("./routes/events");
const convosRoutes        = require("./routes/conversations");
const notificationsRoutes = require("./routes/notifications");

// mount API routes
app.use("/api/posts",         postRoutes);
app.use("/api/comments",      commentRoutes);
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/events",        eventsRoutes);
app.use("/api/conversations", convosRoutes);
app.use("/api/notifications", notificationsRoutes);

// simple health-check
app.get("/", (req, res) => res.send("Hello World!"));

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// create HTTP server & attach Socket.IO
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*" },
});

// expose io to routes
app.set("io", io);

// import models for socket logic
const Conversation = require("./models/Conversation");
const Notification = require("./models/Notification");
const User         = require("./models/User");

// JWT secret for socket auth
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Socket.IO middleware: authenticate by JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.userId   = decoded.id;
    socket.data.username = decoded.username;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// handle Socket.IO connections
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}, user ${socket.data.username}`);

  // join personal room
  socket.join(`user:${socket.data.username}`);

  // join a conversation room
  socket.on("joinConvo", (convoId) => {
    socket.join(convoId);
  });

  // handle incoming messages
  socket.on("sendMessage", async ({ convoId, cipher, nonce, content }) => {
    try {
      // 1) Save the message to MongoDB
      const convo = await Conversation.findById(convoId);
      if (!convo) return;

      convo.messages.push({
        sender:  socket.data.userId,
        cipher,
        nonce,
        content,
      });
      await convo.save();

      // 2) Populate sender info
      const populated =
        (await convo.populate("messages.sender", "username avatarUrl").execPopulate?.()) ||
        (await convo.populate("messages.sender", "username avatarUrl"));
      const newMsg = populated.messages[populated.messages.length - 1];

      // 3) Broadcast to everyone in the room
      io.to(convoId).emit("newMessage", {
        convoId,
        _id:       newMsg._id,
        sender:    newMsg.sender,
        cipher:    newMsg.cipher,
        nonce:     newMsg.nonce,
        content:   newMsg.content,
        createdAt: newMsg.createdAt,
      });

      // 4) Persist & emit real-time notifications to other participants
      const fullConvo = await Conversation.findById(convoId).populate("participants", "username");
      for (let p of fullConvo.participants) {
        if (p.username === socket.data.username) continue;
        const userDoc = await User.findOne({ username: p.username });
        const note = await Notification.create({
          user: userDoc._id,
          type: "chat_message",
          text: `${socket.data.username} sent you a message`,
          data: { convoId, messageId: newMsg._id },
        });
        io.to(`user:${p.username}`).emit("notification", note);
      }
    } catch (err) {
      console.error("❌ Message send error:", err);
    }
  });
});

// start the server
const PORT = process.env.PORT || 9001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
