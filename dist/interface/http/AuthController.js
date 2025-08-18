var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AuthController {
    constructor(registerUC, loginUC, promoteUC) {
        this.registerUC = registerUC;
        this.loginUC = loginUC;
        this.promoteUC = promoteUC;
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password)
                return res.status(400).json({ error: 'Email and password are required.' });
            try {
                const user = yield this.registerUC.execute({ email, password });
                res.status(201).json(user);
            }
            catch (_a) {
                res.status(409).json({ error: 'Email already registered' });
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password)
                return res.status(400).json({ error: 'Email and password are required.' });
            try {
                const result = yield this.loginUC.execute({ email, password });
                res.json(result);
            }
            catch (_a) {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
        this.promote = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.promoteUC.execute({ targetUserId: req.params.id });
                res.json(user);
            }
            catch (_a) {
                res.status(404).json({ error: 'User not found' });
            }
        });
    }
}
