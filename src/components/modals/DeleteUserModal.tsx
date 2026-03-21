import Modal from "./Modal";
import type { User } from "../../types/user";

// Маппинг числовых ролей в строки для отображения
const roleCodeToLabel: Record<number, string> = {
  0: "Пользователь",
  1: "Вещатель",
  2: "Администратор",
};

// Цвета для ролей
const getRoleColor = (roleCode: number): string => {
  const colors: Record<number, string> = {
    0: "bg-blue-100 text-blue-700",
    1: "bg-purple-100 text-purple-700",
    2: "bg-red-100 text-red-700",
  };
  return colors[roleCode] || "bg-gray-100 text-gray-700";
};

export default function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onDelete: (id: string) => void; // Изменяем с number на string
}) {
  const handleDelete = () => {
    onDelete(user.id); // user.id уже string
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Удалить пользователя"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              className="shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-900 mb-1">
                Вы уверены, что хотите удалить этого пользователя?
              </h4>
              <p className="text-sm text-red-700">
                Это выполнит мягкое удаление (soft delete) - пользователь будет
                удалён из таблицы, но его данные останутся в истории системы для
                целей аудита.
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">ID пользователя:</span>
            <span className="text-sm font-mono text-gray-900">
              {user?.id.substring(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Имя пользователя:</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.username}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Полное имя:</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.fullName}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600 block mb-2">Роли:</span>
            <div className="flex flex-wrap gap-1.5">
              {user?.roles.map((roleCode: number) => {
                const roleName = roleCodeToLabel[roleCode];
                const colorClass = getRoleColor(roleCode);
                return (
                  <span
                    key={roleCode}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md ${colorClass}`}
                  >
                    {roleName}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Дата регистрации:</span>
            <span className="text-sm text-gray-900">
              {user?.registrationDate 
                ? new Date(user.registrationDate).toLocaleDateString("ru-RU")
                : "Не указана"}
            </span>
          </div>
        </div>

        {/* Additional Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Важно:</strong> Это действие необратимо. Пользователь будет
            удалён из системы, но его данные сохранятся для аудита.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            Удалить пользователя
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