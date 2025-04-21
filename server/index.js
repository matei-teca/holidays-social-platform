const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

const PORT = process.env.PORT || 9001;


// Routes
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);

const commentRoutes = require("./routes/comments");
app.use("/api/comments", commentRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

 const eventsRoutes  = require("./routes/events");
 app.use("/api/events", eventsRoutes);


// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));


app.get('/', (req, res) => {
    res.send('Hello World!')
})