import React from 'react';

interface VideoBroadcastProps {
  isVideoEnabled: boolean;
  onToggleVideo: () => void;
}

export const VideoBroadcast: React.FC<VideoBroadcastProps> = ({ isVideoEnabled, onToggleVideo }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Видеовещание</h2>
      <button
        onClick={onToggleVideo}
        className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mb-4 ${
          isVideoEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        {isVideoEnabled ? 'Видео включено' : 'Включить видео'}
      </button>
      {isVideoEnabled && (
        <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="mb-3">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p className="text-white font-medium">Предпросмотр камеры активен</p>
          <p className="text-gray-400 text-sm mt-1">Требуется доступ к камере и микрофону</p>
        </div>
      )}
    </div>
  );
};