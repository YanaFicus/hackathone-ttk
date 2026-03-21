// ✅ FIX: именованный импорт, React не нужен для JSX в React 17+
import { type FC } from 'react';

// 🔥 FIX: выносим тип статуса для переиспользования
export type MessageStatus = 'new' | 'in-progress' | 'completed';

export interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  status: MessageStatus;
  isVoice: boolean;
}

// 🔥 FIX: отдельный тип для архивных сообщений (не все поля обязательны)
export interface ArchivedMessage {
  id: number;
  user: string;
  text: string;
  time: string;
}

interface AudienceMessagesProps {
  messages: Message[];
  archivedMessages: ArchivedMessage[]; // ✅ FIX: правильный тип
  showArchive: boolean;
  onToggleArchive: () => void;
  // ✅ FIX: строгий тип вместо string
  onStatusChange: (id: number, status: MessageStatus) => void;
}

// ✅ FIX: FC вместо React.FC (или просто функция)
export const AudienceMessages: FC<AudienceMessagesProps> = ({
  messages,
  archivedMessages,
  showArchive,
  onToggleArchive,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className="text-[16px] font-semibold text-gray-900">Сообщения аудитории</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            {messages.length} Активны
          </span>
          <button
            onClick={onToggleArchive}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={showArchive ? 'Скрыть архив' : 'Показать архив'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{message.user}</span>
                {message.isVoice && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">Голос</span>
                )}
              </div>
              <span className="text-xs text-gray-500">{message.time}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{message.text}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {/* ✅ FIX: тип статусов теперь строгий */}
                <button
                  onClick={() => onStatusChange(message.id, 'in-progress')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    message.status === 'in-progress' 
                      ? 'bg-yellow-200 text-yellow-800' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  В процессе
                </button>
                <button
                  onClick={() => onStatusChange(message.id, 'completed')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    message.status === 'completed' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Завершено
                </button>
              </div>
              {message.status === 'new' && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Новые
                </span>
              )}
              {message.status === 'in-progress' && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  В процессе
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {showArchive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Архив ({archivedMessages.length})
          </h3>
          <div className="space-y-2">
            {archivedMessages.map((msg) => (
              <div key={msg.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{msg.user}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="text-gray-600">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};