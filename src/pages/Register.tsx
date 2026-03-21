import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegisterMutation } from "../services/auth/authApi";

interface FormData {
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [register] = useRegisterMutation();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // простая валидация-заглушка
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value) {
      error = "Поле обязательно";
    }

    if (name === "username" && value) {
      if (!/^[a-zA-Z]+$/.test(value)) {
        error = "Только латинские буквы";
      }
    }

    if (name === "fullName" && value) {
      if (!/^[а-яА-ЯёЁ\s]+$/.test(value)) {
        error = "Только кириллица";
      }
    }

    if (name === "password" && value) {
      if (value.length < 6) {
        error = "Минимум 6 символов";
      }
    }

    if (name === "confirmPassword" && value) {
      if (value !== formData.password) {
        error = "Пароли не совпадают";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(formData).unwrap();
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      console.log("Registered user:", result);
      // navigate to main page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Registration error:", err);
      alert(err.data?.message || "Ошибка регистрации");
    }
  };

  const handleLogin = () => {
    console.log("Переход на логин");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        
        {/* Иконка */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
            <UserPlus className="text-white" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Регистрация
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Создайте аккаунт для работы с системой
        </p>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите username"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-400 mt-1">
              Только латинские буквы
            </p>
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ФИО
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Введите ФИО"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-400 mt-1">
              Только кириллица
            </p>
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-400 mt-1">
              Минимум 6 символов
            </p>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Подтвердите пароль
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
          >
            Зарегистрироваться
          </button>
        </form>

        {/* Ссылка */}
        <p className="text-center text-gray-600 mt-8">
          Уже есть аккаунт?{" "}
          <Link to="/login">
            <button
              onClick={handleLogin}
              className="text-primary font-medium hover:underline"
            >
              Войти
            </button>
          </Link>
        </p>

        {/* Инфо блок */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-8">
          <p className="text-sm text-gray-500">
            После регистрации вам будет назначена роль пользователя.
          </p>
        </div>
      </div>
    </div>
  );
}