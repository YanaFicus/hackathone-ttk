// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Room,
//   RoomEvent,
//   Track,
//   TrackPublication,
//   RemoteParticipant,
//   LocalVideoTrack,
//   LocalAudioTrack,
//   createLocalVideoTrack,
//   createLocalAudioTrack,
//   VideoPresets,
// } from 'livekit-client';
// import { useCreateLiveKitTokenMutation } from '../services/livekit/livekitApi';
// import type { LiveKitTokenRequest } from '../services/livekit/types';

// const LIVEKIT_WS_URL = 'ws://95.174.104.223:7880';
// const DEFAULT_ROOM = 'main-broadcast';

// export interface UseLiveKitOptions {
//   autoConnect?: boolean;
//   publishVideo?: boolean;
//   publishAudio?: boolean;
//   roomName?: string;
// }

// export interface UseLiveKitReturn {
//   room: Room | null;
//   isConnected: boolean;
//   isPublishing: boolean;
//   localTracks: Track[];
//   remoteParticipants: Map<string, RemoteParticipant>;
//   connect: (token: string, roomName?: string) => Promise<void>;
//   disconnect: () => Promise<void>;
//   publishTracks: (options?: { video?: boolean; audio?: boolean }) => Promise<void>;
//   unpublishTracks: () => void;
//   getLocalVideoTrack: () => LocalVideoTrack | undefined;
//   getLocalAudioTrack: () => LocalAudioTrack | undefined;
//   error: Error | null;
// }

// export const useLiveKit = (
//   options: UseLiveKitOptions = {}
// ): UseLiveKitReturn => {
//   const {
//     autoConnect = false,
//     publishVideo = true,
//     publishAudio = true,
//     roomName = DEFAULT_ROOM,
//   } = options;

//   const [createToken] = useCreateLiveKitTokenMutation();
//   const [room, setRoom] = useState<Room | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isPublishing, setIsPublishing] = useState(false);
//   const [localTracks, setLocalTracks] = useState<Track[]>([]);
//   const [remoteParticipants, setRemoteParticipants] = useState<
//     Map<string, RemoteParticipant>
//   >(new Map());
//   const [error, setError] = useState<Error | null>(null);
//   const tracksRef = useRef<Track[]>([]);

//   const connect = useCallback(
//     async (token: string, targetRoom?: string) => {
//       try {
//         const newRoom = new Room();

//         newRoom.on(RoomEvent.Connected, () => {
//           setIsConnected(true);
//           setError(null);
//         });

//         newRoom.on(RoomEvent.Disconnected, () => {
//           setIsConnected(false);
//           setIsPublishing(false);
//           setLocalTracks([]);
//         });

//         newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
//           setRemoteParticipants((prev) => {
//             const next = new Map(prev);
//             next.set(participant.sid, participant);
//             return next;
//           });
//         });

//         newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
//           setRemoteParticipants((prev) => {
//             const next = new Map(prev);
//             next.delete(participant.sid);
//             return next;
//           });
//         });

//         newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
//           if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
//             const element = track.attach();
//             element.autoplay = true;
//             element.playsInline = true;
//           }
//         });

//         newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
//           track.detach();
//         });

//         newRoom.on(RoomEvent.MediaDevicesError, (err: Error) => {
//           setError(err);
//         });

//         await newRoom.connect(`${LIVEKIT_WS_URL}/rtc`, token, {
//           autoSubscribe: true,
//           publishDefaults: {
//             videoCodec: 'vp8',
//             videoEncoding: { maxBitrate: 2_000_000 },
//             audioBitrate: 128,
//             dtx: true,
//             red: true,
//             forceStereo: false,
//           },
//           adaptiveStream: {
//             pixelDensity: 'screen',
//             maxDimensions: {
//               video: { width: 1280, height: 720 },
//             },
//           },
//         });

//         setRoom(newRoom);
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error('Connection failed'));
//         throw err;
//       }
//     },
//     []
//   );

//   const disconnect = useCallback(async () => {
//     if (room) {
//       unpublishTracks();
//       await room.disconnect();
//       setRoom(null);
//       setIsConnected(false);
//     }
//   }, [room]);

//   const publishTracks = useCallback(
//     async (opts?: { video?: boolean; audio?: boolean }) => {
//       if (!room || !room.localParticipant) return;

//       const { video = publishVideo, audio = publishAudio } = opts || {};
//       const tracks: Track[] = [];

//       try {
//         if (video) {
//           const videoTrack = await createLocalVideoTrack({
//             resolution: VideoPresets.h720,
//             facingMode: 'user',
//           });
//           await room.localParticipant.publishTrack(videoTrack);
//           tracks.push(videoTrack);
//         }

//         if (audio) {
//           const audioTrack = await createLocalAudioTrack({
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//           });
//           await room.localParticipant.publishTrack(audioTrack);
//           tracks.push(audioTrack);
//         }

//         setLocalTracks(tracks);
//         tracksRef.current = tracks;
//         setIsPublishing(tracks.length > 0);
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error('Publish failed'));
//         throw err;
//       }
//     },
//     [room, publishVideo, publishAudio]
//   );

//   const unpublishTracks = useCallback(() => {
//     if (!room || !room.localParticipant) return;

//     tracksRef.current.forEach((track) => {
//       room.localParticipant?.unpublishTrack(track);
//       track.detach();
//     });

//     setLocalTracks([]);
//     tracksRef.current = [];
//     setIsPublishing(false);
//   }, [room]);

//   const getLocalVideoTrack = useCallback(
//     () => localTracks.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack | undefined,
//     [localTracks]
//   );

//   const getLocalAudioTrack = useCallback(
//     () => localTracks.find((t) => t.kind === Track.Kind.Audio) as LocalAudioTrack | undefined,
//     [localTracks]
//   );

//   useEffect(() => {
//     return () => {
//       disconnect();
//     };
//   }, [disconnect]);

//   return {
//     room,
//     isConnected,
//     isPublishing,
//     localTracks,
//     remoteParticipants,
//     connect,
//     disconnect,
//     publishTracks,
//     unpublishTracks,
//     getLocalVideoTrack,
//     getLocalAudioTrack,
//     error,
//   };
// };