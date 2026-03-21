// import { useState, useEffect, useCallback } from "react";
// import { Room, RemoteParticipant, Track } from "livekit-client";
// import { useCreateLiveKitTokenMutation } from "../services/livekit/livekitApi";

// interface UseLiveKitOptions {
//   roomName: string;
//   participantName: string;
//   onConnected?: () => void;
//   onDisconnected?: () => void;
//   onParticipantJoined?: (participant: RemoteParticipant) => void;
//   onParticipantLeft?: (participant: RemoteParticipant) => void;
//   onTrackSubscribed?: (track: Track, participant: RemoteParticipant) => void;
// }

// export const useLiveKit = (options: UseLiveKitOptions) => {
//   const [room, setRoom] = useState<Room | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [createToken] = useCreateLiveKitTokenMutation();

//   const connect = useCallback(async () => {
//     if (isConnected || isConnecting) return;

//     setIsConnecting(true);
//     setError(null);

//     try {
//       // Получаем токен от сервера
//       const { token, url } = await createToken({
//         roomName: options.roomName,
//         participantName: options.participantName,
//       }).unwrap();

//       // Создаем комнату и подключаемся
//       const newRoom = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       });

//       // Настраиваем обработчики событий
//       newRoom.on("connected", () => {
//         setIsConnected(true);
//         options.onConnected?.();
//       });

//       newRoom.on("disconnected", () => {
//         setIsConnected(false);
//         options.onDisconnected?.();
//       });

//       newRoom.on("participantConnected", (participant) => {
//         options.onParticipantJoined?.(participant);
//       });

//       newRoom.on("participantDisconnected", (participant) => {
//         options.onParticipantLeft?.(participant);
//       });

//       newRoom.on("trackSubscribed", (track, publication, participant) => {
//         options.onTrackSubscribed?.(track, participant);
//       });

//       await newRoom.connect(url, token);
//       setRoom(newRoom);
//     } catch (err) {
//       console.error("Failed to connect to LiveKit:", err);
//       setError(err instanceof Error ? err.message : "Failed to connect");
//     } finally {
//       setIsConnecting(false);
//     }
//   }, [createToken, options, isConnected, isConnecting]);

//   const disconnect = useCallback(async () => {
//     if (room) {
//       await room.disconnect();
//       setRoom(null);
//       setIsConnected(false);
//     }
//   }, [room]);

//   const publishAudio = useCallback(async (track: MediaStreamTrack) => {
//     if (room && room.localParticipant) {
//       await room.localParticipant.publishTrack(track, {
//         source: Track.Source.Microphone,
//       });
//     }
//   }, [room]);

//   const publishVideo = useCallback(async (track: MediaStreamTrack) => {
//     if (room && room.localParticipant) {
//       await room.localParticipant.publishTrack(track, {
//         source: Track.Source.Camera,
//       });
//     }
//   }, [room]);

//   const unpublishAudio = useCallback(() => {
//     if (room && room.localParticipant) {
//       room.localParticipant.unpublishTracks(Track.Source.Microphone);
//     }
//   }, [room]);

//   const unpublishVideo = useCallback(() => {
//     if (room && room.localParticipant) {
//       room.localParticipant.unpublishTracks(Track.Source.Camera);
//     }
//   }, [room]);

//   useEffect(() => {
//     return () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//   }, [room]);

//   return {
//     room,
//     isConnected,
//     isConnecting,
//     error,
//     connect,
//     disconnect,
//     publishAudio,
//     publishVideo,
//     unpublishAudio,
//     unpublishVideo,
//   };
// };