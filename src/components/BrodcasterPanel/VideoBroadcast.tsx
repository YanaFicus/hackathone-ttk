import React, { useRef, useEffect } from 'react';

interface VideoBroadcastProps {
  isVideoEnabled: boolean;
  isBroadcasting: boolean;
  localStream: MediaStream | null;
  onToggleVideo: () => Promise<void>;
}

export const VideoBroadcast: React.FC<VideoBroadcastProps> = ({
  isVideoEnabled,
  isBroadcasting,
  localStream,
  onToggleVideo,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
      console.log('Local preview active');
    }
  }, [localStream]);

  const handleToggleVideo = async () => {
    await onToggleVideo();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Видеовещание</h2>
        {isBroadcasting && isVideoEnabled && (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full animate-pulse">
            📹 LIVE
          </span>
        )}
        {isBroadcasting && !isVideoEnabled && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            🎙️ Только аудио
          </span>
        )}
      </div>

      <button
        onClick={handleToggleVideo}
        className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mb-4 ${
          isVideoEnabled
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        {isVideoEnabled ? 'Выключить видео' : 'Включить видео'}
      </button>

      {isVideoEnabled && (
        <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!localStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="mb-3">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p className="text-white font-medium">Запрос доступа к камере...</p>
              <p className="text-gray-400 text-sm mt-1">Разрешите доступ к камере и микрофону</p>
            </div>
          )}
          {localStream && isBroadcasting && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              📡 Трансляция активна
            </div>
          )}
        </div>
      )}

      {!isVideoEnabled && (
        <div className="aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-gray-400">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p className="text-gray-500">Видео отключено</p>
          <p className="text-gray-400 text-sm mt-1">
            {isBroadcasting ? 'Аудио продолжает транслироваться' : 'Нажмите "Включить видео" для начала трансляции'}
          </p>
        </div>
      )}

      {isVideoEnabled && localStream && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {isBroadcasting ? 'Видео транслируется в эфир' : 'Предпросмотр видео'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {localStream.getVideoTracks()[0]?.label || 'Камера'} • 
            {localStream.getAudioTracks()[0]?.label || 'Микрофон'}
          </p>
        </div>
      )}
    </div>
  );
};