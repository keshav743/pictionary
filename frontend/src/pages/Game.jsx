import React from "react";
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../context/socket";

import "./Game.css";

const Game = () => {
  const canvasRef = useRef(null);
  const roomId = useLocation().state.roomId;
  const name = useLocation().state.name;
  const [size, setSize] = useState(0);
  const [Participants, setParticipants] = useState([]);
  const [Points, setPoints] = useState({});
  const [Word, setWord] = useState("");
  const [Guess, setGuess] = useState("");
  const [Drawer, setDrawer] = useState(false);
  const [DrawerName, setDrawerName] = useState(name);
  const [Drawing, setDrawing] = useState(false);
  const [DrawingColor, setDrawingColor] = useState("black");

  var draw = function (obj, context) {
    context.fillStyle = obj.color;
    context.beginPath();
    context.arc(obj.position.x, obj.position.y, 3, 0, 2 * Math.PI);
    context.fill();
  };

  socket.on("RESULT_GUESS", (data) => {
    if (data.result === "Correct") {
      setTimeout(() => {
        canvasRef.current
          .getContext("2d")
          .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }, 0);
      setPoints({ ...data.room.scores });
      setDrawer(Participants[data.room["drawerIdx"]] === name);
      setDrawerName(Participants[data.room["drawerIdx"]]);
      setWord(data.room["word"]);
    } else {
      console.log("Wrong");
    }
  });

  useEffect(() => {
    //USER JOINED
    socket.on("USER_JOINED", (details) => {
      console.log(details);
    });
  }, []);

  const guessHandler = (e) => {
    socket.emit("CHECK_GUESS", { roomId, name, Guess });
    console.log(Guess);
    setGuess("");
  };

  useEffect(() => {
    socket.on("RECIEVED_ROOMINFO", (data) => {
      setParticipants((_) => [...data.participants]);
      setPoints((_) => ({ ...data.scores }));
      setWord(data.word);
      console.log(
        Participants,
        data.drawerIdx,
        Participants[data.drawerIdx],
        name
      );
      if (Participants.length > 0) {
        setDrawer(Participants[data.drawerIdx] === name);
        setDrawerName(Participants[data.drawerIdx]);
      }
    });
  }, [Participants, name]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize(window.innerWidth);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    socket.emit("REQUEST_ROOMINFO", roomId);
  }, [roomId]);

  useEffect(() => {
    socket.on("TRANSMITTED_PAINTED_COORDINATES", (data) => {
      if (!Drawer) {
        draw(data.obj, canvasRef.current.getContext("2d"));
      }
    });
  }, [Drawer]);

  return (
    <>
      {" "}
      <header>
        <div className="flex flex-row justify-between p-4">
          <h1 className="text-2xl font-bold">Skribble</h1>
          <h1 className="text-2xl font-bold">Drawer: {DrawerName}</h1>
        </div>
      </header>
      <div className="mx-4 mb-10">
        <h1
          className={`${
            Participants.length <= 1 ? "visible" : "hidden"
          } + " text-2xl text-center"`}
        >
          Waiting for other players
        </h1>
        <div className={Participants.length > 1 ? "visible" : "hidden"}>
          <div className="border-2 rounded-xl">
            <canvas
              ref={canvasRef}
              onMouseDown={
                Drawer
                  ? (event) => {
                      event.preventDefault();
                      setDrawing(true);
                    }
                  : null
              }
              onMouseUp={
                Drawer
                  ? (event) => {
                      event.preventDefault();
                      setDrawing(false);
                    }
                  : null
              }
              onMouseMove={
                Drawer
                  ? (event) => {
                      var obj = {};
                      event.preventDefault();
                      obj.position = {
                        x: event.pageX - canvasRef.current.offsetLeft,
                        y: event.pageY - canvasRef.current.offsetTop,
                      };

                      if (Drawing === true) {
                        canvasRef.current.getContext("2d").fillStyle =
                          "#000000";
                        obj.color = DrawingColor;
                        canvasRef.current.getContext("2d").fillStyle =
                          obj.color;
                        canvasRef.current.getContext("2d").beginPath();
                        canvasRef.current
                          .getContext("2d")
                          .arc(
                            obj.position.x,
                            obj.position.y,
                            2,
                            0,
                            2 * Math.PI
                          );
                        canvasRef.current.getContext("2d").fill();
                        if (Drawer) {
                          socket.emit("PAINTED_COORDINATES", {
                            roomId,
                            name,
                            obj,
                          });
                        }
                      }
                    }
                  : null
              }
              height={400}
              width={size - 42}
              className="canvas_resize cursor-crosshair"
            ></canvas>
          </div>
          <div className="guess_div mt-1">
            <div className="flex flex-row">
              <div className="flex-grow">
                <div className="rounded-lg border-2 my-2">
                  <p>Hello world</p>
                  <p>Hello world</p>
                  <p>Hello world</p>
                  <p>Hello world</p>
                </div>
                {!Drawer ? (
                  <div className="my-2  text-left flex flex-row gap-2">
                    <input
                      onChange={(e) => setGuess(e.target.value)}
                      className=" border-2 p-2 rounded-lg flex-grow"
                      placeholder="Guess"
                    ></input>
                    <button
                      onClick={guessHandler}
                      className="rounded-lg transition-all p-2 hover:bg-blue-500 bg-white text-blue-500 hover:text-white border-2 border-blue-500 hover:underline"
                    >
                      Guess
                    </button>
                  </div>
                ) : (
                  <div className="border-2 rounded-lg">
                    <h1 className="text-2xl font-bold text-center">
                      {Drawer ? "Word: " + Word : ""}
                    </h1>
                  </div>
                )}
              </div>
              <div className="palette mt-2 mx-2 ml-4 grid grid-cols-5 gap-4">
                <div
                  className="w-6 h-6 bg-orange-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("orange")}
                ></div>
                <div
                  className="w-6 h-6 bg-red-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("red")}
                ></div>
                <div
                  className="w-6 h-6 bg-green-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("green")}
                ></div>
                <div
                  className="w-6 h-6 bg-yellow-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("yellow")}
                ></div>
                <div
                  className="w-6 h-6 bg-purple-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("purple")}
                ></div>
                <div
                  className="w-6 h-6 bg-black border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("black")}
                ></div>
                <div
                  className="w-6 h-6 bg-gray-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("gray")}
                ></div>
                <div
                  className="w-6 h-6 bg-amber-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("amber")}
                ></div>
                <div
                  className="w-6 h-6 bg-pink-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("pink")}
                ></div>
                <div
                  className="w-6 h-6 bg-blue-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("blue")}
                ></div>
                <div
                  className="w-6 h-6 bg-lime-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("lime")}
                ></div>
                <div
                  className="w-6 h-6 bg-cyan-500 border-2 rounded-md cursor-pointer"
                  onClick={() => setDrawingColor("cyan")}
                ></div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-7 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 mt-4 py-2 sm:gap-4 gap-1">
            {Participants.map((e) => {
              return (
                <div
                  className="flex flex-row justify-between rounded-full p-3 bg-yellow-500 text-white"
                  key={e}
                >
                  <h1>{e}</h1>
                  <p>{Points[e]} pts</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
