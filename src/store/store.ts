import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/auth/authApi';
import { adminApi } from '../services/admin/adminApi';
import { livekitApi } from '../services/livekit/livekitApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [livekitApi.reducerPath]: livekitApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, adminApi.middleware, livekitApi.middleware),
});