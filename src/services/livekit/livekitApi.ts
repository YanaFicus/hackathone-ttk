import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  LiveKitTokenRequest,
  LiveKitTokenResponse,
  BotInfo,
  AddToQueueRequest,
  InsertToQueueRequest,
  MoveTrackRequest,
  SetPositionRequest,
  SetMuteRequest,
  UploadIntentRequest,
  UploadIntentResponse,
  UploadCompleteRequest,
  PresignedUrlRequest,
  MediaFile,
  LibraryResponse,
  LibraryQueryParams,
  RepeatMode,
} from './types';

// 🔥 ИСПРАВЛЕНО: используем HTTP для REST API, не WebSocket!
const API_BASE_URL = 'http://95.174.104.223:8009/api/v1';
const API_TOKEN = 'test';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${API_TOKEN}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const livekitApi = createApi({
  reducerPath: 'livekitApi',
  baseQuery,
  tagTypes: ['BotInfo', 'Library'],
  endpoints: (builder) => ({
    // ==================== 🎬 LiveKit ====================
    
    /**
     * POST /livekit/token
     * Create LiveKit access token
     */
    createLiveKitToken: builder.mutation<LiveKitTokenResponse, LiveKitTokenRequest>({
      query: (body) => ({
        url: '/livekit/token',
        method: 'POST',
        body,
      }),
    }),

    // ==================== 🤖 Bot Info ====================
    
    /**
     * GET /playlist_bot/info
     * Get current bot state and queue
     */
    getBotInfo: builder.query<BotInfo, void>({
      query: () => '/playlist_bot/info',
      providesTags: ['BotInfo'],
    }),

    // ==================== 📋 Queue Management ====================
    
    /**
     * POST /playlist_bot/queue/tracks
     * Add tracks to end of queue (array of keys)
     */
    addToQueue: builder.mutation<void, AddToQueueRequest>({
      query: (keys) => ({
        url: '/playlist_bot/queue/tracks',
        method: 'POST',
        body: keys,
      }),
      invalidatesTags: ['BotInfo'],
    }),

    /**
     * POST /playlist_bot/queue/tracks/{index}
     * Insert track at specific position
     */
    insertToQueue: builder.mutation<void, { index: number; track: InsertToQueueRequest }>({
      query: ({ index, track }) => ({
        url: `/playlist_bot/queue/tracks/${index}`,
        method: 'POST',
        body: track,
      }),
      invalidatesTags: ['BotInfo'],
    }),

    /**
     * DELETE /playlist_bot/queue/tracks/{index}
     * Remove track from queue
     */
    removeFromQueue: builder.mutation<void, { index: number }>({
      query: ({ index }) => ({
        url: `/playlist_bot/queue/tracks/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    /**
     * POST /playlist_bot/queue/tracks/{old_index}/move?new_index={new_index}
     * Move track within queue
     */
    moveTrackInQueue: builder.mutation<void, MoveTrackRequest>({
      query: ({ old_index, new_index }) => ({
        url: `/playlist_bot/queue/tracks/${old_index}/move`,
        method: 'POST',
        params: { new_index },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    /**
     * DELETE /playlist_bot/queue/clear
     * Clear entire queue
     */
    clearQueue: builder.mutation<void, void>({
      query: () => ({
        url: '/playlist_bot/queue/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    // ==================== 🎮 Player Controls ====================
    
    playerPlay: builder.mutation<void, void>({
      query: () => ({
        url: '/playlist_bot/player/play',
        method: 'POST',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerPlayIndex: builder.mutation<void, { index: number }>({
      query: ({ index }) => ({
        url: `/playlist_bot/player/play/${index}`,
        method: 'POST',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerPause: builder.mutation<void, { stopVideo?: boolean }>({
      query: ({ stopVideo = true } = {}) => ({
        url: '/playlist_bot/player/pause',
        method: 'POST',
        params: { stop_video: stopVideo },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerStop: builder.mutation<void, void>({
      query: () => ({
        url: '/playlist_bot/player/stop',
        method: 'POST',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerNext: builder.mutation<void, void>({
      query: () => ({
        url: '/playlist_bot/player/next',
        method: 'POST',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerPrevious: builder.mutation<void, void>({
      query: () => ({
        url: '/playlist_bot/player/previous',
        method: 'POST',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerSetMute: builder.mutation<void, SetMuteRequest>({
      query: ({ muted, with_video = false }) => ({
        url: '/playlist_bot/player/mute',
        method: 'POST',
        params: { muted, with_video },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerSetRepeatMode: builder.mutation<void, { mode: RepeatMode }>({
      query: ({ mode }) => ({
        url: '/playlist_bot/player/repeat',
        method: 'POST',
        params: { mode },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerSetPosition: builder.mutation<void, SetPositionRequest>({
      query: ({ position_sec }) => ({
        url: '/playlist_bot/player/set_position',
        method: 'POST',
        params: { position_sec },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    // ==================== 📁 Media Upload ====================
    
    getUploadIntent: builder.mutation<UploadIntentResponse, UploadIntentRequest>({
      query: (body) => ({
        url: '/media/upload-intent',
        method: 'POST',
        body,
      }),
    }),

    confirmUpload: builder.mutation<MediaFile, UploadCompleteRequest>({
      query: (body) => ({
        url: '/media/upload-complete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Library'],
    }),

    getPresignedUrl: builder.query<string, PresignedUrlRequest>({
      query: ({ key, filename }) => ({
        url: '/media/presigned_url',
        method: 'GET',
        params: { key, filename },
      }),
    }),

    // ==================== 📚 Library ====================
    
    getLibrary: builder.query<LibraryResponse, LibraryQueryParams>({
      query: (params) => ({
        url: '/library',
        method: 'GET',
        params,
      }),
      providesTags: ['Library'],
    }),

    deleteFromLibrary: builder.mutation<void, { key: string }>({
      query: ({ key }) => ({
        url: '/library',
        method: 'DELETE',
        params: { key },
      }),
      invalidatesTags: ['Library'],
    }),
  }),
});

export const {
  useCreateLiveKitTokenMutation,
  useGetBotInfoQuery,
  useAddToQueueMutation,
  useInsertToQueueMutation,
  useRemoveFromQueueMutation,
  useMoveTrackInQueueMutation,
  useClearQueueMutation,
  usePlayerPlayMutation,
  usePlayerPlayIndexMutation,
  usePlayerPauseMutation,
  usePlayerStopMutation,
  usePlayerNextMutation,
  usePlayerPreviousMutation,
  usePlayerSetMuteMutation,
  usePlayerSetRepeatModeMutation,
  usePlayerSetPositionMutation,
  useGetUploadIntentMutation,
  useConfirmUploadMutation,
  useGetPresignedUrlQuery,
  useGetLibraryQuery,
  useDeleteFromLibraryMutation,
} = livekitApi;