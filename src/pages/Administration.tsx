import { useState } from "react";
import type { DateTimeFormatOptions } from "intl";
import Header from "../components/Header";

export default function Administration() {
  // Состояния фильтров
  const [filters, setFilters] = useState({
    username: "",
    fullName: "",
    role: "all",
    registrationFrom: "",
    registrationTo: "",
  });

  const [showClearAll, setShowClearAll] = useState(false);

  // Демо-данные пользователей
  const [users] = useState([
    {
      id: 1,
      username: "admin",
      fullName: "Администратор Системы",
      roles: ["Администратор", "Вещатель", "Пользователь"],
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      username: "broadcaster",
      fullName: "Иван Петров",
      roles: ["Вещатель", "Пользователь"],
      registrationDate: "2024-02-20",
    },
    {
      id: 3,
      username: "user",
      fullName: "Мария Иванова",
      roles: ["Пользователь"],
      registrationDate: "2024-03-10",
    },
    {
      id: 4,
      username: "alexsmith",
      fullName: "Алексей Смирнов",
      roles: ["Пользователь"],
      registrationDate: "2024-03-15",
    },
    {
      id: 5,
      username: "broadcaster2",
      fullName: "Елена Васильева",
      roles: ["Вещатель", "Пользователь"],
      registrationDate: "2024-03-18",
    },
  ]);

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesUsername =
      filters.username === "" ||
      user.username.toLowerCase().includes(filters.username.toLowerCase());
    const matchesFullName =
      filters.fullName === "" ||
      user.fullName.toLowerCase().includes(filters.fullName.toLowerCase());
    const matchesRole =
      filters.role === "all" ||
      user.roles
        .map((r) => r.toLowerCase())
        .includes(filters.role.toLowerCase());

    return matchesUsername && matchesFullName && matchesRole;
  });

  // Обработчики изменений фильтров
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Показываем кнопку Clear all если есть активные фильтры
    const newFilters = { ...filters, [key]: value };
    const hasActiveFilters = Object.values(newFilters).some(
      (val) => val !== "",
    );
    setShowClearAll(hasActiveFilters);
  };

  const handleClearAll = () => {
    setFilters({
      username: "",
      fullName: "",
      role: "all",
      registrationFrom: "",
      registrationTo: "",
    });
    setShowClearAll(false);
  };

  const handleEditUser = (userId: number) => {
    console.log("Edit user:", userId);
  };

  const handleGrantAccess = (userId: number) => {
    console.log("Grant access to user:", userId);
  };

  const handleProtectUser = (userId: number) => {
    console.log("Protect user:", userId);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      console.log("Delete user:", userId);
    }
  };

  // Получение цвета для роли
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "администратор":
        return "bg-red-100 text-red-700 border-red-200";
      case "вещатель":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "пользователь":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("ru-RU", options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-red-600"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Эдминистратор</h1>
          </div>
          <p className="text-gray-600">
            Управляй пользователями, ролями и настройками
          </p>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Управление Пользователями
            </h2>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span className="font-medium">Фильтры</span>

              {showClearAll && (
                <button
                  onClick={handleClearAll}
                  className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Очистить все
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Никнейм пользователя
                </label>
                <input
                  type="text"
                  value={filters.username}
                  onChange={(e) =>
                    handleFilterChange("username", e.target.value)
                  }
                  placeholder="Поиск по никнейму"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Полное имя
                </label>
                <input
                  type="text"
                  value={filters.fullName}
                  onChange={(e) =>
                    handleFilterChange("fullName", e.target.value)
                  }
                  placeholder="Поиск по имени"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Роль
                </label>
                <select
                  value={filters.role}
                  title="Роль"
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                >
                  <option value="all">Все роли</option>
                  <option value="пользователь">Пользователь</option>
                  <option value="вещатель">Вещатель</option>
                  <option value="администратор">Администратор</option>
                </select>
              </div>

              {/* Registration From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Зарегистрирован с
                </label>
                <input
                  type="text"
                  value={filters.registrationFrom}
                  onChange={(e) =>
                    handleFilterChange("registrationFrom", e.target.value)
                  }
                  placeholder="дд.мм.гггг"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Registration To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Зарегистрирован до
                </label>
                <input
                  type="text"
                  value={filters.registrationTo}
                  onChange={(e) =>
                    handleFilterChange("registrationTo", e.target.value)
                  }
                  placeholder="дд.мм.гггг"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Никнейм пользователя
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Полное имя
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Роли
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {user.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {user.fullName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getRoleColor(role)}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDate(user.registrationDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Grant Access */}
                        <button
                          onClick={() => handleGrantAccess(user.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Grant Access"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
                            <circle cx="12" cy="13" r="3" />
                            <path d="M12 10v6" />
                            <path d="M10 12h4" />
                          </svg>
                        </button>

                        {/* Protect */}
                        <button
                          onClick={() => handleProtectUser(user.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Protect"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Показано {filteredUsers.length} из {users.length} пользователей
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
