'use client';
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Cover, PortraitPage, DetailsPage, ThankYou, Emblem } from './Pages';
import { initialMotion, motionReducer, turnDuration, type View } from '@/lib/invitation-motion';
import { invitation, getMapUrl } from '@/lib/invitation-config';
import { getGuestName } from '@/lib/guest-links';
import PullToOpen from './PullToOpen';
import CosmicBackground from './CosmicBackground';
import { InitialEnvelope } from './InitialEnvelope';
import { useEnvelopeOpening } from './useEnvelopeOpening';
export default function Invitation() {
 const sceneRef=useRef<HTMLDivElement>(null);
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const [state, dispatch] = useReducer(motionReducer, initialMotion);
 const [size,setSize]=useState({scale:1,mobile:false,reduced:false});
 const [viewportReady,setViewportReady]=useState(false);
 const [topLeaf,setTopLeaf]=useState('left');
 const [settledView,setSettledView]=useState(0);
 useEffect(()=>{if(!state.busy)setSettledView(state.view)},[state.busy,state.view]);
 const navigate=(direction: -1 | 1)=>{if(state.busy||state.phase!=='reading')return;setTopLeaf(state.view===0||(state.view===1&&direction===-1)?'left':'right');dispatch({type:'NAVIGATE',direction,mobile:size.mobile});};
 const [guest,setGuest]=useState(invitation.guestName); const [map,setMap]=useState(false);
 useLayoutEffect(()=>{
   const safeAreaProbe=document.createElement('div');
   safeAreaProbe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
   document.body.appendChild(safeAreaProbe);
   const resize=()=>{
     const width=document.documentElement.clientWidth;
     const height=window.visualViewport?.height ?? innerHeight;
     const mobile=width<760;
     const safe=getComputedStyle(safeAreaProbe);
     const reserved=222+Math.max(8,parseFloat(safe.paddingTop)||0)+Math.max(10,parseFloat(safe.paddingBottom)||0);
     // Reserve header, navigation, replay and safe-area padding before sizing paper.
     const scale=mobile
       ? Math.max(.42,Math.min((width-16)/520,(height-reserved)/720,1))
       : Math.min((width-40)/1200,(height-40)/800,1.3);
     setSize({mobile,scale,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});
   };
   resize();setViewportReady(true);
   addEventListener('resize',resize);
   window.visualViewport?.addEventListener('resize',resize);
   setGuest(getGuestName(location.search,invitation.guestName));
   return()=>{safeAreaProbe.remove();removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);};
 },[]);
 const completeOpening=useCallback(()=>{dispatch({type:'ADVANCE'});dispatch({type:'ADVANCE'});dispatch({type:'ADVANCE'});},[]);
 useEnvelopeOpening(sceneRef,state.phase==='flap',size.mobile,size.reduced,completeOpening);
 useEffect(()=>{if(!state.busy||state.phase!=='reading')return;const timer=setTimeout(()=>dispatch({type:'FINISH_TURN'}),size.reduced?10:turnDuration);return()=>clearTimeout(timer)},[state.busy,state.phase,size.reduced]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(map||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();navigate(e.key==='ArrowRight'?1:-1)}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[map,size.mobile,state]);
 const reading=state.phase==='reading'; const spread=state.view===1||state.view===2;
 const chapters=['Lời mời','Dấu ấn','Hẹn gặp','Cảm ơn'];
 const chapterTitles=['Một lời mời dành riêng cho bạn','Những năm tháng đáng nhớ','Hẹn bạn ở ngày đặc biệt','Cảm ơn vì đã đồng hành'];
 const interactiveSpread=settledView===1||settledView===2;
 return <main className={`invitation-site ${size.mobile?'is-mobile':''} ${reading?'is-reading':'is-opening'} ${viewportReady?'viewport-ready':'viewport-pending'}`} style={{'--touch-target':`${44/size.scale}px`} as CSSProperties}>
 <CosmicBackground/>
 {!viewportReady&&<InitialEnvelope/>}
 {size.mobile&&viewportReady&&<><div className="mobile-atmosphere" aria-hidden="true"><i/><i/><i/><span>✦</span><span>✧</span><span>✦</span></div><header className="mobile-intro"><div className="mobile-edition"><span>HCMUT</span><span>GRADUATION · {invitation.year}</span></div><p className="mobile-eyebrow">{reading?`CHƯƠNG 0${state.view+1} / 04`:'MỘT CỘT MỐC · MỘT LỜI MỜI'}</p><h1>{reading?chapterTitles[state.view]:<>Gửi <em>{guest}</em>,<br/>một niềm vui đang chờ bạn.</>}</h1><div className="mobile-intro-rule"><span/>✦<span/></div></header></>}
 <div className="scene-space" inert={!viewportReady} aria-hidden={!viewportReady} style={{visibility:viewportReady?'visible':'hidden',width:(size.mobile?520:1200)*size.scale,height:(size.mobile?720:800)*size.scale}}><div ref={sceneRef} className={`scene phase-${state.phase} view-${state.view} top-${topLeaf} ${state.busy?'is-animating':''}`} style={{width:size.mobile?520:1200,transform:`scale(${size.scale})`}}>
 <div className="opening-shadow" aria-hidden="true"/><div className="envelope-back envelope-part"/><div className="envelope-flap envelope-part" aria-hidden="true"><svg viewBox="0 0 700 225" width="700" height="225"><defs><linearGradient id="flap-fill" x2="0.4" y2="1"><stop stopColor="#163b65"/><stop offset="1" stopColor="#071b3d"/></linearGradient></defs><path d="M1 1H699C694 50 686 66 650 86L370 214Q350 225 330 214L50 86C14 66 6 50 1 1Z" fill="url(#flap-fill)" stroke="#f3cf65" strokeWidth="2"/></svg></div>
 <div className="book-layer" inert={!reading} aria-hidden={!reading}>
 {size.mobile?<div className="mobile-book" onTouchStart={event=>{const target=event.target as HTMLElement;if(target.closest('button,a')||state.busy){touchStart.current=null;return;}const t=event.touches[0];touchStart.current={x:t.clientX,y:t.clientY};}} onTouchEnd={event=>{const start=touchStart.current;touchStart.current=null;if(!start||!reading||map)return;const t=event.changedTouches[0];const dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)navigate(dx<0?1:-1);}} onTouchCancel={()=>{touchStart.current=null;}}><div className="mobile-track" style={{transform:`translateX(${-480*state.view}px)`}}>{[<Cover guest={guest} key="cover"/>,<PortraitPage key="portrait"/>,<DetailsPage key="details" onMap={()=>setMap(true)}/>,<ThankYou key="thanks"/>].map((page,index)=><div key={index} className={`mobile-sheet ${state.view===index?'active':''}`} inert={state.view!==index} aria-hidden={state.view!==index}>{page}</div>)}</div></div>:<div className="book-position"><div className="book"><div className="leaf leaf-left"><div className="face face-front" inert={!interactiveSpread} aria-hidden={!interactiveSpread}><PortraitPage/></div><div className="face face-back" inert={settledView!==0} aria-hidden={settledView!==0}><Cover guest={guest}/></div></div><div className="leaf leaf-right"><div className="face face-front" inert={!interactiveSpread} aria-hidden={!interactiveSpread}><DetailsPage onMap={()=>setMap(true)}/></div><div className="face face-back" inert={settledView!==3} aria-hidden={settledView!==3}><ThankYou/></div></div></div></div>}
 </div>
 <div className="envelope-front envelope-part"><div className="envelope-copy"><p>THƯ MỜI</p><span>LỄ TỐT NGHIỆP</span></div><div className="envelope-wave"/></div><div className="seal envelope-part"><Emblem/></div>
 {state.phase==='sealed'&&<PullToOpen scale={size.scale} onOpen={()=>dispatch({type:'OPEN'})}/>}
 <nav className={`page-controls ${reading?'shown':''}`} inert={!reading} aria-label="Lật trang thiệp"><button aria-label="Trang trước" disabled={state.busy||state.view===0} onClick={()=>navigate(-1)}><ChevronLeft/></button><span>{spread&&!size.mobile?'02–03':`0${state.view+1}`} / 04</span><button aria-label="Trang tiếp theo" disabled={state.busy||state.view===3} onClick={()=>navigate(1)}><ChevronRight/></button></nav>
 {size.mobile&&reading&&<p className="swipe-hint">Vuốt sang trái hoặc phải để lật trang</p>}
 </div></div>
 {size.mobile&&viewportReady&&<footer className="mobile-journey">{reading?<><nav aria-label="Hành trình thiệp mời" className="journey-tabs">{chapters.map((chapter,index)=><button key={chapter} aria-label={`Trang ${index+1}: ${chapter}`} aria-current={state.view===index?'step':undefined} disabled={state.busy} onClick={()=>dispatch({type:'GO_TO',view:index as View})}><span>0{index+1}</span>{chapter}</button>)}</nav><div className="journey-actions"><button aria-label="Trang trước" disabled={state.busy||state.view===0} onClick={()=>navigate(-1)}><ChevronLeft/></button>{state.view<3?<button className="journey-next" disabled={state.busy} onClick={()=>navigate(1)}>{state.view===0?'Khám phá hành trình':state.view===1?'Thông tin buổi lễ':'Một lời cảm ơn'}<ChevronRight size={18}/></button>:<button className="journey-next" onClick={()=>setMap(true)}><MapPin size={18}/>Hẹn gặp tại buổi lễ</button>}</div><p className="journey-hint">Vuốt nhẹ để tiếp tục câu chuyện</p></>:<div className="mobile-event-stamp"><span>NGÀY ĐẶC BIỆT</span><strong>{invitation.ceremonyDate}</strong><p>{invitation.venue} · Bách khoa</p><small className="cosmic-hint">Chạm vào khoảng trời để thắp một vì sao ✦</small></div>}</footer>}
 {reading&&<button className="replay-button" disabled={state.busy} onClick={()=>{setTopLeaf('left');dispatch({type:'REPLAY'});}}><RotateCcw size={15}/> Xem lại từ đầu</button>}
 <Dialog open={map} onOpenChange={setMap}><DialogContent className="map-dialog"><DialogTitle>Hẹn gặp bạn tại Hội trường A5</DialogTitle><DialogDescription>Trường Đại học Bách khoa · Thành phố Hồ Chí Minh</DialogDescription><div className="map-illustration"><MapPin size={64}/></div><p>Bản đồ sẽ mở kết quả tìm kiếm địa điểm. Vị trí ghim chính xác sẽ được cập nhật cùng thông tin buổi lễ.</p><a className="map-link" href={getMapUrl()} target="_blank" rel="noopener noreferrer">Mở Google Maps ↗</a></DialogContent></Dialog>
 </main>;
}
