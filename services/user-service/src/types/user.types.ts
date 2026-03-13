export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ListUsersResponse {
  items: UserResponse[];
  nextCursor?: string;
}
