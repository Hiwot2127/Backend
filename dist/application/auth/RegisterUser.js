var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class RegisterUser {
    constructor(users, hasher) {
        this.users = users;
        this.hasher = hasher;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = input.email.trim().toLowerCase();
            const exists = yield this.users.findByEmail(email);
            if (exists)
                throw new Error('Email already registered');
            const hashed = yield this.hasher.hash(input.password);
            const user = yield this.users.create({ email, password: hashed });
            return { id: user.id, email: user.email, role: user.role };
        });
    }
}
