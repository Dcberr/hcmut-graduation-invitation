'use client';
import { useLayoutEffect, type RefObject } from 'react';

/** One shared clock: no chained React renders between the opening gestures. */
export function useEnvelopeOpening(
  scene: RefObject<HTMLDivElement | null>,
  opening: boolean,
  mobile: boolean,
  reduced: boolean,
  onComplete: () => void,
) {
  useLayoutEffect(() => {
    if (!opening || !scene.current) return;
    const root = scene.current;
    const animations: Animation[] = [];
    let cancelled = false;
    const duration = reduced ? 1 : 3000;
    const timing: KeyframeAnimationOptions = { duration, fill: 'forwards', easing: 'linear' };
    const animate = (selector: string, frames: Keyframe[]) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (element) animations.push(element.animate(frames, timing));
    };
    const small = mobile ? .34 : .54;
    const rest = `translate3d(0,${mobile ? -60 : 20}px,0) scale(${small}) rotateY(0deg)`;
    animate('.seal', [
      { offset: 0, transform: 'translate3d(0,0,0) scale(1)', opacity: 1, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { offset: .16, transform: 'translate3d(0,-24px,0) scale(1.07)', opacity: .9 },
      { offset: .27, transform: 'translate3d(0,-42px,0) scale(1.12)', opacity: 0 },
      { offset: 1, transform: 'translate3d(0,-42px,0) scale(1.12)', opacity: 0 },
    ]);
    const envelope: Keyframe[] = [
      { offset: 0, transform: 'translate3d(0,0,0)', opacity: 1 },
      { offset: .16, transform: 'translate3d(0,0,0)', opacity: 1, easing: 'cubic-bezier(.4,0,.6,1)' },
      { offset: .43, transform: 'translate3d(0,64px,0)', opacity: 1, easing: 'cubic-bezier(.4,0,.3,1)' },
      { offset: .76, transform: 'translate3d(0,440px,0)', opacity: 0 },
      { offset: 1, transform: 'translate3d(0,650px,0)', opacity: 0 },
    ];
    animate('.envelope-front', envelope);
    animate('.envelope-back', envelope);
    animate('.envelope-flap', [
      { offset: 0, transform: 'perspective(1400px) translateY(0px) rotateX(0deg)', opacity: 1, zIndex: 4 },
      { offset: .09, transform: 'perspective(1400px) translateY(0px) rotateX(0deg)', opacity: 1, zIndex: 4, easing: 'cubic-bezier(.4,0,.2,1)' },
      { offset: .27, transform: 'perspective(1400px) translateY(30px) rotateX(92deg)', opacity: 1, zIndex: 4 },
      { offset: .271, transform: 'perspective(1400px) translateY(30px) rotateX(92deg)', opacity: 1, zIndex: 1, easing: 'cubic-bezier(.2,.6,.4,1)' },
      { offset: .43, transform: 'perspective(1400px) translateY(64px) rotateX(168deg)', opacity: 1, zIndex: 1, easing: 'cubic-bezier(.4,0,.3,1)' },
      { offset: .76, transform: 'perspective(1400px) translateY(440px) rotateX(168deg)', opacity: 0, zIndex: 1 },
      { offset: 1, transform: 'perspective(1400px) translateY(650px) rotateX(168deg)', opacity: 0, zIndex: 1 },
    ]);
    animate('.book-layer', [
      { offset: 0, transform: rest },
      { offset: .22, transform: rest, easing: 'cubic-bezier(.4,0,.55,1)' },
      { offset: .43, transform: `translate3d(0,-85px,0) scale(${small}) rotateY(0deg)`, easing: 'cubic-bezier(.25,.1,.2,1)' },
      // Matching transform lists preserve the complete 0 → 360 degree turn.
      // Rotation and growth share one easing curve and settle together.
      { offset: 1, transform: 'translate3d(0,0,0) scale(1) rotateY(-360deg)' },
    ]);
    animate('.opening-shadow', [
      { offset: 0, opacity: .35, transform: 'translateX(-50%) scale(1)' },
      { offset: .45, opacity: .2, transform: 'translateX(-50%) scale(.85)' },
      { offset: .8, opacity: 0, transform: 'translateX(-50%) scale(1.2)' },
      { offset: 1, opacity: 0, transform: 'translateX(-50%) scale(1.2)' },
    ]);
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (!cancelled) onComplete();
    }).catch(() => { /* Replay/unmount cancels the owned timeline. */ });
    return () => { cancelled = true; animations.forEach(animation => animation.cancel()); };
  }, [scene, opening, mobile, reduced, onComplete]);
}
