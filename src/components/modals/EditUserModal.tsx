import { useState } from "react";
import Modal from "./Modal";
import type { User } from "../../types/user";

type EditUserForm = {
  username: string;
  fullName: string;
};

interface UserErrors {
  username?: string;
  fullName?: string;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: (user: User) => void;
}) {
  const [formData, setFormData] = useState<EditUserForm>({
    username: user?.username || "",
    fullName: user?.fullName || "",
  });

  const [errors, setErrors] = useState<UserErrors>({});

  const validate = () => {
    const newErrors: UserErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Имя пользователя обязательно";
    } else if (formData.username.length < 3) {
      newErrors.username = "Минимум 3 символа";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Только латинские буквы, цифры и знак подчеркивания";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Полное имя обязательно";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate() && user) {
      // Сохраняем все поля пользователя, включая roles
      const updatedUser: User = {
        ...user,           // Сохраняем id, roles, registrationDate
        username: formData.username,
        fullName: formData.fullName,
      };
      
      console.log("Updating user:", updatedUser); // Для отладки
      onSave(updatedUser);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать пользователя"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info */}
        <div className="bg-gray-50 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-700">
            Редактирование пользователя:{" "}
            <span className="font-semibold">{user?.username}</span>
            {user?.fullName && (
              <span className="text-gray-500"> ({user.fullName})</span>
            )}
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Никнейм
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.username
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }`}
            placeholder="Введите имя пользователя"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Латинские буквы
          </p>
          {errors.username && (
            <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Полное имя
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.fullName
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }`}
            placeholder="Введите полное имя"
          />
          {errors.fullName && (
            <p className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Roles Info */}
        {user?.roles && user.roles.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Текущие роли:</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((roleCode) => {
                const roleNames: Record<number, string> = {
                  0: "Пользователь",
                  1: "Вещатель",
                  2: "Администратор",
                };
                return (
                  <span
                    key={roleCode}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700"
                  >
                    {roleNames[roleCode]}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            Сохранить изменения
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}