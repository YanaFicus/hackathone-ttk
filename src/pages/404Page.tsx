import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 flex flex-col items-center text-center max-w-md">
        
        <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary flex items-center justify-center mb-6">
          <SearchX className="text-red-600 text-6xl w-10 h-10 p-0" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">
          Страница не найдена или была удалена
        </p>

        <Link
          to="/"
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium"
        >
          Вернуться на главную
        </Link>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Возможно, вы ошиблись в адресе или страница больше не существует
      </p>
    </div>
  );
}