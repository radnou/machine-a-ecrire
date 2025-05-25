import React, { useState, useEffect } from "react";
import "./MainLayout.css";
import TopMenu from "../TopBar/TopMenu";
import LeftSidebar from "../Sidebars/LeftSidebar";
import RightSidebar from "../Sidebars/RightSidebar";
import BottomBar from "../StatusBar/BottomBar";
import FeuillePapier from "../Paper/FeuillePapier";

const MainLayout: React.FC = () => {
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);

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
      />

      <LeftSidebar isVisible={isLeftSidebarVisible} />

      <main className="layout-main-content">
        <FeuillePapier />
      </main>

      <RightSidebar isVisible={isRightSidebarVisible} />

      <BottomBar />
    </div>
  );
};

export default MainLayout;
