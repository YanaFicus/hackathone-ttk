import { createApi } from '@reduxjs/toolkit/query/react';
import { chatHub } from './chatHub';
import type {
  ChatHubMethods,
  ChatMessageResponseDto,
  CreateChatMessageRequestDto,
  GetChatMessagesRequestDto,
  UpdateChatMessageStatusRequestDto,
} from './types';

// Типизированный baseQuery для SignalR
const signalRBaseQuery = async <TMethod extends keyof ChatHubMethods>(
  args: {
    method: TMethod;
    params: ChatHubMethods[TMethod];
  }
) => {
  try {
    // Преобразуем params в массив аргументов
    const paramsArray = Array.isArray(args.params) ? args.params : [args.params];
    const result = await (chatHub.invoke as any)(args.method, ...paramsArray);
    return { data: result };
  } catch (error: any) {
    console.error(`SignalR error in ${args.method}:`, error);
    return {
      error: {
        status: 'CUSTOM_ERROR',
        data: error.message || 'SignalR error',
      },
    };
  }
};

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: signalRBaseQuery,
  tagTypes: ['ChatMessages'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation<ChatMessageResponseDto, CreateChatMessageRequestDto>({
      query: (request) => ({
        method: 'SendMessage',
        params: [request], // Один аргумент - объект запроса
      }),
      invalidatesTags: ['ChatMessages'],
    }),

    getMessages: builder.query<ChatMessageResponseDto[], GetChatMessagesRequestDto | void>({
      query: (request) => ({
        method: 'GetMessages',
        params: [request ?? {}], // Один аргумент - объект запроса (или пустой объект)
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ChatMessages' as const, id })),
              { type: 'ChatMessages', id: 'LIST' },
            ]
          : [{ type: 'ChatMessages', id: 'LIST' }],
    }),

    updateMessageStatus: builder.mutation<
      ChatMessageResponseDto,
      { messageId: string; request: UpdateChatMessageStatusRequestDto }
    >({
      query: ({ messageId, request }) => ({
        method: 'UpdateMessageStatus',
        params: [messageId, request], // Два аргумента - messageId и request
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: 'ChatMessages', id: messageId },
        { type: 'ChatMessages', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useUpdateMessageStatusMutation,
} = chatApi;