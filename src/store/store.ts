import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/auth/authApi';
import { adminApi } from '../services/admin/adminApi';
import { livekitApi } from '../services/livekit/livekitApi';
import { chatApi } from '../services/chat/chatApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [livekitApi.reducerPath]: livekitApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, adminApi.middleware, livekitApi.middleware, chatApi.middleware),
});