import React from "react";
import "./MainLayout.css"; // Importe les styles que nous venons de créer

// Importer les futurs composants (pour l'instant, des placeholders)
// import TopMenu from '../TopBar/TopMenu';
// import LeftSidebar from '../Sidebars/LeftSidebar';
// import MainContentArea from '../Editor/MainContentArea'; // Ou directement ton FeuillePapier adapté
// import RightSidebar from '../Sidebars/RightSidebar';
// import BottomBar from '../StatusBar/BottomBar';

// Pour l'instant, nous allons utiliser des divs simples pour visualiser les zones
// et nous intégrerons le FeuillePapier (adapté) dans MainContentArea.

// Importe ton composant FeuillePapier existant (qui deviendra la zone d'écriture)
import FeuillePapier from "../Paper/FeuillePapier"; // Assure-toi que le chemin est correct

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <div className="layout-top-menu">
        {/* Placeholder pour TopMenu */}
        Mini Menu (Ouvrir, Enregistrer, etc.)
      </div>

      <div className="layout-left-sidebar">
        {/* Placeholder pour LeftSidebar */}
        Barre Latérale Gauche (Fichiers Récents, Dossiers)
      </div>

      <main className="layout-main-content">
        {/* Ici, nous allons intégrer notre effet machine à écrire.
            FeuillePapier doit être adapté pour s'insérer ici
            et ne plus gérer le viewport complet de la machine.
            Pour l'instant, on le met directement.
            Il faudra peut-être l'encapsuler dans un MainContentArea.
        */}
        <FeuillePapier />
      </main>

      <div className="layout-right-sidebar">
        {/* Placeholder pour RightSidebar */}
        Barre Latérale Droite (Plan du Document)
      </div>

      <div className="layout-bottom-bar">
        {/* Placeholder pour BottomBar */}
        <span>Stats (Mots, Caractères...)</span>
        <span>Temps passé</span>
      </div>
    </div>
  );
};

export default MainLayout;
