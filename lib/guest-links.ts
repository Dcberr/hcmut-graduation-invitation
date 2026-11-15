/** Shared validation for the invitation and the bulk link builder. */
export function normalizeGuestName(value: string): string {
  return Array.from(value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 70).join('');
}
export function getGuestName(search: string, fallback: string): string {
  return normalizeGuestName(new URLSearchParams(search).get('guest') || '') || fallback;
}
export function createGuestLinks(base: string, input: string) {
  const url = new URL(base);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Vui lòng nhập địa chỉ bắt đầu bằng https:// hoặc http://.');
  if (url.username || url.password) throw new Error('Địa chỉ website không được chứa thông tin đăng nhập.');
  url.hash = '';
  url.search = '';
  if (/\/tao-thiep\/?$/.test(url.pathname)) url.pathname = url.pathname.replace(/tao-thiep\/?$/, '');
  const names = [...new Set(input.split(/\r?\n/).map(normalizeGuestName).filter(Boolean))];
  return names.map(name => { const link = new URL(url); link.searchParams.set('guest', name); return { name, url: link.href }; });
}
