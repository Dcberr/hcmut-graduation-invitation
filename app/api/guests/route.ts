import { createHash, timingSafeEqual } from 'node:crypto';
import { guestStore } from '@/lib/guest-store';
import { guestStoreError } from '@/lib/guest-store-errors';
import { normalizeGuestName } from '@/lib/guest-links';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
function storageFailure(error: unknown) {
 const failure = guestStoreError(error);
 const issue = error as { syscall?: string; name?: string } | null;
 console.error('[guest-store]', { code: failure.code, syscall: issue?.syscall, type: issue?.name });
 return json({ error: failure.error, code: failure.code }, failure.status);
}
function authorize(request: Request) {
 const token = process.env.INVITATION_ADMIN_TOKEN;
 if (!token || token.length < 24) return json({ error: 'Chưa cấu hình khóa quản trị trên server (tối thiểu 24 ký tự).' }, 503);
 const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
 const hash = (value: string) => createHash('sha256').update(value).digest();
 if (!timingSafeEqual(hash(token), hash(supplied))) return json({ error: 'Khóa quản trị không đúng.' }, 401);
}
export async function GET(request: Request) {
 const denied = authorize(request); if (denied) return denied;
 try { return json({ guests: await guestStore.list() }); }
 catch (error) { return storageFailure(error); }
}
export async function POST(request: Request) {
 const denied = authorize(request); if (denied) return denied;
 if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Yêu cầu JSON.' }, 415);
 const reader = request.body?.getReader(); if (!reader) return json({ error: 'Chưa nhập tên khách.' }, 400);
 let body = '', size = 0; const decoder = new TextDecoder();
 try {
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength;
   if (size > 32000) { await reader.cancel(); return json({ error: 'Danh sách quá dài; tối đa 100 khách mỗi lần.' }, 413); }
   body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  const input = JSON.parse(body);
  if (!Array.isArray(input.names) || input.names.length > 100 || input.names.some((name: unknown) => typeof name !== 'string' || name.length > 300)) return json({ error: 'Nhập tối đa 100 tên, mỗi tên không quá 70 ký tự.' }, 400);
  const names = [...new Set<string>(input.names.map(normalizeGuestName).filter(Boolean))];
  if (!names.length) return json({ error: 'Hãy nhập ít nhất một tên khách.' }, 400);
  try { return json({ guests: await guestStore.add(names) }); }
  catch (error) { return storageFailure(error); }
 } catch { return json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, 400); }
}
