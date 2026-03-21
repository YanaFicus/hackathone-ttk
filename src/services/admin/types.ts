export interface GetUsersRequest {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UserDto {
  id: string;          
  login: string;
  fullName: string;
  roles: number[];     
  registeredAtUtc: string;  
  updatedAt?: string;  
}

export interface UpdateUserRequest {
  login?: string;
  fullName?: string;
  roles?: number[];
}

export interface ChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}