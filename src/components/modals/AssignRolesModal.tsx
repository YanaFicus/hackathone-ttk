import { useState } from "react";
import Modal from "./Modal";
import type { User } from "../../types/user";

type RoleKey = "user" | "broadcaster" | "administrator";

// Маппинг числовых ролей в строковые ключи
const roleCodeToKey: Record<number, RoleKey> = {
  0: "user",
  1: "broadcaster",
  2: "administrator",
};

// Маппинг строковых ключей в числовые роли
const roleKeyToCode: Record<RoleKey, number> = {
  user: 0,
  broadcaster: 1,
  administrator: 2,
};

interface SelectedRoles {
  user: boolean;
  broadcaster: boolean;
  administrator: boolean;
}

export default function AssignRolesModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: User) => void;
}) {
  const getInitialRoles = (user: User): SelectedRoles => {
    // Инициализируем все роли как false
    const initial: SelectedRoles = {
      user: false,
      broadcaster: false,
      administrator: false,
    };
    
    // Проходим по числовым ролям пользователя и устанавливаем соответствующие ключи
    user.roles.forEach((roleCode) => {
      const roleKey = roleCodeToKey[roleCode];
      if (roleKey) {
        initial[roleKey] = true;
      }
    });
    
    console.log("Initial roles:", initial); // Для отладки
    return initial;
  };

  const [selectedRoles, setSelectedRoles] = useState<SelectedRoles>(
    getInitialRoles(user),
  );

  const handleRoleToggle = (role: RoleKey) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const handleSubmit = () => {
    // Преобразуем выбранные роли в массив чисел
    const roles: number[] = [];
    
    if (selectedRoles.user) roles.push(roleKeyToCode.user);
    if (selectedRoles.broadcaster) roles.push(roleKeyToCode.broadcaster);
    if (selectedRoles.administrator) roles.push(roleKeyToCode.administrator);

    if (roles.length === 0) {
      alert("Пользователь должен иметь хотя бы одну роль");
      return;
    }

    console.log("Saving roles:", roles); // Для отладки
    
    // Сохраняем обновленного пользователя с новыми ролями
    onSave({ ...user, roles });
    onClose();
  };

  const roles: {
    key: RoleKey;
    name: string;
    description: string;
    color: "blue" | "purple" | "red";
    icon: React.ReactNode;
  }[] = [
    {
      key: "user",
      name: "Пользователь",
      description:
        "Базовый доступ к основной странице плеера и функциям обратной связи",
      color: "blue",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      key: "broadcaster",
      name: "Вещатель",
      description:
        "Доступ к управлению вещанием, медиатеке и управлению сообщениями",
      color: "purple",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      ),
    },
    {
      key: "administrator",
      name: "Администратор",
      description:
        "Полный доступ к системе включая управление пользователями и администрирование",
      color: "red",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  const getColorClasses = (
    color: "blue" | "purple" | "red",
    isSelected: boolean,
  ) => {
    const colors = {
      blue: {
        bg: isSelected ? "bg-blue-50" : "bg-white",
        border: isSelected ? "border-blue-500" : "border-gray-200",
        text: "text-blue-900",
        icon: isSelected ? "text-blue-600" : "text-blue-500",
        toggle: isSelected ? "bg-blue-600" : "bg-gray-200",
      },
      purple: {
        bg: isSelected ? "bg-purple-50" : "bg-white",
        border: isSelected ? "border-purple-500" : "border-gray-200",
        text: "text-purple-900",
        icon: isSelected ? "text-purple-600" : "text-purple-500",
        toggle: isSelected ? "bg-purple-600" : "bg-gray-200",
      },
      red: {
        bg: isSelected ? "bg-red-50" : "bg-white",
        border: isSelected ? "border-red-500" : "border-gray-200",
        text: "text-red-900",
        icon: isSelected ? "text-red-600" : "text-red-500",
        toggle: isSelected ? "bg-red-600" : "bg-gray-200",
      },
    };
    return colors[color];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Назначить роли"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Info */}
        <div className="bg-gray-50 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-700">
            Назначение ролей для:{" "}
            <span className="font-semibold">{user?.username}</span>
            {user?.fullName && (
              <span className="text-gray-500"> ({user.fullName})</span>
            )}
          </p>
        </div>

        {/* Roles */}
        <div className="space-y-3">
          {roles.map((role) => {
            const isSelected = selectedRoles[role.key];
            const classes = getColorClasses(role.color, isSelected);

            return (
              <div
                key={role.key}
                className={`p-4 rounded-xl border-2 ${classes.bg} ${classes.border} cursor-pointer transition-all hover:shadow-md`}
                onClick={() => handleRoleToggle(role.key)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`${classes.icon} mt-0.5`}>{role.icon}</div>
                    <div>
                      <h4 className={`font-semibold ${classes.text}`}>
                        {role.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full ${classes.toggle} transition-colors flex items-center justify-center`}
                  >
                    {isSelected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            <strong>Примечание:</strong> Только администраторы могут назначать
            роли "Вещатель" и "Администратор". Пользователь должен иметь хотя
            бы одну назначенную роль.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Сохранить роли
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
}