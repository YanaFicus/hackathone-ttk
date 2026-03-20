# 📌 My React App

Простой проект на **React** с **React Router DOM**, сборкой через **Bun** и стилями на **Tailwind CSS v4**.  
Можно запускать локально или деплоить онлайн через **GitHub Pages** или **Vercel**.

---

## ⚡ Требования

- [Bun](https://bun.sh/) v1.0+  
- Git (для клонирования репозитория)  
- Браузер

---

## 🛠 Установка и запуск локально

1. Клонируем репозиторий:

```bash
git clone https://github.com/USERNAME/REPO.git
cd REPO
```

2. Устанавливаем зависимости:

```bash
bun install
```

Запуск dev-сервера:

```bash
bun dev
```

Открой браузер и перейди на: http://localhost:5173

## 📦 Структура проекта
hackathone-ttk/
├─ src/
│  ├─ index.jsx         # Точка входа
│  ├─ App.jsx           # Главный компонент
│  ├─ pages/            # Страницы приложения
│  │  ├─ Home.jsx
│  │  └─ About.jsx
│  └─ index.css         # Tailwind v4 + preflight
├─ bun.lockb            # lock-файл Bun
├─ tailwind.config.js   # Настройка Tailwind
└─ package.json

## 🎨 Tailwind CSS v4

В src/index.css подключено:

```css
@import "tailwindcss/preflight"; /* сброс дефолтных стилей браузера */
@tailwind utilities;             /* все утилиты Tailwind */
```

## 🔗 React Router DOM

В проекте используется <BrowserRouter> для маршрутизации

Примеры маршрутов:

/       -> Home
/about  -> About

## ✅ Советы

Для новых зависимостей используйте bun add package_name

TypeScript: bun add -d @types/react @types/react-dom @types/react-router-dom

С Tailwind v4 preflight уже сбрасывает дефолтные стили браузера