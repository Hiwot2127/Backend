import path from 'node:path';
export class LocalFileStorage {
    toRelative(absOrRelPath) {
        const filename = path.basename(absOrRelPath);
        return path.join('uploads', filename).replace(/\\/g, '/');
    }
    toPublicUrl(baseUrl, relativePath) {
        const rel = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
        return `${baseUrl.replace(/\/+$/, '')}/${rel}`;
    }
}
