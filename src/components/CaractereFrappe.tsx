// Dans src/components/CaractereFrappe.tsx
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import "./CaractereFrappe.css";

interface CaractereFrappeProps {
  char: string;
}

const keyPressSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/typewriter.mp3") // Assure-toi que c'est le bon son
    : null;

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

      tl.set(charRef.current, {
        // État initial avant toute animation (invisible)
        opacity: 0,
        scale: 1, // Commence à taille normale mais invisible
        y: 0,
        color: "#000", // Couleur d'encre finale
        fontWeight: "normal",
      })
        .to(charRef.current, {
          // Apparition très rapide et "impact"
          opacity: 1,
          scale: 1.25, // Surdimensionnement pour le "coup"
          y: -3, // Léger soulèvement/enfoncement
          fontWeight: "bold",
          color: "#101010", // Encre très fraîche/foncée
          duration: 0.06, // Impact très bref
          ease: "power2.inOut", // Rapide et direct
          // Optionnel : une rotation infime pour l'impact
          // rotation: gsap.utils.random(-1.5, 1.5),
        })
        .to(charRef.current, {
          // Stabilisation / "rebond" après l'impact
          scale: 1,
          y: 0,
          fontWeight: "normal",
          color: "#000000", // Couleur d'encre finale
          // rotation: 0, // Remettre la rotation à 0 si utilisée
          duration: 0.3, // Laisser un peu de temps pour se stabiliser
          ease: "elastic.out(1, 0.6)", // Effet élastique pour la stabilisation
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