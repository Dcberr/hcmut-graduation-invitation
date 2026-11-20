import { memoryStore } from '@/lib/memory-store';
import sharp from 'sharp';
import { guestStore } from '@/lib/guest-store';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 try{
  const offset=Number(new URL(request.url).searchParams.get('offset')||0);
  if(!Number.isSafeInteger(offset)||offset<0)return json({error:'Trang không hợp lệ.'},400);
  const mine=new URL(request.url).searchParams.get('mine')==='1';
  const guestId=request.headers.get('x-invitation-id')||'';
  if(mine&&!await guestStore.get(guestId))return json({error:'Mở link thiệp riêng để quản lý kỷ niệm.'},403);
  return json(await memoryStore.list(offset,24,mine?guestId:undefined));
 }catch{return json({error:'Chưa tải được kỷ niệm. Hãy thử lại.'},500);}
}
async function mutate(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin&&new URL(request.headers.get('origin')!).host!==request.headers.get('host'))return json({error:'Yêu cầu không hợp lệ.'},403);
 try{
  const reader=request.body?.getReader();if(!reader)return json({error:'Thiếu nội dung.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();return json({error:'Ảnh quá lớn.'},413);}chunks.push(value);}
  const body=JSON.parse(Buffer.concat(chunks).toString());
  const guest=typeof body.guestId==='string'?await guestStore.get(body.guestId):undefined;
  if(!guest)return json({error:'Hãy mở đường link thiệp riêng của bạn để gửi kỷ niệm.'},403);
  if(request.method!=='POST'&&(typeof body.id!=='string'||body.id.length>80))return json({error:'Kỷ niệm không hợp lệ.'},400);
  if(request.method==='DELETE'){
   const removed=await memoryStore.update(body.id,guest.id,null);
   return removed?json({ok:true}):json({error:'Không tìm thấy kỷ niệm thuộc về bạn.'},404);
  }
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
  const input={name,note,image,anonymous:body.anonymous===true};
  const memory=request.method==='PATCH'?await memoryStore.update(body.id,guest.id,input):await memoryStore.add(input,guest.id);
  if(!memory)return json({error:'Không tìm thấy kỷ niệm thuộc về bạn.'},404);
  return json({memory});
 }catch{return json({error:'Không lưu được kỷ niệm. Hãy kiểm tra ảnh và thử lại.'},400);}
}

export const POST=mutate;
export const PATCH=mutate;
export const DELETE=mutate;
