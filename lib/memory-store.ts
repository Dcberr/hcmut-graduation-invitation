import { mkdir, open, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
export type MemoryRecord = {id:string;name:string;note:string;image:string;createdAt:string;updatedAt?:string;anonymous?:boolean};
type Stored = MemoryRecord & {ownerKey?:string;deleted?:boolean};
const recordFile=/^(?:[a-f0-9]{24}|[a-f0-9-]{36})\.json$/;
const ownerKey=(id:string)=>createHash('sha256').update(id).digest('hex');
export function publicMemory(r:Stored):MemoryRecord {
 const {id,name,note,image,createdAt,updatedAt,anonymous}=r;
 return {id,name,note,image,createdAt,updatedAt,anonymous};
}
export function createMemoryStore(directory:string){
 let queue:Promise<unknown>=Promise.resolve();
 function serialize<T>(operation:()=>Promise<T>){const result=queue.then(operation);queue=result.catch(()=>{});return result;}
 async function entries(){
  const files=await readdir(directory).catch(e=>{if(e.code==='ENOENT')return [];throw e;});
  const result:{file:string;record:Stored}[]=[];
  for(const file of files.filter(f=>recordFile.test(f))){const record=JSON.parse(await readFile(join(directory,file),'utf8'));record.image='';result.push({file,record});}
  return result;
 }
 function owned(entry:{file:string;record:Stored},guestId:string){
  return entry.record.ownerKey===ownerKey(guestId)||(!entry.record.ownerKey&&entry.file===guestId+'.json');
 }
 async function atomic(file:string,record:Stored){
  await mkdir(directory,{recursive:true});
  const temporary=join(directory,randomUUID()+'.tmp');
  try{
   await writeFile(temporary,JSON.stringify(record),{flag:'wx',mode:0o600,flush:true});
   await rename(temporary,join(directory,file));
   const folder=await open(directory,'r');try{await folder.sync();}finally{await folder.close();}
  }catch(e){await unlink(temporary).catch(()=>{});throw e;}
 }
 async function archive(record:Stored){
  const history=join(directory,'history');await mkdir(history,{recursive:true});
  await writeFile(join(history,randomUUID()+'.json'),JSON.stringify(record),{flag:'wx',mode:0o600,flush:true});
  const folder=await open(history,'r');try{await folder.sync();}finally{await folder.close();}
 }
 return {
  list(offset=0,limit=24,guestId?:string){return serialize(async()=>{
   const selected=(await entries()).filter(e=>!e.record.deleted&&(!guestId||owned(e,guestId))).sort((a,b)=>b.record.createdAt.localeCompare(a.record.createdAt)||a.file.localeCompare(b.file));
   const memories=[];for(const e of selected.slice(offset,offset+limit))memories.push(publicMemory(JSON.parse(await readFile(join(directory,e.file),'utf8'))));
   return {memories,total:selected.length,hasMore:offset+limit<selected.length};
  });},
  add(input:Pick<MemoryRecord,'name'|'note'|'image'|'anonymous'>,guestId:string){return serialize(async()=>{
   const record={...input,id:randomUUID(),createdAt:new Date().toISOString(),ownerKey:ownerKey(guestId)};
   await atomic(record.id+'.json',record);return publicMemory(record);
  });},
  update(id:string,guestId:string,input:Pick<MemoryRecord,'name'|'note'|'image'|'anonymous'>|null){return serialize(async()=>{
   const entry=(await entries()).find(e=>e.record.id===id&&!e.record.deleted&&owned(e,guestId));
   if(!entry)return undefined;
   entry.record=JSON.parse(await readFile(join(directory,entry.file),'utf8'));
   await archive(entry.record);
   const record={...entry.record,...(input||{}),ownerKey:ownerKey(guestId),updatedAt:new Date().toISOString(),deleted:input===null};
   await atomic(entry.file,record);return publicMemory(record);
  });}
 };
}
const shared=globalThis as typeof globalThis & {invitationMemoryStore?:ReturnType<typeof createMemoryStore>};
export const memoryStore=shared.invitationMemoryStore??=createMemoryStore(join(process.env.GUEST_DATA_DIR||join(process.cwd(),'data'),'memories'));
