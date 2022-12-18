const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const uuid = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

var roomInfo = {};
var words = [
  "cat",
  "dog",
  "bus",
  "aeroplane",
  "twitter",
  "apple",
  "butcher",
  "banana",
  "pineapple",
  "orange",
];

io.on("connection", (socket) => {
  //Check Guess
  socket.on("CHECK_GUESS", (data) => {
    console.log(data);
    if (roomInfo[data.roomId]["word"] == data.Guess) {
      roomInfo[data.roomId]["word"] =
        words[Math.floor(Math.random() * words.length)];
      roomInfo[data.roomId]["drawerIdx"] =
        (roomInfo[data.roomId]["drawerIdx"] + 1) %
        roomInfo[data.roomId]["participants"].length;
      roomInfo[data.roomId]["scores"][data.name] += 10;
      io.to(data.roomId).emit("RESULT_GUESS", {
        result: "Correct",
        room: roomInfo[data.roomId],
      });
    } else {
      io.to(data.roomId).emit("RESULT_GUESS", {
        result: "Wrong",
        room: roomInfo[data.roomId],
      });
    }
  });
  //Request RoomInfo
  socket.on("REQUEST_ROOMINFO", (ROOM_ID) => {
    io.sockets.in(ROOM_ID).emit("RECIEVED_ROOMINFO", roomInfo[ROOM_ID]);
  });
  //Room List
  socket.emit("ROOM_LIST", roomInfo);
  //Create Room
  socket.on("CREATE", (details) => {
    const roomId = uuid.v4();
    roomInfo[roomId] = {};
    roomInfo[roomId]["participants"] = [details.name];
    roomInfo[roomId]["drawerIdx"] = 0;
    roomInfo[roomId]["scores"] = {};
    roomInfo[roomId]["scores"][details.name] = 0;
    const word = words[Math.floor(Math.random() * words.length)];
    roomInfo[roomId]["word"] = word;
    io.emit("ROOM_LIST", roomInfo);
    socket.join(roomId);
    io.sockets.in(roomId).emit("ROOM_ID", roomId);
    io.sockets.in(roomId).emit("USER_JOINED", details);
    console.log(roomInfo);
  });
  //Join Room
  socket.on("JOIN", (details) => {
    if (roomInfo[details.id] != null) {
      if (
        roomInfo[details.id]["participants"].findIndex(
          (e) => e == details.name
        ) > -1
      ) {
        return socket.emit(
          "name error",
          "Please choose another name. This name is aldready taken...."
        );
      } else {
        roomInfo[details.id]["participants"].push(details.name);
        roomInfo[details.id]["scores"][details.name] = 0;
      }
    }
    socket.join(details.id);
    io.sockets.in(details.id).emit("ROOM_ID", details.id);
    io.sockets.in(details.id).emit("USER_JOINED", details);
    io.sockets.in(details.id).emit("RECIEVED_ROOMINFO", roomInfo[details.id]);
    console.log(roomInfo);
  });
  socket.on("PAINTED_COORDINATES", (data) => {
    io.sockets.in(data.roomId).emit("TRANSMITTED_PAINTED_COORDINATES", data);
  });
});

server.listen(8000, () => {
  console.log("Server up and running on Port 8000.");
});
