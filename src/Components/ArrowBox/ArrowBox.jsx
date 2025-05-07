import React from 'react';
import './ArrowBox.css';

const ArrowBox = ({ link = '/' }) => {
  const handleClick = () => {
    window.location.href = link;
  };

  return (
    <div className="arrow-box" onClick={handleClick}>
      <span className="arrow-box-text">mais salas</span>
      <span className="arrow-box-arrow">➜</span>
    </div>
  );
};

export default ArrowBox;
