import { mkdir, readFile, readdir, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { guestStore } from '@/lib/guest-store';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const dir=join(process.env.GUEST_DATA_DIR||join(process.cwd(),'data'),'memories');
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 try{
  const files=await readdir(dir).catch((e)=>{if(e.code==='ENOENT')return [];throw e;});
  const memories=[];
  for(const file of files.filter(f=>/^[a-f0-9]{24}\.json$/.test(f)).slice(-100))memories.push(JSON.parse(await readFile(join(dir,file),'utf8')));
  return json({memories:memories.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});
 }catch{return json({error:'Chưa tải được kỷ niệm. Hãy thử lại.'},500);}
}
export async function POST(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin&&new URL(request.headers.get('origin')!).host!==request.headers.get('host'))return json({error:'Yêu cầu không hợp lệ.'},403);
 try{
  const reader=request.body?.getReader();if(!reader)return json({error:'Thiếu nội dung.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();return json({error:'Ảnh quá lớn.'},413);}chunks.push(value);}
  const body=JSON.parse(Buffer.concat(chunks).toString());
  const guest=typeof body.guestId==='string'?await guestStore.get(body.guestId):undefined;
  if(!guest)return json({error:'Hãy mở đường link thiệp riêng của bạn để gửi kỷ niệm.'},403);
  if(body.anonymous!==undefined&&typeof body.anonymous!=='boolean')return json({error:'Lựa chọn ẩn danh không hợp lệ.'},400);
  if(body.displayName!==undefined&&(typeof body.displayName!=='string'||body.displayName.trim().length>70))return json({error:'Tên hiển thị tối đa 70 ký tự.'},400);
  const name=body.anonymous?'Một người bạn':(body.displayName?.trim()||guest.name);
  const note=typeof body.note==='string'?body.note.trim():'';
  if(note.length>600||(!note&&!body.image))return json({error:'Nhập lời chúc tối đa 600 ký tự hoặc chọn ảnh.'},400);
  let image='';
  if(body.image){
   if(typeof body.image!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(body.image))return json({error:'Chọn ảnh JPG, PNG hoặc WebP.'},400);
   const output=await sharp(Buffer.from(body.image.split(',')[1],'base64'),{limitInputPixels:20000000}).rotate().resize(640,640,{fit:'inside',withoutEnlargement:true}).jpeg({quality:70}).toBuffer();
   image='data:image/jpeg;base64,'+output.toString('base64');
  }
  const memory={id:randomUUID(),name,note,image,createdAt:new Date().toISOString()};
  await mkdir(dir,{recursive:true});
  const temp=join(dir,`${randomUUID()}.tmp`);
  await writeFile(temp,JSON.stringify(memory),{mode:0o600,flush:true});
  await rename(temp,join(dir,guest.id+'.json'));
  return json({memory});
 }catch{return json({error:'Không lưu được kỷ niệm. Hãy kiểm tra ảnh và thử lại.'},400);}
}
