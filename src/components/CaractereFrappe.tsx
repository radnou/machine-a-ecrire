import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import "./CaractereFrappe.css";

interface CaractereFrappeProps {
  char: string;
}

const keyPressSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/typewriter.mp3") : null;

const CaractereFrappe: React.FC<CaractereFrappeProps> = ({ char }) => {
  const charRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (charRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (keyPressSound) {
            keyPressSound.currentTime = 0;
            keyPressSound
              .play()
              .catch((error) =>
                console.error("Erreur de lecture audio (frappe):", error)
              );
          }
        },
      });

      const randomYStart = gsap.utils.random(-1, 1);
      const randomRotStart = gsap.utils.random(-3, 3);

      tl.set(charRef.current, {
        opacity: 0,
        scale: 0.8,
        y: randomYStart,
        color: "#000",
        fontWeight: "normal",
        rotation: randomRotStart,
      })
        .to(charRef.current, {
          opacity: 1,
          scale: 1.2,
          y: -2 + randomYStart,
          fontWeight: "700",
          color: "#000000",
          rotation: randomRotStart / 2,
          duration: 0.04,
          ease: "sine.inOut",
        })
        .to(charRef.current, {
          y: `+=${gsap.utils.random(0.5, 1.5)}`,
          scale: `-=0.05`,
          rotation: `-=${gsap.utils.random(1, 2)}`,
          duration: 0.04,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 1,
        })
        .to(charRef.current, {
          scale: 1,
          y: 0,
          fontWeight: "normal",
          color: "#000000",
          rotation: 0,
          duration: 0.3,
          ease: "expo.out",
        });
    }
  }, []);

  if (char === " ") {
    return (
      <span ref={charRef} className="caractere-frappe space">
        &nbsp;
      </span>
    );
  }

  return (
    <span ref={charRef} className="caractere-frappe">
      {char}
    </span>
  );
};

export default CaractereFrappe;
