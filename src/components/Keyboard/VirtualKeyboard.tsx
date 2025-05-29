import React from 'react';
import styles from './VirtualKeyboard.module.css';

interface VirtualKeyboardProps {
  isVisible: boolean;
  onKeyPress: (key: string) => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isVisible, onKeyPress }) => {
  const row1 = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
  const row3 = ['W', 'X', 'C', 'V', 'B', 'N']; // Shift might go here or on its own row
  const utilityKeys = ['Shift', 'Backspace', 'Enter']; // Example, layout can be refined
  const spaceBar = ['Space'];

  const handleKeyClick = (key: string) => {
    // For 'Shift', we might eventually toggle a state, but for now,
    // it can either do nothing or pass 'Shift' if that's desired.
    // The requirement says "might not call onKeyPress directly".
    // For this initial version, let's make it call onKeyPress for all defined keys.
    onKeyPress(key);
  };

  if (!isVisible) {
    return null; // Or use styles.hidden on the container if preferred for layout reasons
  }

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboardRow}>
        {row1.map((key) => (
          <button key={key} className={styles.keyButton} onClick={() => handleKeyClick(key)}>
            {key}
          </button>
        ))}
      </div>
      <div className={styles.keyboardRow}>
        {row2.map((key) => (
          <button key={key} className={styles.keyButton} onClick={() => handleKeyClick(key)}>
            {key}
          </button>
        ))}
      </div>
      <div className={styles.keyboardRow}>
        {/* Example of adding a special key like Shift to a row */}
        <button 
            key="ShiftLeft" 
            className={`${styles.keyButton} ${styles.shiftKey}`} 
            onClick={() => handleKeyClick('Shift')}
        >
            Shift
        </button>
        {row3.map((key) => (
          <button key={key} className={styles.keyButton} onClick={() => handleKeyClick(key)}>
            {key}
          </button>
        ))}
         <button 
            key="Backspace" 
            className={`${styles.keyButton} ${styles.backspaceKey}`} 
            onClick={() => handleKeyClick('Backspace')}
        >
            Backspace
        </button>
      </div>
      <div className={styles.keyboardRow}>
        <button 
            key="Enter" 
            className={`${styles.keyButton} ${styles.enterKey}`} 
            onClick={() => handleKeyClick('Enter')}
        >
            Enter
        </button>
        <button 
            key="Space" 
            className={`${styles.keyButton} ${styles.spaceKey}`} 
            onClick={() => handleKeyClick('Space')}
        >
            Space
        </button>
        {/* Other utility keys can be added here or arranged differently */}
      </div>
    </div>
  );
};

export default VirtualKeyboard;
