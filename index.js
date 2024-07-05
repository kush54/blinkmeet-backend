const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const path = require("path");
const cors = require("cors");
const app = express();
const server = createServer(app);

const {
  addNewUser,
  removeUser,
  addupChatUsers,
  removeUnpairedUser,
  addupVideoUsers,
  getUnpairedVideoUsers,
  getUser,
  getUsers,
  getUnpairedChatUsers,
  upChatUsers,
  upVideoUsers,
  removeUnpairedUserVideo
} = require("./help");

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// CORS configuration
app.use(cors({
  origin: "https://u4m.vercel.app",
  methods: ["GET", "POST"],
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: "https://u4m.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  socket.on("new-user", (id, callback) => {
    const sid = socket.id;
    const { error } = addNewUser({ id, sid });
    if (error) return callback(error);
    const allUsers = getUsers();
    io.emit("get-online-users", allUsers);
    callback();
  });

  socket.on("pairing-user", (userId, callback) => {
    console.log("add kro ", userId);
    const { error } = addupChatUsers(userId);
    if (error) return callback(error);
    const unpairedUser = getUnpairedChatUsers();
    console.log("yaha", unpairedUser, "pu");
    if (unpairedUser.length < 2) return;
    const user = getUser(userId);
    const user2 = getUser(unpairedUser[0]);
    io.to(user.sid).emit("user-paired", user2.sid);
    removeUnpairedUser(user2.id);
    io.to(user2.sid).emit("user-paired", user.sid);
    removeUnpairedUser(user.id);
  });

  socket.on("send-message", ({ message, receiver }) => {
    io.to(receiver).emit("send-message", message);
  });

  socket.on("chat-close", (receiver, callback) => {
    const allUsers = getUsers();
    const user = allUsers.find((user) => user.sid === receiver);
    const s_id = user.sid;
    io.to(s_id).emit("chat-close");
    callback();
  });

  socket.on("unpairing-user", (userId, callback) => {
    removeUnpairedUser(userId);
    callback();
  });

  socket.on("pairing-user-video", (userId, callback) => {
    const { error } = addupVideoUsers(userId);
    if (error) return callback(error);
    const upVideoUsers = getUnpairedVideoUsers();
    if (upVideoUsers.length < 2) return;
    const allUsers = getUsers();
    const user1 = allUsers.find((user) => user.id === userId);
    const secondUserId = upVideoUsers[0];
    const user2 = allUsers.find((user) => user.id === secondUserId);
    const uos_id = user1.sid;
    const uss_id = user2.sid;
    io.to(uos_id).emit("user-paired", { rid: uss_id, type: "call" });
    removeUnpairedUserVideo(user2.id);
    socket.on("user:call", ({ to, offer }) => {
      removeUnpairedUserVideo(user1.id);
      io.to(to).emit("user-call", { from: uos_id, offer: offer, type: "listen" });
    });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call-accept", ans);
  });

  socket.on("peer:nego:needed", ({ offer, to }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer: offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans: ans });
  });

  socket.on("unpairing-user", (userId) => {
    removeUnpairedUserVideo(userId);
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      removeUnpairedUser(user.id);
      removeUnpairedUserVideo(user.id);
      const onlineUsers = getUsers();
      io.emit("get-online-users", onlineUsers);
      console.log('🔥: A user disconnected');
    }
  });

  socket.on("offline", () => {
    const user = removeUser(socket.id);
    if (user) {
      removeUnpairedUser(user.id);
      removeUnpairedUserVideo(user.id);
      const onlineUsers = getUsers();
      io.emit("get-online-users", onlineUsers);
      console.log("user went offline");
    }
  });
});

// Catch-all handler for any requests not handled above
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

server.listen(8000, () => {
  console.log("server started at port 8000");
});
