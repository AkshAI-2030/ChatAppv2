const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const { Server } = require("socket.io");
const http = require("http");
const Messages = require("./models/Messages");
const User = require("./models/User");
const authenticateToken = require("./middlewares/authenticateToken"); // Import authentication middleware

dotenv.config();

const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Your React frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization header
    credentials: true, // Allow cookies (if necessary)
  })
);

app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error(error));

app.use("/auth", authRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("send_message", async (data) => {
    const { sender, receiver, message } = data;
    const newMessage = new Messages({ sender, receiver, message });
    await newMessage.save();
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Messages Route (Protected)
app.get("/messages", authenticateToken, async (req, res) => {
  const { sender, receiver } = req.query;
  try {
    const messages = await Messages.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages." });
  }
});
//User route
app.get("/user", authenticateToken, (req, res) => {
  const { username } = req.user; // Extract user details from JWT payload
  res.status(200).json({ username });
});

// Users Route
app.get("/users", authenticateToken, async (req, res) => {
  const { currentUser } = req.query;
  try {
    const users = await User.find({ username: { $ne: currentUser } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
