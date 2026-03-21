import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../services/auth/authApi"; // RTK Query
import { useEffect, useState } from "react";
import { base64UrlDecode } from "../utils/base64UrlDecode";

// Тип данных пользователя
interface User {
  login: string;
  fullName: string;
  roles: string[];
}

const roleMap: Record<number, string> = {
  1: "Пользователь",
  2: "Вещатель",
  4: "Администратор",
};

export default function Header() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.roles.includes("Администратор") ?? false;
  const isBroadcaster = user?.roles.includes("Вещатель") ?? false;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      queueMicrotask(() => setUser(null));
      return;
    }

    const decodeUser = () => {
      try {
        const parts = token.split(".");
        if (parts.length !== 3) throw new Error("Invalid token format");

        const payload = JSON.parse(base64UrlDecode(parts[1]));

        const login = payload.login || payload.unique_name || payload.sub || "Unknown";
        let roles: string[] = [];

        if (Array.isArray(payload.roles)) {
          roles = payload.roles.map((r: number) => roleMap[r]).filter(Boolean);
        } else if (typeof payload.role === "string") {
          roles = payload.role === "User" ? ["Пользователь"] :
                  payload.role === "Broadcaster" ? ["Вещатель"] :
                  payload.role === "Admin" ? ["Администратор"] : [payload.role];
        }

        if (!roles.length) roles = ["Пользователь"];
        const fullName = payload.fullName || payload.FullName || login;

        queueMicrotask(() => setUser({ login, fullName, roles }));
      } catch (e) {
        console.error("Ошибка декодирования токена:", e);
        queueMicrotask(() => setUser(null));
      }
    };

    decodeUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/login");
    } catch (e) {
      console.error("Error during logout:", e);
      // Даже если API выхода не сработал, очищаем локальное состояние
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть: Логотип и навигация */}
          <div className="flex items-center gap-8">
            {/* Логотип */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"
                    fill="white"
                  />
                  <path
                    d="M12 6c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l1.42-1.42C8.45 14.09 8 13.09 8 12c0-2.21 1.79-4 4-4 .55 0 1 .45 1 1s-.45 1-1 1z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Менеджер Стримов
              </span>
            </div>

            {/* Навигация */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg"
              >
                Главная
              </button>
              {isBroadcaster && (
                <button
                  onClick={() => navigate("/broadcaster")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Вещатель
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => navigate("/administration")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Администрирование
                </button>
              )}
            </nav>
          </div>

          {/* Правая часть: Информация о пользователе и выход */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{user.login}</span>
                  <div className="flex gap-1">
                    {user.roles.map((role) => {
                      let color = "bg-blue-100 text-blue-700";
                      if (role === "Администратор") color = "bg-red-100 text-red-700";
                      if (role === "Вещатель") color = "bg-purple-100 text-purple-700";
                      return (
                        <span key={role} className={`px-2 py-0.5 text-xs font-medium rounded ${color}`}>
                          {role}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  Выйти
                </button>
              </div>
            ) : (
              <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
