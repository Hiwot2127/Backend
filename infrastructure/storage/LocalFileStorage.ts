import path from 'node:path';

export class LocalFileStorage {
  toRelative(absOrRelPath: string): string {
    const filename = path.basename(absOrRelPath);
    return path.join('uploads', filename).replace(/\\/g, '/');
  }
  
  toPublicUrl(baseUrl: string, relativePath: string): string {
    const rel = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl.replace(/\/+$/, '')}/${rel}`;
  }
}