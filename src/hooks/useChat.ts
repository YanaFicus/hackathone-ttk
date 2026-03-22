import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { chatApi, useGetMessagesQuery, useSendMessageMutation, useUpdateMessageStatusMutation } from '../services/chat/chatApi';
import { chatHub } from '../services/chat/chatHub';
import type { ChatMessageResponseDto, ChatMessageStatus } from '../services/chat/types';
import type { AppDispatch } from '../store/store';

export const useChat = (userId?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { data: messages = [], isLoading, refetch } = useGetMessagesQuery(userId ? { userId } : undefined);
  const [sendMessage] = useSendMessageMutation();
  const [updateStatus] = useUpdateMessageStatusMutation();

  useEffect(() => {
    const handleNewMessage = (message: ChatMessageResponseDto) => {
      dispatch(
        chatApi.util.upsertQueryData(
          'getMessages',
          userId ? { userId } : undefined,
          [...(messages || []), message]
        )
      );
    };

    const handleStatusUpdate = (message: ChatMessageResponseDto) => {
      dispatch(
        chatApi.util.updateQueryData(
          'getMessages',
          userId ? { userId } : undefined,
          (draft) => {
            const idx = draft.findIndex((m) => m.id === message.id);
            if (idx !== -1) {
              draft[idx] = message;
            }
          }
        )
      );
    };

    const unsub1 = chatHub.on('MessageCreated', handleNewMessage);
    const unsub2 = chatHub.on('MessageStatusUpdated', handleStatusUpdate);

    return () => {
      unsub1();
      unsub2();
    };
  }, [dispatch, messages, userId]);

  const handleSendMessage = useCallback(async (text: string, recipientId?: string) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 Sending message with userId:', payload.sub);
    }
    
    return await sendMessage({ text, recipientId }).unwrap();
  }, [sendMessage]);

  const handleUpdateStatus = useCallback(async (messageId: string, status: ChatMessageStatus) => {
    return await updateStatus({ messageId, request: { status } }).unwrap();
  }, [updateStatus]);

  const refreshMessages = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    messages,
    isLoading,
    sendMessage: handleSendMessage,
    updateMessageStatus: handleUpdateStatus,
    refreshMessages,
    isConnected: chatHub.isConnected(),
  };
};