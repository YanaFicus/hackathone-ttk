import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/auth/authApi";

interface FormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const [login] = useLoginMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      console.log("Logged in user:", result);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      alert("Неверное имя пользователя или пароль");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
            <LogIn className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
          С возвращением
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Войдите для доступа к системе управления стримингом
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              required
            />
            <span className="text-xs text-gray-400 mt-1.5 block">
              Только латинские буквы
            </span>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg 
                     transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 
                     active:translate-y-0"
          >
            Войти
          </button>
        </form>

        <p className="text-center text-gray-600 mt-8 mb-8">
          Нет аккаунта?{" "}
          <Link to='/register' className="text-primary font-medium hover:underline focus:outline-none">
            Зарегистрируйтесь
          </Link>
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <p className="text-sm text-gray-500 font-medium mb-3">Демо-доступ:</p>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>
              <strong className="text-gray-700">Администратор:</strong> admin /
              admin123
            </p>
            <p>
              <strong className="text-gray-700">Вещатель:</strong> broadcaster /
              broadcast123
            </p>
            <p>
              <strong className="text-gray-700">Пользователь:</strong> user /
              user123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
