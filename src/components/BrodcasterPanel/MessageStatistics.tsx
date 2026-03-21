import React from 'react';

interface MessageStatisticsProps {
  newCount: number;
  inProgressCount: number;
  completedCount: number;
}

export const MessageStatistics: React.FC<MessageStatisticsProps> = ({
  newCount,
  inProgressCount,
  completedCount,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Статистика сообщений</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{newCount}</div>
          <div className="text-xs text-blue-700 mt-1">Новые</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-xl">
          <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
          <div className="text-xs text-yellow-700 mt-1">В процессе</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-xs text-green-700 mt-1">Завершены</div>
        </div>
      </div>
    </div>
  );
};