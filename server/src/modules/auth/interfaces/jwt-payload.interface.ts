import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: number; // user id
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}