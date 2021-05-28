import React from 'react';
import './Aircraft.scss';

export default ({
  aircraft: {
    tailNumber,
    tailNumberColor,
    selected,
  },
  onClick = () => {},
}) => {
  const textStyle = {
    color: tailNumberColor,
  }

  return (
    <span onClick={() => onClick(tailNumber)} style={textStyle} className="aircraft-container">
      <h1>{tailNumber}</h1>
      {
        selected ? (
          <span className="check-mark">
            <i className="fas fa-check"></i>
          </span>
        ) : ''
      }
    </span>
  );
}
