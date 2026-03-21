import React, { useRef } from 'react';

interface MediaFile {
  id: number;
  key: string;
  name: string;
  size: string;
  duration: string;
  inPlaylist: boolean;
}

interface MediaLibraryProps {
  files: MediaFile[];
  isLoading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => Promise<void>;
  onDelete: (key: string) => void;
  onAddToPlaylist: (key: string) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  files,
  isLoading,
  uploadProgress,
  onUpload,
  onDelete,
  onAddToPlaylist,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      e.target.value = ''; // reset input
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Медиатека</h2>
        <button
          onClick={handleUploadClick}
          disabled={isLoading || uploadProgress > 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {uploadProgress > 0 ? `Загрузка ${uploadProgress}%` : 'Загрузить файлы'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Аудио: MP3, WAV, OGG (макс 50MB) • Видео: MP4, WebM (макс 1000MB)
      </p>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Загрузка библиотеки...</div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0">
                  <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                </svg>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size} • {file.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {file.inPlaylist ? (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">В плейлисте</span>
                ) : (
                  <button
                    onClick={() => onAddToPlaylist(file.key)}
                    className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    Добавить
                  </button>
                )}
                <button
                  onClick={() => onDelete(file.key)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && <p className="text-center text-gray-500 py-4">Нет файлов в библиотеке</p>}
        </div>
      )}
    </div>
  );
};