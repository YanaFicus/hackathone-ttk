import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
} from "../services/livekit/livekitApi";
import type {
  Room,
  LocalTrackPublication,
  LocalVideoTrack,
  LocalAudioTrack,
} from "livekit-client";
import { Track, createLocalVideoTrack } from "livekit-client";
import type {
  TrackItem,
  RepeatMode,
  MediaFile as ApiMediaFile,
} from "../services/livekit/types";
import { uploadToS3 } from "../utils/livekit";
import { getUserId } from "../utils/auth";

const LIVEKIT_WS_URL = "ws://95.174.104.223:7880";

export const useBroadcaster = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [publishedTracks, setPublishedTracks] = useState<
    LocalTrackPublication[]
  >([]);

  // Рефы для доступа к актуальным значениям внутри асинхронных колбэков
  const liveKitRoomRef = useRef<Room | null>(null);
  const isConnectedRef = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isVideoEnabledRef = useRef(false);
  const publishedTracksRef = useRef<LocalTrackPublication[]>([]);

  const userId = useMemo(() => getUserId() || "", []);

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
  } = useGetLibraryQuery(
    userId ? { user_id: userId, limit: 50 } : { user_id: "", limit: 50 },
    { skip: !userId },
  );

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

   const [isBroadcasting, setIsBroadcasting] = useState(false);
  const currentTrack = botInfo?.current;
  const isMuted = botInfo?.is_muted;
  const repeatMode = botInfo?.repeat_mode;
  const isLoop = useMemo(
    () => repeatMode && repeatMode !== "off",
    [repeatMode],
  );

  const mediaFiles = useMemo(() => {
    if (!libraryData?.data) return [];
    return libraryData.data.map((file: ApiMediaFile, idx: number) => {
      const inPlaylist =
        botInfo?.queue?.some((track: TrackItem) => track.src === file.src) ??
        false;
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
      const displayName =
        track.filename || track.src?.split("/").pop() || `Track ${idx + 1}`;
      return {
        id: idx + 1,
        key: track.src,
        name: displayName,
        duration: formatDuration(track.duration),
        kind: track.content_type?.startsWith("video/") ? "video" : "audio",
        filename: track.filename,
        src: track.src,
        url: track.url,
      };
    });
  }, [botInfo?.queue]);

  const publishVideoTrack = useCallback(async () => {
    const room = liveKitRoomRef.current;
    const connected = isConnectedRef.current;

    if (!room || !connected || !isVideoEnabledRef.current) return;

    const existingVideoPub = publishedTracksRef.current.find(
      (p) => p.track?.kind === "video",
    );
    if (existingVideoPub) return existingVideoPub;

    try {
      const localVideoTrack = await createLocalVideoTrack({
        facingMode: "user",
      });

      const publication = await room.localParticipant.publishTrack(
        localVideoTrack,
        {
          source: Track.Source.Camera,
          name: "camera",
          videoEncoding: {
            maxBitrate: 2_000_000,
            maxFramerate: 30,
          },
        },
      );

      const updated = [...publishedTracksRef.current, publication];
      setPublishedTracks(updated);
      publishedTracksRef.current = updated;

      return publication;
    } catch (err) {
      console.error("Failed to publish video track:", err);
      throw err;
    }
  }, []);

  const handleToggleRecording = useCallback(async () => {
    const room = liveKitRoomRef.current;
    const connected = isConnectedRef.current;

    if (!room || !connected) return;

    try {
      if (!isRecording) {
        const publication = await room.localParticipant.setMicrophoneEnabled(
          true,
          {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          {
            source: Track.Source.Microphone,
            name: "microphone",
            dtx: true,
            red: false,
          },
        );

        if (publication) {
          const exists = publishedTracksRef.current.some(
            (p) => p.trackSid === publication.trackSid,
          );

          if (!exists) {
            const updated = [...publishedTracksRef.current, publication];
            setPublishedTracks(updated);
            publishedTracksRef.current = updated;
          }
        }

        setIsRecording(true);
      } else {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsRecording(false);
      }
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
      alert("Не удалось включить микрофон: " + (err as Error).message);
    }
  }, [isRecording]);

  const unpublishTracks = useCallback(async () => {
    const room = liveKitRoomRef.current;
    const connected = isConnectedRef.current;
    const tracks = publishedTracksRef.current;

    if (!room || !connected || !tracks.length) return;

    try {
      for (const publication of tracks) {
        if (publication.track) {
          await room.localParticipant.unpublishTrack(publication.track, true);
        }
      }

      setPublishedTracks([]);
      publishedTracksRef.current = [];
    } catch (err) {
      console.error("Failed to unpublish tracks:", err);
    }
  }, []);

  const handleAddToPlaylist = useCallback(
    async (src: string) => {
      try {
        await addToQueue([src]).unwrap();
        await refetchBotInfo();
      } catch (err) {
        console.error("Add to queue failed:", err);
      }
    },
    [addToQueue, refetchBotInfo],
  );

  const handleRemoveFromPlaylist = useCallback(
    async (index: number) => {
      try {
        await removeFromQueue({ index }).unwrap();
        await refetchBotInfo();
      } catch (err) {
        console.error("Remove failed:", err);
      }
    },
    [removeFromQueue, refetchBotInfo],
  );

  const handleClearQueue = useCallback(async () => {
    if (!confirm("Очистить плейлист?")) return;
    try {
      await clearQueue().unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error("Clear failed:", err);
    }
  }, [clearQueue, refetchBotInfo]);

  const handleToggleBroadcast = useCallback(async () => {
  if (isBroadcasting) {
    // === 🔴 ОСТАНОВКА ===
    await playerStop().unwrap();

      if (liveKitRoomRef.current) {
        try {
          await liveKitRoomRef.current.localParticipant.setMicrophoneEnabled(
            false,
          );
        } catch (err) {
          console.error("Failed to disable mic:", err);
        }

        await unpublishTracks();
        liveKitRoomRef.current.disconnect();
      }

      setLiveKitRoom(null);
      liveKitRoomRef.current = null;
      setIsConnected(false);
      isConnectedRef.current = false;
      setIsRecording(false);

    // Останавливаем локальные треки
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      if (localStreamRef.current) localStreamRef.current = null;
    }
    
    setIsBroadcasting(false);
    
  } else {
    // === 🟢 ЗАПУСК ===
    try {
      // 🔥 FIX: получаем userId ЗДЕСЬ, где он нужен
      const realUserId = getUserId();
      
      if (!realUserId) {
        alert('Пользователь не авторизован');
        return;
      }

      const tokenData = await createLiveKitToken({
        id: realUserId,
        username: "Broadcaster",
        role: "Leading",
      }).unwrap();

      const { Room, RoomEvent } = await import("livekit-client");
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.Connected, async () => {
        console.log("✅ Connected to LiveKit room:", room.name);
        setIsConnected(true);
        setLiveKitRoom(room);
        if (liveKitRoomRef.current) liveKitRoomRef.current = room;
        if (isConnectedRef.current) isConnectedRef.current = true;

          try {
            if (isVideoEnabledRef.current) {
              await publishVideoTrack();
            }
          } catch (err) {
            console.error("Failed to publish video after connect:", err);
          }

        await playerPlay().unwrap();
        // 🔥 FIX: устанавливаем isBroadcasting только после успешного подключения
        setIsBroadcasting(true);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("❌ Disconnected from LiveKit");
        setIsConnected(false);
        setLiveKitRoom(null);
        setPublishedTracks([]);
        if (publishedTracksRef.current) publishedTracksRef.current = [];
        setIsBroadcasting(false);
      });

      room.on(
        RoomEvent.TrackSubscribed,
        (track, _publication, participant) => {
          console.log(
            `📥 Track subscribed: ${track.kind} from ${participant.identity}`,
          );
          if (track.kind === "video") {
            const element = track.attach();
            const videoContainer = document.getElementById("remote-video");
            if (videoContainer) {
              videoContainer.innerHTML = "";
              videoContainer.appendChild(element);
            }
          }
        },
      );

      await room.connect(LIVEKIT_WS_URL, tokenData.token);
      
    } catch (err) {
      console.error("❌ Failed to start broadcast:", err);
      alert("Не удалось начать вещание: " + (err as Error).message);

        // Cleanup при ошибке
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
          setLocalStream(null);
        }
      }
    }
  }, [
    isBroadcasting,
    createLiveKitToken,
    playerPlay,
    playerStop,
    unpublishTracks,
    liveKitRoom,
    localStream,
  ]);

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      if (!userId) {
        alert("Ошибка: пользователь не авторизован");
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
        await uploadToS3(file, intent.url, intent.fields, (progress) =>
          setUploadProgress(progress),
        );
        await confirmUpload({ key: intent.fields.key }).unwrap();
        await refetchLibrary();
        alert(`Файл "${file.name}" успешно загружен!`);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Ошибка загрузки файла");
      } finally {
        setUploadProgress(0);
      }
    },
    [getUploadIntent, confirmUpload, refetchLibrary, userId],
  );

  const handleDeleteFile = useCallback(
    async (key: string) => {
      if (!confirm("Удалить этот файл?")) return;
      try {
        await deleteFromLibrary({ key }).unwrap();
        refetchLibrary();
        refetchBotInfo();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Не удалось удалить");
      }
    },
    [deleteFromLibrary, refetchLibrary, refetchBotInfo],
  );

  const handlePlay = useCallback(async () => {
    await playerPlay().unwrap();
    await refetchBotInfo();
  }, [playerPlay, refetchBotInfo]);

  const handlePause = useCallback(async () => {
    await playerPause({}).unwrap();
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
    const newMode: RepeatMode = isLoop ? "off" : "playlist";
    try {
      await playerSetRepeatMode({ mode: newMode }).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error("Set repeat mode failed:", err);
    }
  }, [isLoop, playerSetRepeatMode, refetchBotInfo]);

  const handleToggleMute = useCallback(async () => {
    try {
      await playerSetMute({ muted: !isMuted }).unwrap();
      await refetchBotInfo();
    } catch (err) {
      console.error("Mute failed:", err);
    }
  }, [isMuted, playerSetMute, refetchBotInfo]);

  const handleSeek = useCallback(
    async (positionSec: number) => {
      try {
        await playerSetPosition({ position_sec: positionSec }).unwrap();
        await refetchBotInfo();
      } catch (err) {
        console.error("Seek failed:", err);
      }
    },
    [playerSetPosition, refetchBotInfo],
  );

  const handleToggleVideo = useCallback(async () => {
    if (!isVideoEnabled) {
      try {
        isVideoEnabledRef.current = true;
        setIsVideoEnabled(true);

        if (liveKitRoomRef.current && isConnectedRef.current) {
          await publishVideoTrack();
        }
      } catch (err) {
        alert("Не удалось получить доступ к камере: " + (err as Error).message);
        isVideoEnabledRef.current = false;
        setIsVideoEnabled(false);
      }
    } else {
      isVideoEnabledRef.current = false;
      setIsVideoEnabled(false);

      const room = liveKitRoomRef.current;
      if (room) {
        for (const pub of publishedTracksRef.current) {
          if (pub.track?.kind === "video") {
            await room.localParticipant.unpublishTrack(pub.track, true);
          }
        }

        const remaining = publishedTracksRef.current.filter(
          (p) => p.track?.kind !== "video",
        );
        setPublishedTracks(remaining);
        publishedTracksRef.current = remaining;
      }
    }
  }, [isVideoEnabled, publishVideoTrack]);

  useEffect(() => {
    liveKitRoomRef.current = liveKitRoom;
  }, [liveKitRoom]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    isVideoEnabledRef.current = isVideoEnabled;
  }, [isVideoEnabled]);

  useEffect(() => {
    publishedTracksRef.current = publishedTracks;
  }, [publishedTracks]);

  useEffect(() => {
    return () => {
      if (liveKitRoom) {
        liveKitRoom.disconnect();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      // Останавливаем треки LiveKit
      publishedTracks.forEach((pub) => {
        if (pub.track && "stop" in pub.track) {
          (pub.track as LocalVideoTrack | LocalAudioTrack).stop();
        }
      });
    };
  }, [liveKitRoom, localStream, publishedTracks]);

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
    isConnected,
    room: liveKitRoom,
    localStream,
    publishedTracks,
    handleToggleBroadcast,
    publishVideoTrack,
    handleToggleRecording,
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
    unpublishTracks,
    formatDuration,
  };
};

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
