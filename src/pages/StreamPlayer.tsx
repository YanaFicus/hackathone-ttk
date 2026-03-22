/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useCreateLiveKitTokenMutation } from '../services/livekit/livekitApi';

const LIVEKIT_WS_URL = 'ws://95.174.104.223:7880';

export default function StreamPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('Прямой аудиопоток');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [createLiveKitToken] = useCreateLiveKitTokenMutation();

  // Подключение к LiveKit при загрузке страницы
  useEffect(() => {
    connectToStream();
    
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  const connectToStream = async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const tokenData = await createLiveKitToken({
        id: `viewer-${Date.now()}`,
        username: 'Viewer',
        role: 'user',
      }).unwrap();
      
      console.log('Viewer token received');
      
      const { Room, RoomEvent } = await import('livekit-client');
      
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to LiveKit room');
        setIsConnected(true);
        setIsConnecting(false);
        setIsPlaying(true);
      });
      
      newRoom.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit');
        setIsConnected(false);
        setIsPlaying(false);
        setRoom(null);
      });
      
      newRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
        console.log(`Track subscribed: ${track.kind} from ${participant.identity}`);
        
        if (track.kind === 'video') {
          setHasVideo(true);
          if (videoRef.current) {
            track.attach(videoRef.current);
          }
        }
        
        if (track.kind === 'audio') {
          if (audioRef.current) {
            track.attach(audioRef.current);
          }
        }
      });
      
      newRoom.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
        console.log(`Track unsubscribed: ${track.kind} from ${participant.identity}`);
        
        if (track.kind === 'video') {
          setHasVideo(false);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      });
      
      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`Participant connected: ${participant.identity}`);
        setCurrentTrackName(`Вещатель: ${participant.identity}`);
      });
      
      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log(`Participant disconnected: ${participant.identity}`);
        setCurrentTrackName('Вещатель отключился');
      });
      
      await newRoom.connect(LIVEKIT_WS_URL, tokenData.token);
      setRoom(newRoom);
      
    } catch (err) {
      console.error('Failed to connect to stream:', err);
      setIsConnecting(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      console.log('Отправка сообщения:', feedbackText);
      setFeedbackText('');
      alert('Сообщение отправлено вещателю!');
    }
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-primary"
            >
              <path 
                d="M5 3l14 9-14 9V3z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Аудиоплеер</h1>
            {isConnected && (
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Слушайте прямые эфиры и отправляйте обратную связь вещателям
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная часть: Плеер */}
          <div className="lg:col-span-2 space-y-6">
            {/* Окно плеера */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Шапка плеера */}
              <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isConnected ? 'Прямой эфир' : 'Ожидание подключения'}
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

              {/* Центральная часть: Видео/Аудио визуализация */}
              <div className="bg-slate-900 aspect-video flex flex-col items-center justify-center relative">
                {/* Видео элемент */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
                />
                
                {/* Аудио элемент (скрытый) */}
                <audio ref={audioRef} autoPlay />
                
                {/* Заглушка когда нет видео */}
                {!hasVideo && (
                  <>
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 bg-primary rounded-full animate-ping opacity-20 ${isConnected ? '' : 'hidden'}`}></div>
                      <div className={`absolute inset-2 bg-primary rounded-full animate-pulse opacity-40 ${isConnected ? '' : 'hidden'}`}></div>
                      <button 
                        onClick={handlePlayPause}
                        disabled={!isConnected}
                        className="relative w-24 h-24 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPlaying ? (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                            <path d="M5 3l14 9-14 9V3z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-2">
                      {isConnecting ? 'Подключение...' : isConnected ? 'Аудиопоток' : 'Ожидание вещания'}
                    </h2>
                    <p className="text-gray-400">
                      {isConnecting 
                        ? 'Подключаемся к стриму...' 
                        : isConnected 
                          ? (isPlaying ? 'Воспроизведение...' : 'Нажмите play для начала')
                          : 'Вещатель скоро начнет трансляцию'}
                    </p>
                  </>
                )}
                
                {/* Индикатор Live */}
                {isConnected && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
                    LIVE
                  </div>
                )}
              </div>

              {/* Контролы плеера */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {/* Кнопка Play/Pause */}
                  <button 
                    onClick={handlePlayPause}
                    disabled={!isConnected}
                    className="w-12 h-12 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                  </button>

                  {/* Контроль звука */}
                  <div className="flex items-center gap-3 flex-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
                      title="Volume"
                    />
                    <span className="text-sm text-gray-600 w-8">{volume}%</span>
                  </div>
                </div>

                {/* Информация о треке */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Текущий трек</h3>
                      <p className="text-sm text-gray-600">
                        {hasVideo ? 'Видеопоток' : currentTrackName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        isConnected 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isConnected ? 'Активен' : 'Неактивен'}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        hasVideo 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {hasVideo ? 'Видео' : 'Аудио'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info блок */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Инфо:</strong> Плеер автоматически переключается в режим видео, 
                когда вещатель включает видеостриминг или добавляет видеофайлы в плейлист.
              </p>
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Отправка feedback */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Отправить отзыв</h3>
              </div>
              
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Введите ваше сообщение для вещателя..."
                className="w-full h-28 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm"
              />
              
              <button
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim()}
                className="w-full mt-4 px-4 py-2.5 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Отправить сообщение
              </button>
            </div>

            {/* Голосовое сообщение */}
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
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                {isRecording ? 'Остановить запись' : 'Начать запись'}
              </button>
              
              <p className="mt-3 text-xs text-gray-500 text-center">
                Нажмите на микрофон для записи голосового сообщения (макс. 60 секунд)
              </p>
            </div>

            {/* Как взаимодействовать */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Как взаимодействовать</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600">
                    Отправляйте текстовые сообщения вещателю
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600">
                    Записывайте и отправляйте голосовые сообщения
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600">
                    Наслаждайтесь прямыми аудио и видеопотоками
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}