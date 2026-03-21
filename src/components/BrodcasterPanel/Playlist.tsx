import React from 'react';

interface PlaylistTrack {
  id: number;
  key: string;
  name: string;
  duration: string;
}

interface PlaylistProps {
  tracks: PlaylistTrack[];
  currentTrackKey?: string;
  isLoop: boolean;
  isShuffle: boolean;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

export const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  currentTrackKey,
  isLoop,
  isShuffle,
  onToggleLoop,
  onToggleShuffle,
  onRemove,
  onClear,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Плейлист</h2>
        {tracks.length > 0 && (
          <button onClick={onClear} className="text-sm text-red-600 hover:text-red-700 font-medium">
            Очистить всё
          </button>
        )}
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={onToggleLoop}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            isLoop ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          Зациклить
        </button>
        <button
          onClick={onToggleShuffle}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            isShuffle ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Перемешать
        </button>
      </div>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div
            key={track.key}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              currentTrackKey === track.key ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm text-gray-500 w-5 shrink-0">{index + 1}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
              <span className={`font-medium truncate ${currentTrackKey === track.key ? 'text-purple-700' : 'text-gray-900'}`}>
                {track.name}
              </span>
              {currentTrackKey === track.key && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full shrink-0">
                  играет
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-500">{track.duration}</span>
              <button
                onClick={() => onRemove(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Убрать из плейлиста"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {tracks.length === 0 && (
          <p className="text-center text-gray-500 py-4">Плейлист пуст — добавьте треки из медиатеки</p>
        )}
      </div>
    </div>
  );
};