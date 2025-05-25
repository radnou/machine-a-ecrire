// Dans src/components/CaractereFrappe.tsx
import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import "./CaractereFrappe.css";

interface CaractereFrappeProps {
  char: string;
}

const keyPressSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/typewriter.mp3")
    : null;

const CaractereFrappe: React.FC<CaractereFrappeProps> = ({ char }) => {
  const charRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (charRef.current) {
      // Créons une timeline GSAP pour un effet d'impact plus contrôlé
      const tl = gsap.timeline({
        onComplete: () => {
          // Jouer le son à la fin de la séquence d'impact
          if (keyPressSound) {
            keyPressSound.currentTime = 0;
            keyPressSound
              .play()
              .catch((error) =>
                console.error("Erreur de lecture audio:", error)
              );
          }
        },
      });

      // 1. Phase d'apparition / impact initial (très rapide)
      tl.fromTo(
        charRef.current,
        {
          // État initial (invisible ou juste sur le point d'apparaître)
          opacity: 0,
          scale: 0.7, // Commence un peu plus petit
          y: 2, // Peut-être légèrement en dessous, comme si ça venait d'en bas
          fontWeight: "normal",
        },
        {
          // Au moment de l'impact
          opacity: 1,
          scale: 1.15, // Surdimensionne légèrement pour marquer le "coup"
          y: 0,
          fontWeight: "bold", // Plus gras à l'impact
          color: "#1A1A1A", // Encre un peu plus foncée/fraîche à l'impact
          duration: 0.07, // Très court et percutant
          ease: "power1.out",
        }
      )
        // 2. Phase de stabilisation / "rebond"
        .to(charRef.current, {
          scale: 1, // Revient à la taille normale
          fontWeight: "normal",
          color: "#000000", // Couleur d'encre finale
          duration: 0.15, // Un peu plus long pour se stabiliser
          ease: "back.out(1.7)", // Un effet "back.out" peut donner un joli rebond naturel
          // Ou essaie 'elastic.out(1, 0.7)' pour un effet différent
        });
    }
  }, []);

  if (char === " ") {
    // Pour l'espace, on ne veut peut-être pas une animation aussi prononcée,
    // ou juste une animation d'opacité simple, ou pas d'animation du tout.
    // Pour l'instant, il hérite de l'animation. On pourra le customiser.
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
