export interface User {
  userID: string;
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
