import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socket";

const Home = () => {
  const Navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [Name, setName] = useState("");
  const [roomID, setroomID] = useState("");
  const [Rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.on("ROOM_LIST", (rooms) => {
      setRooms([...Object.entries(rooms)]);
      console.log(Rooms);
    });
  }, []);

  const createHandler = () => {
    if (Name.trim().length === 0) {
      return;
    }
    // JOIN ROOM
    socket.emit("CREATE", { name: Name });
    //USER JOINED
    socket.on("USER_JOINED", (details) => {
      console.log("Details: " + details);
    });
    //ROOM ID
    socket.on("ROOM_ID", (roomId) => {
      console.log("Room Id: " + roomId);
      Navigate("/main", { state: { roomId: roomId, name: Name } });
    });
  };

  const joinHandler = () => {
    if (Name.trim().length === 0 || roomID.trim().length === 0) {
      return;
    }
    // JOIN ROOM
    socket.emit("JOIN", { name: Name, id: roomID });
    //ROOM ID
    socket.on("ROOM_ID", (roomId) => {
      console.log("Room Id: " + roomId);
      Navigate("/main", { state: { roomId: roomId, name: Name } });
    });
  };

  const joinRoomHandler = (id) => {
    if (Name.trim().length === 0) {
      return;
    }
    // JOIN ROOM
    socket.emit("JOIN", { name: Name, id: id });
    Navigate("/main", { state: { roomId: id, name: Name } });
  };

  return (
    <div className="min-h-screen w-full">
      <header className="fixed w-full bg-white">
        <div className="flex flex-row justify-between p-4">
          <h1 className="text-2xl font-bold">Skribble</h1>
        </div>
      </header>
      <div className="details_div flex flex-col mx-4 pt-16">
        <div className="flex flex-row items-center mt-4">
          <label
            className="mt-2 w-32 text-gray-700 text-lg font-bold mb-2 text-left"
            htmlFor="username"
          >
            Name
          </label>
          <input
            className="flex-grow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-row items-center mt-4">
          <label
            className="mt-2 w-32 text-gray-700 text-lg font-bold mb-2 text-left"
            htmlFor="roomId"
          >
            Room ID
          </label>
          <input
            className="flex-grow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="roomId"
            type="text"
            placeholder="Room ID"
            onChange={(e) => setroomID(e.target.value)}
          />
        </div>
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => createHandler()}
            className="mt-4 px-4 py-2 rounded-xl hover:text-white border-blue-500 border-2 transition-all text-blue-500 hover:bg-blue-500 bg-white"
          >
            CREATE
          </button>
          <button
            onClick={() => joinHandler()}
            className="mt-4 px-4 py-2 rounded-xl hover:text-white border-blue-500 border-2 transition-all text-blue-500 hover:bg-blue-500 bg-white"
          >
            JOIN
          </button>
        </div>
      </div>

      {Rooms.length > 0 ? (
        <div className="mx-4 mt-10">
          <h1 className="font-bold text-2xl text-left">Rooms</h1>
          <div className="available_rooms grid md:grid-cols-5 grid-cols-2 gap-4 mt-4">
            {Rooms.map((e) => (
              <div key={e[0]} className="">
                <h1 className="font-bold">{e[0]}</h1>
                <p className="font medium">
                  Members: {e[1].participants.length}
                </p>
                <button
                  onClick={() => joinRoomHandler(e[0])}
                  className="mt-4 px-4 py-2 rounded-xl hover:text-white border-blue-500 border-2 transition-all text-blue-500 hover:bg-blue-500 bg-white"
                >
                  JOIN
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No Active Rooms</div>
      )}
    </div>
  );
};

export default Home;
