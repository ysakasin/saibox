import { ChatServer } from "./app";
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import DataStore from "./datastore";
import nanoid from "nanoid";
import bcrypt from "bcrypt";

const chatServer = new ChatServer();
const app = chatServer.getApp();
const io = chatServer.getIo();
const dataStore = DataStore.obj;

const publicDir = path.join(__dirname, "..", "public");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(publicDir, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/rooms/:roomId", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/api/v1/rooms", (req, res) => {
  dataStore.findAllRooms((err: any, rooms: any) => {
    res.json(rooms);
  });
});

app.post("/api/v1/rooms/create", (req, res) => {
  const password = req.body.password;
  const hashedPassword = password == "" ? "" : bcrypt.hashSync(password, 10);
  const doc = {
    roomId: nanoid(12),
    roomName: req.body.roomName,
    gameType: req.body.gameType || "DiceBot",
    hashedPassword,
    shortcuts: ["2d6", "2d6>=?", "1d100"],
    createdAt: new Date()
  };
  dataStore.createRoom(doc);
  res.json(doc);
});

app.post("/api/v1/rooms/delete", (req, res) => {
  const roomId = req.body.roomId;
  const password = req.body.password;
  dataStore.auth(roomId, password, authed => {
    if (!authed) {
      res.status(403).json({ ok: false });
      return;
    }
    const room = io.of("/").adapter.rooms[roomId];
    const sockets = room ? room.sockets : [];
    for (let socketId in sockets) {
      const socket = io.of("/").sockets[socketId];
      if (socket) {
        socket.disconnect(true);
      }
    }

    dataStore.deleteRoom(roomId, (err: any, result: any) => {
      if (!err) {
        res.json({ ok: true });
      } else {
        res.status(404).json({ ok: false });
      }
    });
  });
});

app.post("/api/v1/rooms/:roomId", (req, res) => {
  dataStore.findRoom(req.params.roomId, (err: any, room: any) => {
    if (!room) {
      res.status(404).json({});
    } else if (room.hashedPassword) {
      const password = req.body.password || "";
      if (bcrypt.compareSync(password, room.hashedPassword)) {
        res.json(room);
      } else {
        res.status(403).json({});
      }
    } else {
      res.json(room);
    }
  });
});
export { app };
