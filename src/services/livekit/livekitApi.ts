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

const REST_API_BASE_URL = 'http://95.174.104.223:8009/api/v1';
const API_TOKEN = 'test'; // Статический токен для API

const restBaseQuery = fetchBaseQuery({
  baseUrl: REST_API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${API_TOKEN}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const livekitApi = createApi({
  reducerPath: 'livekitApi',
  baseQuery: restBaseQuery,
  tagTypes: ['BotInfo', 'Library'],
  endpoints: (builder) => ({
    createLiveKitToken: builder.mutation<LiveKitTokenResponse, LiveKitTokenRequest>({
      query: (body) => ({
        url: '/livekit/token',
        method: 'POST',
        body,
      }),
    }),

    getBotInfo: builder.query<BotInfo, void>({
      query: () => '/playlist_bot/info',
      providesTags: ['BotInfo'],
    }),

    addToQueue: builder.mutation<void, AddToQueueRequest>({
      query: (keys) => ({
        url: '/playlist_bot/queue/tracks',
        method: 'POST',
        body: keys,
      }),
      invalidatesTags: ['BotInfo'],
    }),

    insertToQueue: builder.mutation<void, { index: number; track: InsertToQueueRequest }>({
      query: ({ index, track }) => ({
        url: `/playlist_bot/queue/tracks/${index}`,
        method: 'POST',
        body: track,
      }),
      invalidatesTags: ['BotInfo'],
    }),

    removeFromQueue: builder.mutation<void, { index: number }>({
      query: ({ index }) => ({
        url: `/playlist_bot/queue/tracks/${index}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    moveTrackInQueue: builder.mutation<void, MoveTrackRequest>({
      query: ({ old_index, new_index }) => ({
        url: `/playlist_bot/queue/tracks/${old_index}/move`,
        method: 'POST',
        body: { new_index },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    clearQueue: builder.mutation<void, void>({
      query: () => ({
        url: '/playlist_bot/queue/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerPlay: builder.mutation<void, void>({
      query: () => ({ url: '/playlist_bot/player/play', method: 'POST' }),
      invalidatesTags: ['BotInfo'],
    }),

    playerPause: builder.mutation<void, { stopVideo?: boolean }>({
      query: ({ stopVideo = true } = {}) => ({
        url: '/playlist_bot/player/pause',
        method: 'POST',
        body: { stop_video: stopVideo },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerStop: builder.mutation<void, void>({
      query: () => ({ url: '/playlist_bot/player/stop', method: 'POST' }),
      invalidatesTags: ['BotInfo'],
    }),

    playerNext: builder.mutation<void, void>({
      query: () => ({ url: '/playlist_bot/player/next', method: 'POST' }),
      invalidatesTags: ['BotInfo'],
    }),

    playerPrevious: builder.mutation<void, void>({
      query: () => ({ url: '/playlist_bot/player/previous', method: 'POST' }),
      invalidatesTags: ['BotInfo'],
    }),

    playerSetMute: builder.mutation<void, SetMuteRequest>({
      query: ({ muted, with_video = false }) => ({
        url: '/playlist_bot/player/mute',
        method: 'POST',
        body: { muted, with_video },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerSetRepeatMode: builder.mutation<void, { mode: RepeatMode }>({
      query: ({ mode }) => ({
        url: '/playlist_bot/player/repeat',
        method: 'POST',
        body: { mode },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    playerSetPosition: builder.mutation<void, SetPositionRequest>({
      query: ({ position_sec }) => ({
        url: '/playlist_bot/player/set_position',
        method: 'POST',
        body: { position_sec },
      }),
      invalidatesTags: ['BotInfo'],
    }),

    getUploadIntent: builder.mutation<UploadIntentResponse, UploadIntentRequest>({
      query: (body) => ({ url: '/media/upload-intent', method: 'POST', body }),
    }),

    confirmUpload: builder.mutation<MediaFile, UploadCompleteRequest>({
      query: (body) => ({ url: '/media/upload-complete', method: 'POST', body }),
      invalidatesTags: ['Library'],
    }),

    getPresignedUrl: builder.query<string, PresignedUrlRequest>({
      query: ({ key, filename }) => ({ 
        url: '/media/presigned_url', 
        method: 'GET', 
        params: { key, filename } 
      }),
    }),

    getLibrary: builder.query<LibraryResponse, LibraryQueryParams>({
      query: (params) => ({ url: '/library', method: 'GET', params }),
      providesTags: ['Library'],
    }),

    deleteFromLibrary: builder.mutation<void, { key: string }>({
      query: ({ key }) => ({ url: '/library', method: 'DELETE', params: { key } }),
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