'use client';
import { useEffect, useRef, useState } from 'react';

const musicUrl = '/audio/vung-ky-uc.mp3';
const backgroundVolume = 0.06;

export function useInvitationMusic() {
 const [playing, setPlaying] = useState(false);
 const [message, setMessage] = useState('');
 const audio = useRef<HTMLAudioElement | null>(null);
 const context = useRef<AudioContext | null>(null);
 const master = useRef<GainNode | null>(null);
 const wanted = useRef(false);
 const enabled = useRef(true);
 const disposed = useRef(false);
 const request = useRef(0);

 async function resume() {
  const currentRequest = ++request.current;
  try {
   if (!audio.current) {
    const media = new Audio();
    media.preload = 'none';
    media.loop = true;
    // A gain node also controls volume on iOS, where media.volume is ignored.
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(media).connect(gain);
    gain.connect(ctx.destination);
    audio.current = media;
    context.current = ctx;
    master.current = gain;
    media.src = musicUrl;
    media.onerror = () => {
     if (disposed.current) return;
     wanted.current = false;
     pause();
     setMessage('Không tải được nhạc. Chạm nút nhạc để thử lại.');
    };
   }
   const media = audio.current;
   const ctx = context.current!;
   // Both calls happen inside the gesture, before awaiting, for Safari.
   await Promise.all([ctx.resume(), media.play()]);
   if (disposed.current || currentRequest !== request.current) return;
   if (!wanted.current || document.hidden) { pause(); return; }
   const gain = master.current!.gain;
   gain.cancelScheduledValues(ctx.currentTime);
   gain.setValueAtTime(0, ctx.currentTime);
   gain.linearRampToValueAtTime(backgroundVolume, ctx.currentTime + 0.8);
   setPlaying(true);
   setMessage('');
  } catch {
   if (disposed.current || currentRequest !== request.current) return;
   wanted.current = false;
   pause();
   setMessage('Chạm nút nhạc để bật âm thanh.');
  }
 }
 function pause() {
  request.current++;
  audio.current?.pause();
  const ctx = context.current;
  if (ctx && master.current) {
   master.current.gain.cancelScheduledValues(ctx.currentTime);
   master.current.gain.setValueAtTime(0, ctx.currentTime);
  }
  setPlaying(false);
 }
 function toggle() {
  enabled.current = !wanted.current;
  wanted.current = enabled.current;
  if (wanted.current) void resume(); else pause();
 }
 function startOnOpen() {
  if (enabled.current && !wanted.current) { wanted.current = true; void resume(); }
 }
 useEffect(() => {
  disposed.current = false;
  const visibility = () => {
   if (document.hidden) pause(); else if (wanted.current) void resume();
  };
  document.addEventListener('visibilitychange', visibility);
  return () => {
   disposed.current = true;
   request.current++;
   document.removeEventListener('visibilitychange', visibility);
   const media = audio.current;
   if (media) {
    media.onerror = null;
    media.pause();
    media.removeAttribute('src');
    media.load();
   }
   const ctx = context.current;
   audio.current = null;
   context.current = null;
   master.current = null;
   if (ctx) void ctx.close().catch(() => {});
  };
 // Keep one audio player mounted across page flips.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);
 return { playing, message, toggle, startOnOpen };
}
