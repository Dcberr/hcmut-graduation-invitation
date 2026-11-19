// Run after npm run build:docker. Uses only a temporary store and an ephemeral port.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');
const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
const base=`http://127.0.0.1:${port}`,dir=await mkdtemp(join(tmpdir(),'guest-api-')),token=randomBytes(32).toString('hex');
let server,logs='';
async function start(key=token){
 server=spawn(process.execPath,['.next/standalone/server.js'],{env:{...process.env,HOSTNAME:'127.0.0.1',PORT:String(port),INVITATION_ADMIN_TOKEN:key,GUEST_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error(logs);
}
async function stop(){if(server&&server.exitCode===null){const exit=once(server,'exit');server.kill('SIGTERM');await exit;}}
const auth={Authorization:`Bearer ${token}`};
async function add(names){return fetch(`${base}/api/guests`,{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({names})});}
try{
 await start();
 assert.equal((await fetch(`${base}/api/guests`)).status,401);
 assert.equal((await add([])).status,400);
 assert.equal((await add(Array(101).fill('Guest'))).status,400);
 const response=await add(['  Chị   Ánh  ','Bạn Minh']);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 const {guests}=await response.json();assert.equal(guests[0].name,'Chị Ánh');
 const legacy=await fetch(`${base}/moi/${guests[0].id}`,{redirect:'manual'});assert.equal(legacy.status,308);assert.ok(legacy.headers.get('location')?.endsWith(`/invitation/${guests[0].id}`));
 const duplicate=await (await add(['Chị Ánh'])).json();assert.equal(duplicate.guests[0].id,guests[0].id);
 const invitation=await fetch(`${base}/invitation/${guests[0].id}?guest=WRONG_NAME`);assert.equal(invitation.status,200);
 const html=await invitation.text();assert.ok(html.includes('Chị Ánh'));assert.match(html,/thanks-guest[^>]*>Chị Ánh</);assert.ok(html.includes('Chỗ gửi xe'));assert.ok(html.includes('/portrait01.jpg'));assert.ok(invitation.headers.get('cache-control')?.includes('no-store'));
 const other=await (await fetch(`${base}/invitation/${guests[1].id}`)).text();assert.ok(other.includes('Bạn Minh'));assert.ok(!other.includes('Chị Ánh'));
 const invalid=await fetch(`${base}/invitation/${'0'.repeat(24)}`);assert.ok((await invalid.text()).includes('Không tìm thấy thiệp mời'));
 await stop();await start();
 const restored=await (await fetch(`${base}/api/guests`,{headers:auth})).json();assert.equal(restored.guests.length,2);assert.equal(restored.guests[0].id,guests[0].id);
 await stop();await start('');assert.equal((await fetch(`${base}/api/guests`,{headers:auth})).status,503);
 assert.equal((await fetch(`${base}/invitation/${guests[0].id}`)).status,200);
 console.log('PASS: API auth, validation, normalization, deduplication, personalized pages, no shared cache, restart persistence, disabled admin without token');
}finally{await stop();await rm(dir,{recursive:true,force:true});}
