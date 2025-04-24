// server/index.js
const express    = require("express");
const http       = require("http");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const jwt        = require("jsonwebtoken");
const { Server } = require("socket.io");

// load .env
dotenv.config();

// express setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// import routes
const postRoutes    = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const authRoutes    = require("./routes/auth");
const userRoutes    = require("./routes/users");
const eventsRoutes  = require("./routes/events");
const convosRoutes  = require("./routes/conversations");

// mount API routes
app.use("/api/posts",         postRoutes);
app.use("/api/comments",      commentRoutes);
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/events",        eventsRoutes);
app.use("/api/conversations", convosRoutes);

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
  cors: { origin: "*" }
});

// load Conversation model for socket handlers
const Conversation = require("./models/Conversation");

// JWT secret for socket auth
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Socket.IO middleware: authenticate by token
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

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}, user ${socket.data.userId}`);

  // join a conversation room
  socket.on("joinConvo", (convoId) => {
    socket.join(convoId);
  });

  // handle incoming messages
  socket.on("sendMessage", async ({ convoId, cipher, nonce, content }) => {
    try {
      const convo = await Conversation.findById(convoId);
      if (!convo) return;

      // append message
      convo.messages.push({
        sender:  socket.data.userId,
        cipher,    // if encrypted
        nonce,     // if encrypted
        content    // plaintext fallback
      });
      await convo.save();

      // populate sender info
      const populated = await convo
        .populate("messages.sender", "username avatarUrl")
        .execPopulate?.()  // for Mongoose <6; if you're on >=6, .populate() returns a promise
        || await convo.populate("messages.sender", "username avatarUrl");

      // last message
      const newMsg = populated.messages[populated.messages.length - 1];

      // broadcast to room
      io.to(convoId).emit("newMessage", {
        convoId,
        _id:      newMsg._id,
        sender:   newMsg.sender,
        cipher:   newMsg.cipher,
        nonce:    newMsg.nonce,
        content:  newMsg.content,
        createdAt:newMsg.createdAt
      });
    } catch (err) {
      console.error("❌ Message send error:", err);
    }
  });
});

// start listening
const PORT = process.env.PORT || 9001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
