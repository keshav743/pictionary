import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<Game />} />
      </Routes>
    </div>
  );
}

export default App;
