import React from 'react';
import styles from '../chatbot.module.css';

const Header = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className={styles.header}>
      <button onClick={() => window.location.href = '/'}>Home</button>
      {/* <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button> */}
    </div>
  );
};

export default Header;
