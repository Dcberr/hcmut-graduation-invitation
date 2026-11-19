import { mkdir, readFile, rename, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

export type GuestRecord = { id: string; name: string; createdAt: string };
const ID = /^[a-f0-9]{24}$/;
/** Single-process in-memory index with an atomic, durable snapshot. */
export function createGuestStore(directory: string) {
 let records = new Map<string, GuestRecord>();
 let loading: Promise<void> | undefined;
 let queue: Promise<unknown> = Promise.resolve();
 const file = join(directory, 'guests.json');
 async function load() {
  loading ??= (async () => {
   try {
    const data = JSON.parse(await readFile(file, 'utf8'));
    if (data.version !== 1 || !Array.isArray(data.guests) || data.guests.length > 5000) throw Object.assign(new Error('Invalid guest store'), { code: 'GUEST_DATA_INVALID' });
    const restored = new Map<string, GuestRecord>();
    for (const record of data.guests) {
     if (!record || !ID.test(record.id) || typeof record.name !== 'string' || !record.name || Array.from(record.name).length > 70 || typeof record.createdAt !== 'string' || restored.has(record.id)) throw Object.assign(new Error('Invalid guest record'), { code: 'GUEST_DATA_INVALID' });
     restored.set(record.id, record);
    }
    records = restored;
   } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
   }
  })();
  try { await loading; } catch (error) { loading = undefined; throw error; }
 }
 return {
  async get(id: string) { if (!ID.test(id)) return undefined; await load(); return records.get(id); },
  async list() { await load(); await queue; return [...records.values()]; },
  async add(names: string[]) {
   const operation = queue.then(async () => {
    await load();
    const next = new Map(records);
    const byName = new Map([...next.values()].map(record => [record.name, record]));
    const selected = names.map(name => {
     const existing = byName.get(name); if (existing) return existing;
     let id: string; do { id = randomBytes(12).toString('hex'); } while (next.has(id));
     const record = { id, name, createdAt: new Date().toISOString() };
     next.set(id, record); byName.set(name, record); return record;
    });
    if (next.size > 5000) throw Object.assign(new Error('Guest limit reached'), { code: 'GUEST_LIMIT' });
    if (next.size !== records.size) {
     await mkdir(directory, { recursive: true });
     const temporary = `${file}.${randomBytes(6).toString('hex')}.tmp`;
     try {
      await writeFile(temporary, JSON.stringify({ version: 1, guests: [...next.values()] }), { mode: 0o600, flush: true });
      await rename(temporary, file);
     } catch (error) { await unlink(temporary).catch(() => {}); throw error; }
     records = next; // Publish only after persistence succeeds.
    }
    return selected;
   });
   queue = operation.catch(() => {});
   return operation;
  },
 };
}
const shared = globalThis as typeof globalThis & { invitationGuestStore?: ReturnType<typeof createGuestStore> };
export const guestStore = shared.invitationGuestStore ??= createGuestStore(process.env.GUEST_DATA_DIR || join(process.cwd(), 'data'));
