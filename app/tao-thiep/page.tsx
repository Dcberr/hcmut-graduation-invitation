'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { invitation } from '@/lib/invitation-config';
type Guest = { id: string; name: string; createdAt: string };
export default function CreateInvitations() {
 const [origin,setOrigin]=useState(''); const [names,setNames]=useState('');
 const [token,setToken]=useState(''); const [guests,setGuests]=useState<Guest[]>([]);
 const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [message,setMessage]=useState('');
 useEffect(()=>setOrigin(location.origin),[]);
 const link=(id:string)=>`${origin}/invitation/${id}`;
 async function request(create:boolean) {
  if(busy)return; setBusy(true);setError('');setMessage('');
  try {
   const response=await fetch('/api/guests',{method:create?'POST':'GET',cache:'no-store',headers:{Authorization:`Bearer ${token}`,...(create?{'Content-Type':'application/json'}:{})},...(create?{body:JSON.stringify({names:names.split(/\r?\n/).filter(name=>name.trim())})}:{})});
   const data=await response.json() as {error?:string;guests?:Guest[]};if(!response.ok)throw new Error(data.error||'Không thực hiện được yêu cầu.');
   if(!Array.isArray(data.guests))throw new Error('Phản hồi từ server không hợp lệ.');
   setGuests(data.guests);setMessage(create?'Đã lưu. Bạn có thể sao chép link để gửi ngay.':'Đã tải danh sách khách đã lưu.');
  }catch(e){setError(e instanceof Error?e.message:'Không kết nối được server.');}finally{setBusy(false);}
 }
 async function copy(value:string){try{await navigator.clipboard.writeText(value);setMessage('Đã sao chép.');}catch{setMessage('Hãy sao chép trực tiếp trong ô nội dung bên dưới.');}}
 const output=guests.map(guest=>`${guest.name}\n${link(guest.id)}`).join('\n\n');
 return <main className="guest-builder">
  <header><a href="/">← Về thiệp mời</a><p className="builder-kicker">HCMUT · {invitation.year}</p><h1>Một lời mời riêng<br/>cho từng người bạn.</h1><p>Nhập tên khách, nhận link thiệp của {invitation.graduateName}. Các link được lưu để bạn lấy lại khi cần.</p></header>
  <div className="builder-grid"><form onSubmit={(event:FormEvent)=>{event.preventDefault();void request(true);}}>
   <h2>Tạo thiệp mời</h2><label htmlFor="admin-key">Khóa quản trị</label><input id="admin-key" type="password" autoComplete="off" required value={token} onChange={event=>{setToken(event.target.value);setGuests([]);}}/><small>Chỉ bạn cần khóa này. Khách mời mở link trực tiếp, không cần đăng nhập.</small>
   <label htmlFor="guest-list">Tên khách mời</label><textarea id="guest-list" rows={5} required placeholder={'Nguyễn Văn A\nChị Minh Anh'} value={names} onChange={event=>setNames(event.target.value)}/><small>Mỗi khách một dòng, tối đa 100 khách mỗi lần. Tên đã lưu sẽ nhận lại link cũ.</small>
   <div className="builder-buttons"><button type="submit" disabled={busy||!token.trim()}>{busy?'Đang xử lý…':'Lưu và lấy link →'}</button><button type="button" disabled={busy||!token.trim()} onClick={()=>void request(false)}>Xem khách đã lưu</button></div>
   {error&&<p role="alert" className="builder-error">{error}</p>}<p className="builder-note">Link dùng mã ngẫu nhiên thay cho tên khách. Bất kỳ ai có link đều có thể xem thiệp tương ứng.</p>
  </form><section className="builder-results"><h2>{guests.length?`${guests.length} thiệp đã sẵn sàng`:'Link mời của bạn'}</h2>
   {guests.length?<><button onClick={()=>void copy(output)}>Sao chép tất cả</button><ul>{guests.map(guest=><li key={guest.id}><strong>{guest.name}</strong><div><a href={link(guest.id)} target="_blank" rel="noopener noreferrer">Xem thiệp ↗</a><button onClick={()=>void copy(link(guest.id))} aria-label={`Sao chép link cho ${guest.name}`}>Sao chép link</button></div></li>)}</ul><label htmlFor="link-output">Nội dung để gửi</label><textarea id="link-output" value={output} readOnly rows={7} onFocus={event=>event.target.select()}/></>:<p className="builder-empty">Nhập tên để tạo thiệp mới, hoặc chọn “Xem khách đã lưu” để lấy lại link.</p>}
   <p role="status" aria-live="polite">{message}</p>
  </section></div>
 </main>;
}
