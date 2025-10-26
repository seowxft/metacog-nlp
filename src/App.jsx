import { Routes, Route } from "react-router-dom";

// Components import
import Home from "./Components/Home.jsx";
import StartPage from "./Components/StartPage.jsx";
import PerTut from "./Components/PerTut.jsx";
import PerTask from "./Components/PerTask.jsx";
import Bonus from "./Components/Bonus.jsx";
import Questionnaires from "./Components/Questionnaires";
import EndPage from "./Components/EndPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="StartPage" element={<StartPage />} />
      <Route path="PerTut" element={<PerTut />} />
      <Route path="PerTask" element={<PerTask />} />
      <Route path="Bonus" element={<Bonus />} />
      <Route path="Questionnaires" element={<Questionnaires />} />
      <Route path="End" element={<EndPage />} />
    </Routes>
  );
}

export default App;
