import React from 'react';
import './RightSidebar.css';

interface RightSidebarProps {
  isVisible: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  // Données statiques pour l'instant
  const documentOutline = [
    { id: 'h1-1', level: 1, text: 'Titre Principal du Document' },
    { id: 'h2-1', level: 2, text: 'Section A - Introduction' },
    { id: 'h2-2', level: 2, text: 'Section B - Développement' },
    { id: 'h3-1', level: 3, text: 'Sous-section B.1' },
    { id: 'h3-2', level: 3, text: 'Sous-section B.2' },
    { id: 'h2-3', level: 2, text: 'Section C - Conclusion' },
  ];

  return (
    <aside className={`right-sidebar ${isVisible ? '' : 'hidden'}`}>
      <div className="sidebar-section">
        <h4>Plan du Document</h4>
        <ul>
          {documentOutline.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - 1) * 15}px` }}
            >
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default RightSidebar;
