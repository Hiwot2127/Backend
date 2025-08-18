var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class LoginUser {
    constructor(users, hasher, tokens) {
        this.users = users;
        this.hasher = hasher;
        this.tokens = tokens;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.users.findByEmail(input.email.trim().toLowerCase());
            if (!user)
                throw new Error('Invalid credentials');
            const ok = yield this.hasher.compare(input.password, user.password);
            if (!ok)
                throw new Error('Invalid credentials');
            const token = this.tokens.sign({ userId: user.id, role: user.role }, '1h');
            return { token, role: user.role };
        });
    }
}
