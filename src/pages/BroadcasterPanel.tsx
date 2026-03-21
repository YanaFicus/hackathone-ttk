import { useState } from "react";
import Header from "../components/Header";

export default function BroadcasterPanel() {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);

  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Моковые данные
  const [mediaFiles] = useState([
    {
      id: 1,
      name: "intro_music.mp3",
      size: "3.34 MB",
      duration: "3:45",
      inPlaylist: true,
    },
    {
      id: 2,
      name: "background_loop.wav",
      size: "7.82 MB",
      duration: "2:30",
      inPlaylist: false,
    },
  ]);

  const [playlist] = useState([
    { id: 1, name: "intro_music.mp3", duration: "3:45" },
  ]);

  const [messages] = useState([
    {
      id: 1,
      user: "user",
      text: "Great music! Can you play some jazz next?",
      time: "2024-03-21 10:30",
      status: "new",
      isVoice: false,
    },
    {
      id: 2,
      user: "alexsmith",
      text: "Voice message recording...",
      time: "2024-03-21 10:35",
      status: "in-progress",
      isVoice: true,
    },
    {
      id: 3,
      user: "user",
      text: "Love the show! Keep it up!",
      time: "2024-03-21 10:40",
      status: "new",
      isVoice: false,
    },
  ]);

  const archivedMessages = [
    {
      id: 4,
      user: "broadcaster2",
      text: "Testing the feedback system",
      time: "2024-03-21 10:25",
    },
  ];

  const handleToggleBroadcast = () => {
    setIsBroadcasting(!isBroadcasting);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleFileUpload = () => {
    console.log("Upload files");
  };

  const handleDeleteFile = (id: number) => {
    console.log("Delete file:", id);
  };

  const handleAddToPlaylist = (id: number) => {
    console.log("Add to playlist:", id);
  };

  const handleMessageStatus = (id: number, status: string) => {
    console.log("Update message status:", id, status);
  };

  // Статистика сообщений
  const newMessagesCount = messages.filter((m) => m.status === "new").length;
  const inProgressCount = messages.filter(
    (m) => m.status === "in-progress",
  ).length;
  const completedCount = messages.filter(
    (m) => m.status === "completed",
  ).length;

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
              className="text-purple-600"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">
              Панель управления вещателя
            </h1>
          </div>
          <p className="text-gray-600">
            Управляйте своими трансляциями, плейлистами и сообщениями аудитории
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка */}
          <div className="lg:col-span-2 space-y-6">
            {/* Broadcast Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Статус вещания
                </h2>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isBroadcasting
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isBroadcasting ? "LIVE" : "OFFLINE"}
                </span>
              </div>

              <button
                onClick={handleToggleBroadcast}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  isBroadcasting
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  <circle cx="12" cy="12" r="3" opacity="0.5" />
                </svg>
                {isBroadcasting ? "Остановить вещание" : "Начать вещание"}
              </button>
            </div>

            {/* Media Library */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Медиатека
                </h2>
                <button
                  onClick={handleFileUpload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Загрузить файлы
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Аудио: MP3, WAV, OGG (макс 50MB) • Видео: MP4, WebM (макс
                1000MB)
              </p>

              <div className="space-y-3">
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-500"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.size} • {file.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.inPlaylist ? (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          В плейлисте
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToPlaylist(file.id)}
                          className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                        >
                          Добавить
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playlist */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Плейлист
              </h2>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsLoop(!isLoop)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    isLoop
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  Зациклить
                </button>
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    isShuffle
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  Перемешать
                </button>
              </div>

              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 w-5">
                        {index + 1}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-500"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      <span className="font-medium text-gray-900">
                        {track.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {track.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Аудиоконтроль
              </h2>

              <div
                className={`p-4 rounded-xl mb-6 flex items-center gap-4 ${
                  isRecording ? "bg-red-50 border border-red-200" : "bg-pink-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isRecording ? "bg-red-500 animate-pulse" : "bg-pink-200"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {isRecording ? "Запись живого аудио" : "Запись с микрофона"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Записывать в прямом эфире или добавить в плейлист
                  </p>
                </div>
                <button
                  onClick={handleToggleRecording}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-pink-600 hover:bg-pink-700 text-white"
                  }`}
                >
                  {isRecording ? "Остановить" : "Записать"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Общая громкость
                </label>
                <div className="flex items-center gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-600"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    title="Мастер Звука"
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {masterVolume}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Broadcast */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Видеовещание
              </h2>

              <button
                onClick={handleToggleVideo}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mb-4 ${
                  isVideoEnabled
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {isVideoEnabled ? "Видео включено" : "Включить видео"}
              </button>

              {isVideoEnabled && (
                <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    className="mb-3"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p className="text-white font-medium">
                    Предпросмотр камеры активен
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Требуется доступ к камере и микрофону
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка */}
          <div className="space-y-6">
            {/* Audience Messages */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-600"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <h2 className="text-[16px] font-semibold text-gray-900">
                    Сообщения аудитории
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    {messages.length} Активны
                  </span>
                  <button
                    onClick={() => setShowArchive(!showArchive)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={showArchive ? "Скрыть архив" : "Показать архив"}
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
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {message.user}
                        </span>
                        {message.isVoice && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            Голос
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {message.time}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{message.text}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleMessageStatus(message.id, "in-progress")
                          }
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            message.status === "in-progress"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          В процессе
                        </button>
                        <button
                          onClick={() =>
                            handleMessageStatus(message.id, "completed")
                          }
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            message.status === "completed"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Завершены
                        </button>
                      </div>
                      {message.status === "new" && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          Новые
                        </span>
                      )}
                      {message.status === "in-progress" && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          В процессе
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Archive */}
              {showArchive && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Архив ({archivedMessages.length})
                  </h3>
                  <div className="space-y-2">
                    {archivedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-gray-600">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Статистика сообщений
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {newMessagesCount}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">Новые</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">
                    {inProgressCount}
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">В процессе</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {completedCount}
                  </div>
                  <div className="text-xs text-green-700 mt-1">Завершены</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
