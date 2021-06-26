import React from 'react';
import './Aircraft.scss';

export default ({
  selectable = false,
  aircraft: {
    tailNumber,
    tailNumberColor,
  },
  selected = false,
  onClick = () => {},
}) => {
  const textStyle = {
    color: tailNumberColor,
  }

  return (
    <span onClick={() => onClick(tailNumber)} style={textStyle} className="aircraft-container">
      <h1>{tailNumber}</h1>
      {
        selectable && selected ? (
          <span className="check-mark">
            <i className="fas fa-check"></i>
          </span>
        ) : ''
      }
    </span>
  );
}
