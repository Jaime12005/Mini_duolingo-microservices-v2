export const allowedMime = new Set([
  'image/png',
  'image/jpeg',
  'image/webp'
]);

export function extFromMime(mime: string) {
  switch (mime) {
    case 'image/png': return 'png';
    case 'image/jpeg': return 'jpg';
    case 'image/webp': return 'webp';
    default: return '';
  }
}