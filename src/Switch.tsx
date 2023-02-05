import React from 'react';
import styles from './Switch.module.css';

const Switch = ({ isOn, handleToggle }: {isOn: boolean, handleToggle: () => void}) => {
  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles.switchCheckbox}
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        className={styles.switchLabel}
        htmlFor={`react-switch-new`}
      >
        <span className={styles.switchButton} />
      </label>
    </>
  );
};

export default Switch;