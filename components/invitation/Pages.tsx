'use client';
import { CalendarDays, GraduationCap, MapPin, Phone, CircleParking, Image as ImageIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { invitation as info } from '@/lib/invitation-config';

export function Emblem({ className = '' }: { className?: string }) {
  return <img className={`emblem ${className}`} src="/assets/bk-official.svg" width="76" height="84" alt="Bách khoa TP.HCM" draggable={false} />;
}
function Identity() { return <header className="identity"><Emblem /><p>{info.university}</p><strong>{info.school}</strong></header>; }
export function Ribbon() {
  const id = useId().replace(/:/g, '');
  return <div className="ribbons" aria-hidden="true"><svg viewBox="0 0 960 64" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d60c23"/><stop offset="1" stopColor="#900b1c"/></linearGradient>
      <linearGradient id={`${id}-gold`}><stop stopColor="#bd8b32"/><stop offset=".35" stopColor="#ffe9a1"/><stop offset=".7" stopColor="#e8bb54"/><stop offset="1" stopColor="#fff0b3"/></linearGradient>
    </defs>
    <path d="M0 8 Q240 13 480 39 Q720 13 960 8 V64 H0Z" fill={`url(#${id}-red)`}/>
    <path d="M0 9 Q240 14 480 40 Q720 14 960 9" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="2"/>
    <path d="M0 57 Q420 55 960 20 V64 H0Z" fill="#b70820"/>
    <path d="M0 57 Q420 55 960 20" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="3"/>
  </svg></div>;
}
function Divider() { return <div className="ornament" aria-hidden="true"><span /><GraduationCap strokeWidth={1.3} /><span /></div>; }
export function Cover({ guest }: { guest: string }) {
  return <article className="paper paper-cover"><div className="paper-border" aria-hidden="true" /><Identity />
    <div className="cover-title"><h1>THƯ MỜI</h1><p>DỰ LỄ TỐT NGHIỆP</p></div><div className="tiny-rule" aria-hidden="true" />
    <div className="guest-block"><p className="eyebrow">TRÂN TRỌNG KÍNH MỜI</p><p className="calligraphy guest-name" style={{fontSize:Array.from(guest).length>40?26:Array.from(guest).length>25?33:undefined}}>{guest}</p></div><div className="dotted-rule" aria-hidden="true" />
    <div className="graduate-block"><p className="eyebrow">ĐẾN THAM DỰ</p><h2>LỄ TỐT NGHIỆP</h2><p className="eyebrow">CỦA</p><p className="calligraphy graduate-name">{info.graduateName}</p></div><Divider />
    <div className="cover-venue"><p className="ceremony-date">{info.ceremonyDate}</p><p>{info.venue}</p><p>{info.school}</p></div><p className="welcome">Hân hạnh đón tiếp bạn!</p><Ribbon />
  </article>;
}
export function PortraitPage() {
  const [imageFailed, setImageFailed] = useState(false);
  return <article className="paper paper-portrait"><div className="paper-border" aria-hidden="true" /><h2 className="page-heading">Dấu ấn một hành trình</h2><Divider />
    <div className="portrait-composition"><div className="portrait-frame">{info.portraitUrl && !imageFailed ? <img src={info.portraitUrl} alt={`Ảnh tốt nghiệp của ${info.graduateName}`} onError={() => setImageFailed(true)} /> : <div className="portrait-placeholder"><ImageIcon size={44} strokeWidth={1} /><span>Ảnh chân dung của bạn</span></div>}</div><div className="sash" aria-label="Sash Bách khoa xanh ngọc"><div className="sash-pattern" /><Emblem /></div></div>
    <p className="calligraphy graduate-name">{info.graduateName}</p><p className="faculty">{info.faculty}</p><p className="welcome">Một hành trình đáng nhớ</p><span className="printed-page">02</span><Ribbon />
  </article>;
}
export function DetailsPage({ onMap, onParking }: { onMap: () => void; onParking: () => void }) {
  return <article className="paper paper-details"><div className="paper-border" aria-hidden="true" /><Identity /><h2 className="page-heading">Thông tin buổi lễ</h2><Divider />
    <div className="event-details"><section className="detail-row"><CalendarDays /><div><h3>THỜI GIAN</h3><p>{info.ceremonyDate}{info.ceremonyTime ? ` · ${info.ceremonyTime}` : ''}</p><small>{info.ceremonyTime ? info.ceremonyNote : 'Giờ tham dự sẽ được cập nhật'}</small></div></section>
      <section className="detail-row"><MapPin /><div><h3>ĐỊA ĐIỂM</h3><p>{info.venue}</p><p>{info.school}</p></div></section>
      <section className="detail-row"><Phone /><div><h3>LIÊN HỆ</h3><p>{info.graduateName}</p>{info.phone ? <a href={`tel:${info.phone.replace(/[^+\d]/g, '')}`}>{info.phone}</a> : <small>Số điện thoại sẽ được cập nhật</small>}</div></section></div>
    <div className="details-actions"><Button variant="outline" className="gold-button" onClick={onMap}><MapPin size={18} />Chỉ đường</Button><Button variant="outline" className="gold-button" onClick={onParking}><CircleParking size={18} />Chỗ gửi xe</Button><p>Cổng 1 · 3 · Trưng Vương · Phú Thọ</p></div><span className="printed-page">03</span><Ribbon />
  </article>;
}
export function ThankYou({ guest }: { guest: string }) {
  return <article className="paper paper-thanks"><div className="paper-border" aria-hidden="true" /><Identity /><h2>Cảm ơn bạn!</h2><p className="thanks-subtitle">Vì đã là một phần<br />của hành trình này</p><Divider />
    <p className="thanks-message">Cảm ơn những yêu thương,<br />sự đồng hành và lời chúc tốt đẹp.<br />Mong được gặp bạn<br />trong ngày đặc biệt của mình.</p><p className="calligraphy graduate-name thanks-guest" style={{fontSize:Array.from(guest).length>40?26:Array.from(guest).length>25?33:undefined}}>{guest}</p><p className="closing-note">Hẹn gặp bạn tại lễ tốt nghiệp!</p><Ribbon />
  </article>;
}
