import React from "react";
import "./RightSidebar.css";

interface RightSidebarProps {
  isVisible: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <aside className={`right-sidebar ${isVisible ? "" : "hidden"}`}>
      <div className="sidebar-section">
        <h4>Plan du Document</h4>
        <ul>
          <li>H1 Titre Principal</li>
          <li style={{ paddingLeft: "15px" }}>H2 Section A</li>
          <li style={{ paddingLeft: "15px" }}>H2 Section B</li>
          <li style={{ paddingLeft: "30px" }}>H3 Sous-section B.1</li>
        </ul>
      </div>
    </aside>
  );
};

export default RightSidebar;
