import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import StreamPlayer from "./pages/StreamPlayer";
import BroadcasterPanel from "./pages/BroadcasterPanel";
import RegisterPage from "./pages/Register";
import NotFoundPage from "./pages/404Page";
import Administration from "./pages/Administration";
import type { User } from "./types/user";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return <Navigate to="/" replace />;
  }

  const user: User = JSON.parse(savedUser);

  const isAdmin = user.roles.includes(2);

  return isAdmin ? children : <Navigate to="/" replace />;
}

function BroadcasterRoute({ children }: { children: React.ReactNode }) {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return <Navigate to="/" replace />;
  }

  const user: User = JSON.parse(savedUser);

  const isBroadcaster = user.roles.includes(1);

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
