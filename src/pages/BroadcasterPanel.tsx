import { useState, useMemo } from 'react';
import Header from '../components/Header';
import { useBroadcaster } from '../hooks/useBroadcaster';
import { BroadcastStatus } from '../components/BrodcasterPanel/BroadcastStatus';
import { MediaLibrary } from '../components/BrodcasterPanel/MediaLibrary';
import { Playlist } from '../components/BrodcasterPanel/Playlist';
import { AudioControls } from '../components/BrodcasterPanel/AudioControls';
import { VideoBroadcast } from '../components/BrodcasterPanel/VideoBroadcast';
import { AudienceMessages } from '../components/BrodcasterPanel/AudienceMessages';
import { MessageStatistics } from '../components/BrodcasterPanel/MessageStatistics';

export type MessageStatus = 'new' | 'in-progress' | 'completed';

export interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  status: MessageStatus;
  isVoice: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: 1, user: 'user', text: 'Great music! Can you play some jazz next?', time: '2024-03-21 10:30', status: 'new', isVoice: false },
  { id: 2, user: 'alexsmith', text: 'Voice message recording...', time: '2024-03-21 10:35', status: 'in-progress', isVoice: true },
  { id: 3, user: 'user', text: 'Love the show! Keep it up!', time: '2024-03-21 10:40', status: 'new', isVoice: false },
];

const ARCHIVED_MESSAGES: Message[] = [
  { id: 4, user: 'broadcaster2', text: 'Testing the feedback system', time: '2024-03-21 10:25', status: 'completed', isVoice: false },
];

export default function BroadcasterPanel() {
  const broadcaster = useBroadcaster();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const handleMessageStatus = (id: number, status: MessageStatus) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const { newCount, inProgressCount, completedCount } = useMemo(() => ({
    newCount: messages.filter(m => m.status === 'new').length,
    inProgressCount: messages.filter(m => m.status === 'in-progress').length,
    completedCount: messages.filter(m => m.status === 'completed').length,
  }), [messages]);

  const currentTrackForUI = useMemo(() => {
    const track = broadcaster.currentTrack;
    if (!track) return null;
    return {
      key: track.src,
      duration_sec: track.duration,
    };
  }, [broadcaster.currentTrack]);

  const isMuted = broadcaster.isMuted ?? false;
  const isBroadcasting = broadcaster.isBroadcasting ?? false;
  const isLoop = broadcaster.isLoop ?? false;
  const isShuffle = broadcaster.isShuffle ?? false;
  const isVideoEnabled = broadcaster.isVideoEnabled ?? false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-purple-600">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor" />
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Панель управления вещателя</h1>
          </div>
          <p className="text-gray-600">Управляйте своими трансляциями, плейлистами и сообщениями аудитории</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BroadcastStatus
              isBroadcasting={isBroadcasting}
              isLoading={broadcaster.botInfoLoading}
              currentTrack={currentTrackForUI}
              position={broadcaster.botInfo?.position ?? 0}
              isMuted={isMuted}
              botState={broadcaster.botInfo?.state}
              onToggleBroadcast={broadcaster.handleToggleBroadcast}
              onPlay={broadcaster.handlePlay}
              onPause={broadcaster.handlePause}
              onStop={broadcaster.handleStop}
              onNext={broadcaster.handleNext}
              onPrevious={broadcaster.handlePrevious}
              onToggleMute={broadcaster.handleToggleMute}
              onClearQueue={broadcaster.handleClearQueue}
              onSeek={broadcaster.handleSeek}
              formatDuration={broadcaster.formatDuration}
            />

            <MediaLibrary
              files={broadcaster.mediaFiles}
              isLoading={broadcaster.libraryLoading}
              uploadProgress={broadcaster.uploadProgress}
              onUpload={broadcaster.handleFileUpload}
              onDelete={broadcaster.handleDeleteFile}
              onAddToPlaylist={broadcaster.handleAddToPlaylist}
            />

            <Playlist
              tracks={broadcaster.playlist}
              currentTrackKey={currentTrackForUI?.key}
              isLoop={isLoop}
              isShuffle={isShuffle}
              onToggleLoop={broadcaster.handleToggleLoop}
              onToggleShuffle={() => broadcaster.setIsShuffle(!isShuffle)}
              onRemove={broadcaster.handleRemoveFromPlaylist}
              onClear={broadcaster.handleClearQueue}
            />

            <AudioControls
              isRecording={broadcaster.isRecording}
              isMuted={isMuted}
              masterVolume={broadcaster.masterVolume}
              onToggleRecording={() => broadcaster.setIsRecording(!broadcaster.isRecording)}
              onToggleMute={broadcaster.handleToggleMute}
              onVolumeChange={broadcaster.setMasterVolume}
            />

            <VideoBroadcast
              isVideoEnabled={isVideoEnabled}
              onToggleVideo={broadcaster.handleToggleVideo}
            />
          </div>

          <div className="space-y-6">
            <AudienceMessages
              messages={messages}
              archivedMessages={ARCHIVED_MESSAGES}
              showArchive={broadcaster.showArchive}
              onToggleArchive={() => broadcaster.setShowArchive(!broadcaster.showArchive)}
              onStatusChange={handleMessageStatus}
            />
            <MessageStatistics
              newCount={newCount}
              inProgressCount={inProgressCount}
              completedCount={completedCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
}