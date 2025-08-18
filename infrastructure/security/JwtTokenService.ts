import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { TokenService } from '../../domain/services/TokenService.js';

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: Secret) {}

  sign(payload: Record<string, unknown>, expiresIn: string | number = '1h') {
    const options: SignOptions = {};
    (options as any).expiresIn = expiresIn;
    return jwt.sign(payload, this.secret, options);
  }
}
