export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: string;
  roleName: string;
  mustChangePassword?: boolean;
  permissions?: string[];
  isActive?: boolean;
  contractsCount?: number;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions?: {
    permission: {
      id: string;
      code: string;
      name: string;
      module: string;
    };
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
