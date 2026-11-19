'use client';
import { useState } from 'react';
import { MapPin, Hospital, Landmark, CircleParking, ArrowUpRight, Footprints } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { parkingPlaces, parkingMapUrl } from '@/lib/parking';
export default function ParkingGuide() {
 const [selected,setSelected]=useState(0);const [loaded,setLoaded]=useState(false);
 const place=parkingPlaces[selected];
 return <>
  <div className="parking-heading"><CircleParking aria-hidden="true"/><div><DialogTitle>Gửi xe & đến buổi lễ</DialogTitle><DialogDescription>Chọn một địa điểm để xem bản đồ và hướng dẫn.</DialogDescription></div></div>
  <div className="parking-steps" aria-label="Các bước đến buổi lễ"><span><CircleParking size={18}/>Chọn nơi gửi xe</span><i>→</i><span><Footprints size={18}/>Đến trường</span><i>→</i><span><MapPin size={18}/>Khoa Khoa học và Kỹ thuật Máy tính - Toà A3</span></div>
  <div className="parking-layout"><div className="parking-options" role="group" aria-label="Địa điểm gửi xe">{parkingPlaces.map((item,index)=>{
   const Icon=item.kind==='hospital'?Hospital:item.kind==='stadium'?Landmark:CircleParking;
   return <button key={item.id} type="button" aria-pressed={selected===index} onClick={()=>{if(index!==selected){setLoaded(false);setSelected(index);}}} className={selected===index?'selected':''}><span className={`parking-place-icon ${item.kind}`}><Icon size={26} aria-hidden="true"/>{item.kind==='gate'&&<b>{item.id.replace('gate-', '')}</b>}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="parking-choice-dot" aria-hidden="true"/></button>;
  })}</div><section className="parking-map-panel" aria-label={`Bản đồ ${place.title}`}>
   <div className="parking-map-frame">{!loaded&&<p className="parking-loading" role="status">Đang tải bản đồ…</p>}<iframe key={place.id} title={`Bản đồ tìm kiếm ${place.title}`} src={parkingMapUrl(place.query,true)} loading="lazy" referrerPolicy="no-referrer" onLoad={()=>setLoaded(true)} allowFullScreen/></div>
   <div className="parking-selected"><span className="parking-kicker">ĐỊA ĐIỂM ĐANG CHỌN</span><h3>{place.title}</h3><p>{place.note}</p><a className="map-link" href={parkingMapUrl(place.query)} target="_blank" rel="noopener noreferrer">Mở Google Maps <ArrowUpRight size={18}/></a></div>
  </section></div>
  <p className="parking-note">Bản đồ tìm theo tên địa điểm, chưa phải ghim chính xác lối vào bãi xe. Việc nhận xe, phí và giờ lấy xe theo hướng dẫn tại chỗ. Nếu bản đồ không tải, bạn vẫn có thể chọn “Mở Google Maps”.</p>
 </>;
}
