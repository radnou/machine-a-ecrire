// Dans src/components/CaractereFrappe.tsx
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import "./CaractereFrappe.css";

interface CaractereFrappeProps {
  char: string;
}

// Pré-charger l'audio pour une meilleure réactivité (une seule instance)
// On pourrait aussi gérer un pool d'objets Audio pour éviter des coupures si on tape très vite
const keyPressSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/typewriter.mp3")
    : null;
// Assure-toi que le chemin '/sounds/typewriter.mp3' correspond à l'emplacement dans ton dossier public

const CaractereFrappe: React.FC<CaractereFrappeProps> = ({ char }) => {
  const charRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (charRef.current) {
      gsap.fromTo(
        charRef.current,
        {
          opacity: 0,
          scale: 2.5,
          y: -10,
          color: "#333",
          fontWeight: "bold",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          color: "#000",
          fontWeight: "normal",
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            if (keyPressSound) {
              keyPressSound.currentTime = 0; // Permet de rejouer le son rapidement
              keyPressSound
                .play()
                .catch((error) =>
                  console.error("Erreur de lecture audio:", error)
                );
            }
          },
        }
      );
    }
  }, []); // L'animation se joue une seule fois

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
