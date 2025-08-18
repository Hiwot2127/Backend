import bcrypt from 'bcrypt';
export class BcryptPasswordHasher {
    constructor(rounds = 10) {
        this.rounds = rounds;
    }
    hash(plain) { return bcrypt.hash(plain, this.rounds); }
    compare(plain, hash) { return bcrypt.compare(plain, hash); }
}
