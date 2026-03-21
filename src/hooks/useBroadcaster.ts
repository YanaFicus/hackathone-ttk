import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useGetBotInfoQuery,
  useGetLibraryQuery,
  useAddToQueueMutation,
  useRemoveFromQueueMutation,
  useClearQueueMutation,
  usePlayerPlayMutation,
  usePlayerPauseMutation,
  usePlayerStopMutation,
  usePlayerNextMutation,
  usePlayerPreviousMutation,
  usePlayerSetMuteMutation,
  usePlayerSetRepeatModeMutation,
  usePlayerSetPositionMutation,
  useGetUploadIntentMutation,
  useConfirmUploadMutation,
  useDeleteFromLibraryMutation,
  useCreateLiveKitTokenMutation,
} from '../services/livekit/livekitApi';
import type { TrackItem, RepeatMode, MediaFile as ApiMediaFile } from '../services/livekit/types';
import { uploadToS3, connectToLiveKit } from '../utils/livekit';
import { getUserId } from '../utils/auth';

const LIVEKIT_WS_URL = 'ws://95.174.104.223:7880';

export const useBroadcaster = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [liveKitWs, setLiveKitWs] = useState<WebSocket | null>(null);
  const userId = useMemo(() => getUserId() || '', []);

  const {
    data: botInfo,
    isLoading: botInfoLoading,
    refetch: refetchBotInfo,
    error: botInfoError,
  } = useGetBotInfoQuery(undefined, { pollingInterval: 5000 });

  const {
    data: libraryData,
    isLoading: libraryLoading,
    refetch: refetchLibrary,
  } = useGetLibraryQuery(userId ? { user_id: userId, limit: 50 } : { user_id: '', limit: 50 }, { skip: !userId });

  const [addToQueue] = useAddToQueueMutation();
  const [removeFromQueue] = useRemoveFromQueueMutation();
  const [clearQueue] = useClearQueueMutation();
  const [playerPlay] = usePlayerPlayMutation();
  const [playerPause] = usePlayerPauseMutation();
  const [playerStop] = usePlayerStopMutation();
  const [playerNext] = usePlayerNextMutation();
  const [playerPrevious] = usePlayerPreviousMutation();
  const [playerSetMute] = usePlayerSetMuteMutation();
  const [playerSetRepeatMode] = usePlayerSetRepeatModeMutation();
  const [playerSetPosition] = usePlayerSetPositionMutation();
  const [getUploadIntent] = useGetUploadIntentMutation();
  const [confirmUpload] = useConfirmUploadMutation();
  const [deleteFromLibrary] = useDeleteFromLibraryMutation();
  const [createLiveKitToken] = useCreateLiveKitTokenMutation();

  const isBroadcasting = botInfo?.state === 'playing';
  const currentTrack = botInfo?.current;
  const isMuted = botInfo?.is_muted;
  const repeatMode = botInfo?.repeat_mode;
  const isLoop = useMemo(() => repeatMode && repeatMode !== 'off', [repeatMode]);

  const mediaFiles = useMemo(() => {
    if (!libraryData?.data) return [];
    
    return libraryData.data.map((file: ApiMediaFile, idx: number) => {
      const inPlaylist = botInfo?.queue?.some((track: TrackItem) => {
        return track.src === file.src;
      }) ?? false;
      
      return {
        id: idx + 1,
        key: file.src,
        name: file.filename,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        duration: formatDuration(file.duration),
        inPlaylist,
        src: file.src,
        filename: file.filename,
        content_type: file.content_type,
        url: file.url,
      };
    });
  }, [libraryData?.data, botInfo?.queue]);

  const playlist = useMemo(() => {
    if (!botInfo?.queue || !Array.isArray(botInfo.queue)) return [];
    
    return botInfo.queue.map((track: TrackItem, idx: number) => {
      const displayName = track.filename || track.src?.split('/').pop() || `Track ${idx + 1}`;
      
      return {
        id: idx + 1,
        key: track.src,
        name: displayName,
        duration: formatDuration(track.duration),
        kind: track.content_type?.startsWith('video/') ? 'video' : 'audio',
        filename: track.filename,
        src: track.src,
        url: track.url,
      };
    });
  }, [botInfo?.queue]);

  const handleAddToPlaylist = useCallback(async (src: string) => {
    try {
      await addToQueue([src]).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error('Add to queue failed:', err);
    }
  }, [addToQueue, refetchBotInfo]);

  const handleRemoveFromPlaylist = useCallback(async (index: number) => {
    try {
      await removeFromQueue({ index }).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error('Remove failed:', err);
    }
  }, [removeFromQueue, refetchBotInfo]);

  const handleClearQueue = useCallback(async () => {
    if (!confirm('Очистить плейлист?')) return;
    try {
      await clearQueue().unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error('Clear failed:', err);
    }
  }, [clearQueue, refetchBotInfo]);

  const handleToggleBroadcast = useCallback(async () => {
    if (isBroadcasting) {
      await playerStop().unwrap();
    } else {
      try {
        const tokenData = await createLiveKitToken({
          id: `broadcaster-${Date.now()}`,
          username: 'Broadcaster',
          role: 'Leading',
        }).unwrap();
        
        const ws = await connectToLiveKit(tokenData.token, 'main-broadcast', LIVEKIT_WS_URL);
        ws.onopen = () => {
          playerPlay().unwrap();
          setLiveKitWs(ws);
        };
        ws.onerror = (err) => console.error('LiveKit error:', err);
      } catch (err) {
        console.error('Failed to start broadcast:', err);
        alert('Не удалось начать вещание');
      }
    }
  }, [isBroadcasting, createLiveKitToken, playerPlay, playerStop]);

  const handleFileUpload = useCallback(async (file: File): Promise<void> => {
    if (!userId) {
      alert('Ошибка: пользователь не авторизован');
      return;
    }
    
    try {
      const intent = await getUploadIntent({
        user_id: userId,
        content_type: file.type,
        filename: file.name,
        size: file.size,
      }).unwrap();
      
      setUploadProgress(0);
      await uploadToS3(file, intent.url, intent.fields, (progress) => setUploadProgress(progress));
      
      await confirmUpload({ key: intent.fields.key }).unwrap();
      await refetchLibrary();
      alert(`Файл "${file.name}" успешно загружен!`);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Ошибка загрузки файла');
    } finally {
      setUploadProgress(0);
    }
  }, [getUploadIntent, confirmUpload, refetchLibrary, userId]);

  const handleDeleteFile = useCallback(async (key: string) => {
    if (!confirm('Удалить этот файл?')) return;
    try {
      await deleteFromLibrary({ key }).unwrap();
      refetchLibrary();
      refetchBotInfo();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Не удалось удалить');
    }
  }, [deleteFromLibrary, refetchLibrary, refetchBotInfo]);

  const handlePlay = useCallback(async () => {
    await playerPlay().unwrap();
    await refetchBotInfo();
  }, [playerPlay, refetchBotInfo]);

  const handlePause = useCallback(async () => {
    await playerPause().unwrap();
    await refetchBotInfo();
  }, [playerPause, refetchBotInfo]);

  const handleStop = useCallback(async () => {
    await playerStop().unwrap();
    await refetchBotInfo();
  }, [playerStop, refetchBotInfo]);

  const handleNext = useCallback(async () => {
    await playerNext().unwrap();
    await refetchBotInfo();
  }, [playerNext, refetchBotInfo]);

  const handlePrevious = useCallback(async () => {
    await playerPrevious().unwrap();
    await refetchBotInfo();
  }, [playerPrevious, refetchBotInfo]);

  const handleToggleLoop = useCallback(async () => {
    const newMode: RepeatMode = isLoop ? 'off' : 'playlist';
    try {
      await playerSetRepeatMode({ mode: newMode }).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error('Set repeat mode failed:', err);
    }
  }, [isLoop, playerSetRepeatMode, refetchBotInfo]);

  const handleToggleMute = useCallback(async () => {
    try {
      await playerSetMute({ muted: !isMuted }).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error('Mute failed:', err);
    }
  }, [isMuted, playerSetMute, refetchBotInfo]);

  const handleSeek = useCallback(async (positionSec: number) => {
    try {
      await playerSetPosition({ position_sec: positionSec }).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error('Seek failed:', err);
    }
  }, [playerSetPosition, refetchBotInfo]);

  const handleToggleVideo = useCallback(async () => {
    if (!isVideoEnabled) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setIsVideoEnabled(true);
      } catch {
        alert('Не удалось получить доступ к камере');
      }
    } else {
      setIsVideoEnabled(false);
    }
  }, [isVideoEnabled]);

  useEffect(() => {
    return () => {
      if (liveKitWs) {
        liveKitWs.close();
      }
    };
  }, [liveKitWs]);

  return {
    isBroadcasting,
    isRecording,
    setIsRecording,
    isVideoEnabled,
    masterVolume,
    setMasterVolume,
    isLoop,
    isShuffle,
    setIsShuffle,
    showArchive,
    setShowArchive,
    uploadProgress,
    botInfoLoading,
    libraryLoading,
    botInfoError,
    botInfo,
    currentTrack,
    isMuted,
    repeatMode,
    mediaFiles,
    playlist,
    handleToggleBroadcast,
    handleFileUpload,
    handleDeleteFile,
    handleAddToPlaylist,
    handleRemoveFromPlaylist,
    handleClearQueue,
    handlePlay,
    handlePause,
    handleStop,
    handleNext,
    handlePrevious,
    handleToggleLoop,
    handleToggleMute,
    handleSeek,
    handleToggleVideo,
    formatDuration,
  };
};

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}