import React from 'react';

interface AudioControlsProps {
  isRecording: boolean;
  isMuted: boolean;
  masterVolume: number;
  onToggleRecording: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isRecording,
  isMuted,
  masterVolume,
  onToggleRecording,
  onToggleMute,
  onVolumeChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Аудиоконтроль</h2>
      <div className={`p-4 rounded-xl mb-6 flex items-center gap-4 ${isRecording ? 'bg-red-50 border border-red-200' : 'bg-pink-50'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-pink-200'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{isRecording ? 'Запись живого аудио' : 'Запись с микрофона'}</h3>
          <p className="text-sm text-gray-600">Записывать в прямом эфире или добавить в плейлист</p>
        </div>
        <button
          onClick={onToggleRecording}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'
          }`}
        >
          {isRecording ? 'Остановить' : 'Записать'}
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Общая громкость</label>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded ${isMuted ? 'text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
            title="Мастер Звука"
          />
          <span className="text-sm text-gray-600 w-8 text-right">{masterVolume}</span>
        </div>
      </div>
    </div>
  );
};