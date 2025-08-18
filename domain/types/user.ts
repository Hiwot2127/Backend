export type Role = 'USER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  password: string; 
  role: Role;
  createdAt: Date;
};