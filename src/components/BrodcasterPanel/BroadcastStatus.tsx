import React from 'react';

interface BroadcastStatusProps {
  isBroadcasting: boolean;
  isLoading: boolean;
  currentTrack: { key: string; duration_sec: number } | null;
  position: number;
  isMuted: boolean;
  onToggleBroadcast: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;  // Добавлен onStop
  onNext: () => void;
  onPrevious: () => void;
  onToggleMute: () => void;
  onClearQueue: () => void;
  onSeek: (position: number) => void;
  formatDuration: (sec: number) => string;
  botState?: string;
}

export const BroadcastStatus: React.FC<BroadcastStatusProps> = ({
  isBroadcasting,
  isLoading,
  currentTrack,
  position,
  isMuted,
  onToggleBroadcast,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onToggleMute,
  onClearQueue,
  onSeek,
  formatDuration,
  botState,
}) => {
  const displayName = currentTrack?.key?.split('/').pop() || 'Неизвестный трек';

  const handleToggleWithStop = () => {
    onToggleBroadcast();
    if (isBroadcasting) {
      onStop();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Статус вещания</h2>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          isBroadcasting ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'
        }`}>
          {isLoading ? 'Загрузка...' : isBroadcasting ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      <button
        onClick={handleToggleWithStop}
        disabled={isLoading}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
          isBroadcasting ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          <circle cx="12" cy="12" r="3" opacity="0.5" />
        </svg>
        {isLoading ? 'Подключение...' : isBroadcasting ? 'Остановить вещание' : 'Начать вещание'}
      </button>

      {currentTrack && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2 truncate">
            🎵 Сейчас: {displayName}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onPrevious} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Предыдущий">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>
            <button
              onClick={botState === 'playing' ? onPause : onPlay}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              title={botState === 'playing' ? 'Пауза' : 'Воспроизвести'}
            >
              {botState === 'playing' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <button onClick={onNext} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Следующий">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-lg ${isMuted ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-100'}`}
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            <button onClick={onClearQueue} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg ml-auto" title="Очистить очередь">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
          <div className="mt-3">
            <input
              type="range"
              min="0"
              max={currentTrack.duration_sec || 100}
              value={position}
              onChange={(e) => onSeek(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatDuration(position)}</span>
              <span>{formatDuration(currentTrack.duration_sec)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};