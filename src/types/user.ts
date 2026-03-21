export interface User {
  id: number;
  username: string;
  fullName: string;
  roles: string[];
  registrationDate: string;
}

export interface ChangePasswordData {
  userId: number;
  password: string;
}