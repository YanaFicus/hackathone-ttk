/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useCreateLiveKitTokenMutation } from "../services/livekit/livekitApi";
import { getUserId } from "../utils/auth";

const LIVEKIT_WS_URL = "ws://95.174.104.223:7880";

// 🔥 Типы для симуляции чата
interface SimulatedMessage {
  id: string;
  userId: string;
  authorLogin: string;
  authorFullName: string;
  text: string;
  status: "New" | "InProgress" | "Completed";
  createdAtUtc: string;
}

export default function StreamPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState("Прямой аудиопоток");
  
  // 🔥 Симуляция чата (локальный стейт вместо API)
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: "msg-1",
      userId: "other-user-1",
      authorLogin: "viewer123",
      authorFullName: "Зритель 1",
      text: "Привет! Как звучит?",
      status: "New",
      createdAtUtc: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: "msg-2",
      userId: "other-user-2",
      authorLogin: "musiclover",
      authorFullName: "Меломан",
      text: "Отличный трек! 🔥",
      status: "Completed",
      createdAtUtc: new Date(Date.now() - 30000).toISOString(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [createLiveKitToken] = useCreateLiveKitTokenMutation();

  // Подключение к LiveKit при загрузке
  useEffect(() => {
    connectToStream();
    return () => {
      if (room) room.disconnect();
    };
  }, []);

  // 🔥 Автоскролл чата к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectToStream = async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);

    try {
      const realUserId = getUserId();
      
      const tokenData = await createLiveKitToken({
        id: realUserId,
        username: "Viewer",
        role: "user",
      }).unwrap();

      console.log("Viewer token received");

      const { Room, RoomEvent } = await import("livekit-client");
      const newRoom = new Room({ adaptiveStream: true, dynacast: true });

      newRoom.on(RoomEvent.Connected, () => {
        console.log("Connected to LiveKit room");
        setIsConnected(true);
        setIsConnecting(false);
        setIsPlaying(true);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log("Disconnected from LiveKit");
        setIsConnected(false);
        setIsPlaying(false);
        setRoom(null);
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
        if (track.kind === "video") {
          setHasVideo(true);
          if (videoRef.current) track.attach(videoRef.current);
        }
        if (track.kind === "audio") {
          if (audioRef.current) track.attach(audioRef.current);
        }
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === "video") {
          setHasVideo(false);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      });

      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`Participant connected: ${participant.identity}`);
        setCurrentTrackName(`Вещатель: ${participant.identity}`);
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log(`Participant disconnected: ${participant.identity}`);
        setCurrentTrackName("Вещатель отключился");
      });

      await newRoom.connect(LIVEKIT_WS_URL, tokenData.token);
      setRoom(newRoom);
    } catch (err) {
      console.error("Failed to connect to stream:", err);
      setIsConnecting(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
    if (videoRef.current) videoRef.current.volume = newVolume / 100;
  };

  // 🔥 Отправка сообщения (СИМУЛЯЦИЯ)
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const currentUserId = getUserId() || "unknown-user";
    const currentUserInfo = JSON.parse(localStorage.getItem("user") || "{}");
    
    // 🔥 Создаём новое сообщение
    const newMessage: SimulatedMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      authorLogin: currentUserInfo.login || "Вы",
      authorFullName: currentUserInfo.fullName || "Пользователь",
      text: chatInput,
      status: "New",
      createdAtUtc: new Date().toISOString(),
    };
    
    // 🔥 Добавляем в локальный стейт
    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    
    console.log("💬 Message sent (simulated):", newMessage);
    
    // 🔥 Опционально: симуляция ответа от "вещателя" через 2 секунды
    setTimeout(() => {
      const botResponse: SimulatedMessage = {
        id: `msg-${Date.now()}-bot`,
        userId: "broadcaster-bot",
        authorLogin: "Broadcaster",
        authorFullName: "Вещатель",
        text: "Спасибо за сообщение! 🎧",
        status: "Completed",
        createdAtUtc: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 2000);
  };

  // 🔥 Обновление статуса сообщения (для симуляции)
  const handleUpdateStatus = (messageId: string, status: "New" | "InProgress" | "Completed") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  };

  const handleRecording = () => setIsRecording(!isRecording);

  // 🔥 Форматирование времени
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  // 🔥 Цвет статуса
  const getStatusColor = (status: "New" | "InProgress" | "Completed") => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-700";
      case "InProgress": return "bg-yellow-100 text-yellow-700";
      case "Completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    const handleUserGesture = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener("click", handleUserGesture);
      document.removeEventListener("touchstart", handleUserGesture);
    };
    document.addEventListener("click", handleUserGesture);
    document.addEventListener("touchstart", handleUserGesture);
    return () => {
      document.removeEventListener("click", handleUserGesture);
      document.removeEventListener("touchstart", handleUserGesture);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M5 3l14 9-14 9V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Аудиоплеер</h1>
            {isConnected && (
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">LIVE</span>
            )}
          </div>
          <p className="text-gray-600">Слушайте прямые эфиры и общайтесь с вещателями</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 🔹 Плеер */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"} rounded-full`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isConnected ? "Прямой эфир" : "Ожидание подключения"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                  <span>{currentTrackName}</span>
                </div>
              </div>

              <div className="bg-slate-900 aspect-video flex flex-col items-center justify-center relative">
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${hasVideo ? "block" : "hidden"}`} />
                <audio ref={audioRef} autoPlay />
                
                {!hasVideo && (
                  <>
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 bg-primary rounded-full animate-ping opacity-20 ${isConnected ? "" : "hidden"}`}></div>
                      <div className={`absolute inset-2 bg-primary rounded-full animate-pulse opacity-40 ${isConnected ? "" : "hidden"}`}></div>
                      <button 
                        onClick={handlePlayPause}
                        disabled={!isConnected}
                        className="relative w-24 h-24 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPlaying ? (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                            <path d="M5 3l14 9-14 9V3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {isConnecting ? "Подключение..." : isConnected ? "Аудиопоток" : "Ожидание вещания"}
                    </h2>
                    <p className="text-gray-400">
                      {isConnecting ? "Подключаемся к стриму..." : isConnected ? (isPlaying ? "Воспроизведение..." : "Нажмите play") : "Вещатель скоро начнет трансляцию"}
                    </p>
                  </>
                )}
                
                {isConnected && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">LIVE</div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePlayPause}
                    disabled={!isConnected}
                    className="w-12 h-12 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex items-center gap-3 flex-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <input
                      type="range" min="0" max="100" value={volume}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-sm text-gray-600 w-8">{volume}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Текущий трек</h3>
                      <p className="text-sm text-gray-600">{hasVideo ? "Видеопоток" : currentTrackName}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {isConnected ? "Активен" : "Неактивен"}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${hasVideo ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {hasVideo ? "Видео" : "Аудио"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Инфо:</strong> Плеер автоматически переключается в режим видео, 
                когда вещатель включает видеостриминг.
              </p>
            </div>
          </div>

          {/* 🔹 Боковая панель: ЧАТ (СИМУЛЯЦИЯ) */}
          <div className="space-y-6">
            
            {/* 🔥 Чат */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Чат</h3>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                  {messages.length} сообщений
                </span>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const currentUserId = getUserId();
                  const isOwnMessage = msg.userId === currentUserId;
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                        isOwnMessage 
                          ? "bg-primary text-white rounded-br-md" 
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{msg.authorLogin}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{formatTime(msg.createdAtUtc)}</span>
                        {msg.status !== "New" && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(msg.status)}`}>
                            {msg.status === "InProgress" ? "В работе" : "✓"}
                          </span>
                        )}
                      </div>
                      {/* Кнопки статуса для админов (только для чужих сообщений) */}
                      {!isOwnMessage && msg.status === "New" && (
                        <div className="flex gap-1 mt-1">
                          <button 
                            onClick={() => handleUpdateStatus(msg.id, "InProgress")}
                            className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            В работу
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(msg.id, "Completed")}
                            className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            ✓
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Ввод сообщения */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Напишите сообщение..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 🔹 Голосовое сообщение */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <h3 className="font-semibold text-gray-900">Голосовое сообщение</h3>
              </div>
              
              <button
                onClick={handleRecording}
                className={`w-full px-4 py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                {isRecording ? "Остановить запись" : "Начать запись"}
              </button>
              
              <p className="mt-3 text-xs text-gray-500 text-center">
                Нажмите на микрофон для записи голосового сообщения (макс. 60 секунд)
              </p>
            </div>

            {/* 🔹 Подсказки */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Как взаимодействовать</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600">Пишите сообщения в чат — они появляются мгновенно (симуляция)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600">Записывайте голосовые сообщения для более личного общения</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600">Наслаждайтесь аудио и видео в прямом эфире</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}