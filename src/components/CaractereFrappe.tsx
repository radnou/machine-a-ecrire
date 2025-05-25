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

      // --- Variante 1 : Impact plus "élastique" et enfoncement ---
      tl.fromTo(
        charRef.current,
        { // État juste avant l'impact visible
          opacity: 0,
          scale: 0.5,      // Commence plus petit
          y: 5,            // Vient d'un peu plus bas
          color: "#444",   // Couleur d'encre "non pressée"
          fontWeight: "normal",
          // rotation: gsap.utils.random(-3, 3), // Optionnel: légère rotation initiale
        },
        { // Impact
          opacity: 1,
          scale: 1.2,      // Surdimensionnement plus important
          y: -2,           // Remonte et "enfonce" légèrement le papier
          fontWeight: "bold",
          color: "#000",    // Encre noire vive à l'impact
          duration: 0.08,   // Durée de l'impact
          ease: "elastic.out(1, 0.4)", // Un "claquement" élastique
          // rotation: 0, // Optionnel: revient droit
        }
      )
      // Stabilisation (laisse le temps à l'effet élastique de se résoudre)
      .to(charRef.current, {
        scale: 1,
        y: 0, // Assure qu'il revient bien sur la ligne de base
        color: "#000000",
        fontWeight: "normal",
        duration: 0.25, // Durée pour que l'élasticité se calme
        ease: "power2.out",
      });

      // --- Variante 2 : Impact plus "sec" avec un text-shadow (plus subtil) ---
      // Décommente cette partie pour tester et commente la Variante 1
      /*
      tl.fromTo(
        charRef.current,
        { // État initial
          opacity: 0,
          scale: 1, // Commence à taille normale mais invisible
          y: 0,
        },
        { // Impact
          opacity: 1,
          scale: 1, // Pas de changement de taille, mais...
          duration: 0.03, // Extrêmement rapide
          ease: "none",
          // Simuler un léger "enfoncement" avec une ombre très brève
          textShadow: "0px 1px 1px rgba(0,0,0,0.5)", 
          color: "#111",
          fontWeight: "bold",
        }
      )
      // Stabilisation
      .to(charRef.current, {
        textShadow: "none", // Enlève l'ombre
        color: "#000000",
        fontWeight: "normal",
        duration: 0.1,
        ease: "power1.out",
      });
      */
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