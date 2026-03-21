import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import StreamPlayer from "./pages/StreamPlayer";
import BroadcasterPanel from "./pages/BroadcasterPanel";
import RegisterPage from "./pages/Register";
import NotFoundPage from "./pages/404Page";
import Administration from "./pages/Administration";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<StreamPlayer />} />
      <Route path="/broadcaster" element={<BroadcasterPanel />} />
      <Route path="/administration" element={<Administration />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
