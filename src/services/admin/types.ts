export interface GetUsersRequest {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UserDto {
  id: string;
  username: string;
  fullName: string;
  role: "Administrator" | "User" | "Broadcaster";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  username?: string;
  fullName?: string;
  role?: "Administrator" | "User" | "Broadcaster";
}

export interface ChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}