export interface User {
  id: string;
  username: string;
  fullName: string;
  roles: number[];
  registrationDate: string;
}

export interface ChangePasswordData {
  userId: string;
  password: string;
}