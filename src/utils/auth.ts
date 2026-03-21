export interface UserInfo {
  userId: string;
  login: string;
  fullName: string;
  roles: string[];
}

export const getUserInfo = (): UserInfo | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as UserInfo;
  } catch {
    return null;
  }
};

export const getUserId = (): string | null => {
  return getUserInfo()?.userId ?? null;
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};