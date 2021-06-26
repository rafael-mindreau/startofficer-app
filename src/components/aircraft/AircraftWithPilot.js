import React from 'react';
import './Aircraft.scss';

export default ({
  aircraft: {
    tailNumber,
    tailNumberColor,
    selected,
  },
  pilot: {
    name
  },
  onClick = () => {},
}) => {
  const textStyle = {
    color: tailNumberColor,
  }

  return (
    <div onClick={() => onClick(tailNumber)} className="aircraft-with-pilot-container">
      <div className="flex">
        <span style={textStyle} className="tail-number">
          <h1>{tailNumber}</h1>
        </span>
        <p>{name}</p>
      </div>
    </div>
  );
}
