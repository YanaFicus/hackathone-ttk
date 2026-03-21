import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import StreamPlayer from "./pages/StreamPlayer";
import BroadcasterPanel from "./pages/BroadcasterPanel";
import RegisterPage from "./pages/Register";
import NotFoundPage from "./pages/404Page";
import Administration from "./pages/Administration";
import type { User } from "./types/user";
import { useState } from "react";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [user] = useState<User | null>(null);
  const navigate = useNavigate();
  
  const isAdmin = user?.roles.includes("Администратор") ?? false;
  
  if (!user) navigate("/");
  
  return isAdmin ? children : <Navigate to="/" replace />;
}

function BroadcasterRoute({ children }: { children: React.ReactNode }) {
  const [user] = useState<User | null>(null);
  const navigate = useNavigate();
  
  const isBroadcaster = user?.roles.includes("Вещатель") ?? false;
  
  if (!user) navigate("/");
  
  return isBroadcaster ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<StreamPlayer />} />
      <Route path="/broadcaster" element={
        <BroadcasterRoute>
          <BroadcasterPanel />
        </BroadcasterRoute>
      } />
      <Route path="/administration" element={
        <AdminRoute>
          <Administration />
        </AdminRoute>
      } />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
