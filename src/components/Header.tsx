import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Здесь будет логика выхода
    navigate("/login");
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
              <button
                onClick={() => navigate("/broadcaster")}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Вещатель
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Администрирование
              </button>
            </nav>
          </div>

          {/* Правая часть: Информация о пользователе и выход */}
          <div className="flex items-center gap-4">
            {/* Роли пользователя */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-500"
              >
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">admin</span>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                  Администратор
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                  Вещатель
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  Пользователь
                </span>
              </div>
            </div>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
