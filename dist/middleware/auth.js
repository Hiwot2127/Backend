import jwt from 'jsonwebtoken';
export function authenticateJWT(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token)
        return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        req.user = { userId: payload.userId, role: payload.role };
        return next();
    }
    catch (_a) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(req.user.role))
            return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}
