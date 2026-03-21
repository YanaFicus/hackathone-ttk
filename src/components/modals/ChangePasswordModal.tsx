import { useState } from "react";
import Modal from "./Modal";
import type { User } from "../../types/user";

interface PasswordErrors {
  newPassword?: string;
  confirmPassword?: string;
}

interface ChangePasswordData {
  userId: number;
  password: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (data: ChangePasswordData) => void;
}) {
  const [formData, setFormData] = useState<{
    newPassword: string;
    confirmPassword: string;
  }>({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<PasswordErrors>({});

  const validate = () => {
    const newErrors: PasswordErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Пароль обязателен";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Минимум 6 символов";
    } else if (!/^[a-zA-Z0-9!@#$%^&*]+$/.test(formData.newPassword)) {
      newErrors.newPassword = "Только латинские буквы, цифры и символы";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validate()) {
      onSave({
        userId: user.id,
        password: formData.newPassword,
      });

      setFormData({ newPassword: "", confirmPassword: "" });
      onClose();
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return "";
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const strength = getPasswordStrength(formData.newPassword);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Сменить пароль"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info */}
        <div className="bg-gray-50 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-700">
            Смена пароля для:{" "}
            <span className="font-semibold">{user?.username}</span>
          </p>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Новый пароль
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.newPassword
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }`}
            placeholder="Введите новый пароль"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Латинские буквы, цифры и символы (мин. 6 символов)
          </p>
          {errors.newPassword && (
            <p className="mt-1.5 text-sm text-red-600">{errors.newPassword}</p>
          )}
          {formData.newPassword && !errors.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5">
                <div
                  className={`flex-1 rounded-full ${
                    strength === "weak"
                      ? "bg-red-400"
                      : strength === "medium"
                        ? "bg-yellow-400"
                        : "bg-green-500"
                  }`}
                />
                <div
                  className={`flex-1 rounded-full ${
                    strength === "medium" || strength === "strong"
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
                <div
                  className={`flex-1 rounded-full ${
                    strength === "strong" ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Сложность пароля:{" "}
                {strength === "weak"
                  ? "Слабый"
                  : strength === "medium"
                    ? "Средний"
                    : "Надёжный"}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Подтвердите новый пароль
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.confirmPassword
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }`}
            placeholder="Повторите новый пароль"
          />
          {formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword && (
              <div className="flex items-center gap-1 mt-1.5 text-green-600 text-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Пароли совпадают</span>
              </div>
            )}
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Security Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Примечание безопасности:</strong> Новый пароль будет
            захэширован с использованием отраслевых стандартных алгоритмов
            (bcrypt/argon2) перед сохранением в базе данных.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
            Сменить пароль
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
