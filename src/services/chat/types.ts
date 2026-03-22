export type ChatMessageStatus = 'New' | 'InProgress' | 'Completed';

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  status: ChatMessageStatus;
  createdAtUtc: string;
  statusUpdatedAtUtc?: string;
}

export interface ChatMessageWithAuthor extends ChatMessage {
  authorLogin: string;
  authorFullName: string;
}

// 🔥 ОТВЕТ от сервера (то, что вы видите в консоли)
export type ChatMessageResponseDto = ChatMessageWithAuthor;

// 🔥 ЗАПРОС к серверу (то, что вы ОТПРАВЛЯЕТЕ)
// ❌ УДАЛЯЕМ recipientId — чат глобальный, бэкенд сам подставит отправителя из токена
export interface CreateChatMessageRequestDto {
  text: string;  // ← Единственное поле, которое вы отправляете
}

export interface GetChatMessagesRequestDto {
  userId?: string;
  status?: ChatMessageStatus;
  fromDate?: string;
  toDate?: string;
}

export interface UpdateChatMessageStatusRequestDto {
  status: ChatMessageStatus;
}

export interface ChatHubEvents {
  MessageCreated: [message: ChatMessageResponseDto];
  MessageStatusUpdated: [message: ChatMessageResponseDto];
}

export interface ChatHubMethods {
  // 🔥 Один аргумент: объект с текстом
  SendMessage: [request: CreateChatMessageRequestDto]; 
  GetMessages: [request: GetChatMessagesRequestDto];
  UpdateMessageStatus: [messageId: string, request: UpdateChatMessageStatusRequestDto];
}