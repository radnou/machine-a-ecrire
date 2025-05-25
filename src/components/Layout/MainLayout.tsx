import React, { useState, useEffect } from "react";
import "./MainLayout.css";
import TopMenu from "../TopBar/TopMenu";
import LeftSidebar from "../Sidebars/LeftSidebar";
import RightSidebar from "../Sidebars/RightSidebar";
import BottomBar from "../StatusBar/BottomBar";
import FeuillePapier, {
  CharObject as FeuilleCharObject,
} from "../Paper/FeuillePapier"; // Importer CharObject

const MainLayout: React.FC = () => {
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);

  // États pour le contenu du fichier et les statistiques
  const [currentFileContentString, setCurrentFileContentString] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState<string | undefined>(
    undefined
  );
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [spaceCount, setSpaceCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState("0m"); // À implémenter

  // Callback pour FeuillePapier pour mettre à jour les stats et le contenu
  const handleTextChange = (allLines: FeuilleCharObject[][]) => {
    let text = "";
    let chars = 0;
    let spaces = 0;
    allLines.forEach((line) => {
      line.forEach((charObj) => {
        text += charObj.char;
        chars++;
        if (charObj.char === " ") spaces++;
        // Saut de ligne compte comme 1 caractère pour la frappe mais pas dans tous les compteurs
        // Ici on le compte car il est dans allLines
        else if (charObj.char === "\n") chars++;
      });
      if (allLines.indexOf(line) < allLines.length - 1 && line.length > 0) {
        // Ne pas ajouter \n pour la dernière ligne si elle est vide
        // text += '\n'; // Géré par FeuillePapier
      }
    });

    const rawTextForCounting = allLines
      .flat()
      .map((c) => (c.char === "\n" ? " " : c.char))
      .join("");
    setCurrentFileContentString(rawTextForCounting); // Ou une version plus propre du texte
    setCharCount(rawTextForCounting.length);
    setWordCount(rawTextForCounting.split(/\s+/).filter(Boolean).length);
    setSpaceCount(spaces);
  };

  const handleFileOpened = (content: string, path: string) => {
    // Convertir le string en CharObject[][] pour FeuillePapier
    // Ceci est une simplification, FeuillePapier devrait pouvoir prendre un string initial
    const lines = content.split("\n");
    const newAllLines: FeuilleCharObject[][] = lines.map((line) =>
      line.split("").map((char) => ({ id: `loaded-${Math.random()}`, char }))
    );
    // TODO: Mettre à jour l'état de FeuillePapier pour afficher ce nouveau contenu.
    // Pour l'instant, on met à jour les stats basées sur le contenu brut.
    setCurrentFileContentString(content);
    setCurrentFilePath(path);
    setCharCount(content.length);
    setWordCount(content.split(/\s+/).filter(Boolean).length);
    setSpaceCount((content.match(/ /g) || []).length);
    // Idéalement, FeuillePapier prendrait une prop `initialContent` ou une méthode pour le charger.
    console.log(
      "Contenu du fichier chargé, transmis à FeuillePapier (simulé)",
      newAllLines
    );
  };

  const mainLayoutGridStyle = {
    gridTemplateColumns: `${isLeftSidebarVisible ? "240px" : "0px"} 1fr ${
      isRightSidebarVisible ? "200px" : "0px"
    }`,
    gridTemplateAreas: `
      "top-menu top-menu top-menu"
      "left-sidebar main-content right-sidebar"
      "bottom-bar bottom-bar bottom-bar"
    `,
  };

  return (
    <div className="main-layout" style={mainLayoutGridStyle}>
      <TopMenu
        onToggleLeftSidebar={() =>
          setIsLeftSidebarVisible(!isLeftSidebarVisible)
        }
        onToggleRightSidebar={() =>
          setIsRightSidebarVisible(!isRightSidebarVisible)
        }
        isLeftSidebarVisible={isLeftSidebarVisible}
        isRightSidebarVisible={isRightSidebarVisible}
        currentFileContent={currentFileContentString}
        onFileOpened={handleFileOpened}
      />

      <LeftSidebar isVisible={isLeftSidebarVisible} />

      <main className="layout-main-content">
        {/* FeuillePapier doit maintenant accepter une prop pour son contenu initial et une pour remonter les changements */}
        <FeuillePapier
          key={currentFilePath || "new-file"} // Pour forcer le re-render si le fichier change
          // initialContent={currentFileContentString} // À implémenter dans FeuillePapier
          onTextChange={handleTextChange} // À implémenter dans FeuillePapier
        />
      </main>

      <RightSidebar isVisible={isRightSidebarVisible} />

      <BottomBar
        charCount={charCount}
        wordCount={wordCount}
        spaceCount={spaceCount}
        timeSpent={timeSpent}
      />
    </div>
  );
};

export default MainLayout;
