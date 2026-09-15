export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  roleName: string;
  mustChangePassword?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  errors?: any;
}
