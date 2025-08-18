import jwt from 'jsonwebtoken';
export class JwtTokenService {
    constructor(secret) {
        this.secret = secret;
    }
    sign(payload, expiresIn = '1h') {
        const options = {};
        options.expiresIn = expiresIn;
        return jwt.sign(payload, this.secret, options);
    }
}
