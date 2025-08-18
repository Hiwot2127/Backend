export interface TokenService {
  sign(payload: Record<string, unknown>, expiresIn?: string | number): string;
}
