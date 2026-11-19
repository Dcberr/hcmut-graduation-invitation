import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createGuestStore } from '../lib/guest-store.ts';
import { guestStoreError } from '../lib/guest-store-errors.ts';
const dir=await mkdtemp(join(tmpdir(),'guest-store-'));
try {
 const store=createGuestStore(dir);
 const [a,b]=await Promise.all([store.add(['Chị Ánh','Bạn Minh']),store.add(['Chị Ánh','Nguyễn Văn A'])]);
 assert.equal(a[0].id,b[0].id);assert.equal((await store.list()).length,3);
 assert.match(a[0].id,/^[a-f0-9]{24}$/);
 const restored=createGuestStore(dir);assert.equal((await restored.get(a[0].id)).name,'Chị Ánh');
 assert.equal(await restored.get('../guests.json'),undefined);
 assert.equal(await restored.get('0'.repeat(24)),undefined);
 await writeFile(join(dir,'guests.json'),'corrupt');
 const damaged=createGuestStore(dir);await assert.rejects(()=>damaged.add(['New']));
 assert.equal(await readFile(join(dir,'guests.json'),'utf8'),'corrupt');
 await writeFile(join(dir,'guests.json'),JSON.stringify({version:1,guests:[]}));
 assert.equal((await damaged.add(['Recovered']))[0].name,'Recovered');
 for(const code of ['EACCES','EROFS','ENOSPC','ENOTDIR','ENOSYS','GUEST_LIMIT']){const failure=guestStoreError({code});assert.equal(failure.code,code);assert.ok(failure.error);}
 assert.equal(guestStoreError(new SyntaxError()).code,'GUEST_DATA_INVALID');
 console.log('PASS: concurrent writes, duplicate reuse, persistence, invalid IDs, corrupt store protection');
}finally{await rm(dir,{recursive:true,force:true});}
