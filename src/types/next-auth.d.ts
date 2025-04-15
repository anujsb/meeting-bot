import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number; // Custom property for token expiration
    idToken?: string; // Custom property for id_token
  }
}