import { useState, useCallback, useRef, useEffect } from "react";
import {
  Room,
  RoomEvent,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  Track,
  VideoPresets,
  type RemoteTrackPublication,
  type RemoteParticipant,
  type LocalParticipant,
  type TrackPublishOptions,
} from "livekit-client";

interface UseLiveKitBroadcastOptions {
  serverUrl: string;
}

export function useLiveKitBroadcast({ serverUrl }: UseLiveKitBroadcastOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<LocalVideoTrack | null>(null);
  const localAudioRef = useRef<LocalAudioTrack | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      localVideoRef.current?.stop();
      localAudioRef.current?.stop();
    };
  }, []);

  const connect = useCallback(
    async (token: string) => {
      try {
        setError(null);

        if (roomRef.current) {
          await roomRef.current.disconnect();
        }

        const room = new Room();
        roomRef.current = room;

        // === События комнаты (для удалённых участников) ===
        room.on(RoomEvent.Connected, () => {
          console.log("✅ Подключено к комнате:", room.name);
          setIsConnected(true);
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("❌ Отключено");
          setIsConnected(false);
          setIsPublishing(false);
        });

        // TrackPublished — для треков ДРУГИХ участников
        room.on(
          RoomEvent.TrackPublished,
          (
            publication: RemoteTrackPublication,
            participant: RemoteParticipant,
          ) => {
            console.log(
              "📥 Remote track published:",
              publication.trackSid,
              "by",
              participant.identity,
            );
          },
        );

        room.on(
          RoomEvent.ParticipantConnected,
          (participant: RemoteParticipant) => {
            console.log("👤 Участник подключился:", participant.identity);
          },
        );

        // === События локального участника ===
        const localParticipant: LocalParticipant = room.localParticipant;

        // Используем правильную строку события для LocalParticipant
        // @ts-expect-error — событие есть в runtime, но не в типах
        localParticipant.on("trackPublicationFailed", (err: Error) => {
          console.error("❌ Ошибка публикации локального трека:", err);
          setError(`Не удалось опубликовать трек: ${err.message}`);
        });

        // Подключение
        await room.connect(serverUrl, token, {
          autoSubscribe: true,
        });

        return room;
      } catch (err) {
        console.error("❌ Ошибка подключения:", err);
        setError(
          err instanceof Error ? err.message : "Не удалось подключиться",
        );
        throw err;
      }
    },
    [serverUrl],
  );

  const startPublishing = useCallback(async () => {
    if (!roomRef.current) {
      throw new Error("Сначала подключитесь к комнате");
    }

    try {
      setError(null);

      // Запрашиваем доступ к камере и микрофону
      const videoTrack = await createLocalVideoTrack({
        resolution: VideoPresets.h720.resolution,
        facingMode: "user",
      });

      const audioTrack = await createLocalAudioTrack({
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      });

      // Опции публикации для видео
      const videoPublishOptions: TrackPublishOptions = {
        name: "camera",
        source: Track.Source.Camera,
        videoCodec: "vp8",
        // videoSimulcastLayers убираем — может не поддерживаться в твоей версии
      };

      // Опции публикации для аудио
      const audioPublishOptions: TrackPublishOptions = {
        name: "microphone",
        source: Track.Source.Microphone,
        dtx: true,
        red: false,
      };

      // Публикуем треки
      await roomRef.current.localParticipant.publishTrack(
        videoTrack,
        videoPublishOptions,
      );
      await roomRef.current.localParticipant.publishTrack(
        audioTrack,
        audioPublishOptions,
      );

      // Создаём MediaStream для локального превью
      const stream = new MediaStream([
        videoTrack.mediaStreamTrack,
        audioTrack.mediaStreamTrack,
      ]);

      // Отображаем в video element если есть
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
      }

      localVideoRef.current = videoTrack;
      localAudioRef.current = audioTrack;
      setLocalStream(stream);
      setIsPublishing(true);

      console.log("📡 Публикация началась");
      return stream;
    } catch (err) {
      console.error("❌ Ошибка публикации:", err);
      setError(
        err instanceof Error ? err.message : "Не удалось начать публикацию",
      );

      // Очищаем треки при ошибке
      localVideoRef.current?.stop();
      localAudioRef.current?.stop();
      throw err;
    }
  }, []);

  const stopPublishing = useCallback(async () => {
    try {
      if (roomRef.current && localVideoRef.current) {
        await roomRef.current.localParticipant.unpublishTrack(
          localVideoRef.current,
        );
        localVideoRef.current.stop();
        localVideoRef.current = null;
      }

      if (roomRef.current && localAudioRef.current) {
        await roomRef.current.localParticipant.unpublishTrack(
          localAudioRef.current,
        );
        localAudioRef.current.stop();
        localAudioRef.current = null;
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      setLocalStream(null);
      setIsPublishing(false);

      console.log("⏹️ Публикация остановлена");
    } catch (err) {
      console.error("❌ Ошибка остановки:", err);
      throw err;
    }
  }, [localStream]);

  const disconnect = useCallback(async () => {
    await stopPublishing();

    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    setIsConnected(false);
  }, [stopPublishing]);

  const setVideoElement = useCallback(
    (element: HTMLVideoElement | null) => {
      videoElementRef.current = element;
      if (element && localStream) {
        element.srcObject = localStream;
      }
    },
    [localStream],
  );

  return {
    isConnected,
    isPublishing,
    error,
    localStream,
    connect,
    startPublishing,
    stopPublishing,
    disconnect,
    setVideoElement,
  };
}
