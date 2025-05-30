import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import './CaractereFrappe.css'; // Assuming styles will be added here

interface CaractereFrappeProps {
  char: string;
  state: 'fresh' | 'dried'; // Add state prop
}

const keyPressSound =
  typeof Audio !== 'undefined' ? new Audio('/sounds/typewriter.mp3') : null;

const CaractereFrappe: React.FC<CaractereFrappeProps> = ({ char, state }) => {
  const charRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    // GSAP animation for the initial "hit" effect.
    // This animation should run when the component mounts (i.e., a new character appears).
    // The `key` prop of CaractereFrappe (charObj.id) ensures it remounts for new chars.
    if (charRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (keyPressSound) {
            keyPressSound.currentTime = 0;
            keyPressSound
              .play()
              .catch((error) =>
                console.error('Erreur de lecture audio (frappe):', error)
              );
          }
        },
      });

      const randomYStart = gsap.utils.random(-1, 1);
      const randomRotStart = gsap.utils.random(-3, 3);

      // Initial state for animation (invisible, slightly off)
      tl.set(charRef.current, {
        opacity: 0,
        scale: 0.8,
        y: randomYStart,
        color: '#000', // Start with a base color for impact
        fontWeight: 'normal',
        rotation: randomRotStart,
        textShadow: 'none',
      })
        // Animation part 1: Impact
        .to(charRef.current, {
          opacity: 1,
          scale: 1.2,
          y: -2 + randomYStart,
          fontWeight: '700', // Bolder on impact
          color: '#000000', // Dark on impact
          rotation: randomRotStart / 2,
          duration: 0.04,
          ease: 'sine.inOut',
        })
        // Animation part 2: Settle/recoil
        .to(charRef.current, {
          y: `+=${gsap.utils.random(0.5, 1.5)}`,
          scale: `-=0.05`,
          rotation: `-=${gsap.utils.random(1, 2)}`,
          duration: 0.04,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        })
        // Animation part 3: Finalize to "fresh" ink appearance.
        // The CSS classes .inkFresh / .inkDried will then control the ongoing state.
        .to(charRef.current, {
          scale: 1,
          y: 0,
          // fontWeight, color, textShadow will be controlled by CSS classes based on `state`
          // So GSAP should just ensure it's visible and positioned correctly.
          // The specific 'fresh' look will come from the .inkFresh class applied initially.
          fontWeight: 'normal', // Let CSS class take over from here
          color: '#000', // Let CSS class take over
          textShadow: 'none', // Let CSS class take over
          rotation: 0,
          duration: 0.3,
          ease: 'expo.out',
        });
    }
  }, []); // Empty dependency array: GSAP animation runs once on mount.

  const characterClassName = `caractere-frappe ${
    state === 'fresh' ? 'inkFresh' : 'inkDried'
  } ${char === ' ' ? 'space' : ''}`;

  // Use &nbsp; for space to ensure it takes up space
  const displayChar = char === ' ' ? '\u00A0' : char;

  return (
    <span ref={charRef} className={characterClassName}>
      {displayChar}
    </span>
  );
};

export default CaractereFrappe;
