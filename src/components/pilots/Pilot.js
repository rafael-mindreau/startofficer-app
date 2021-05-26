import React from 'react';
import './Pilot.scss';

export default ({
  remove,
  toggleType,
  pilot: {
    id,
    name,
    type,
  }
}) => (
  <div className="pilot-container">
    <h2>{name}</h2>
    <div className="controls">
      <span onClick={() => toggleType(id)} className={`type-button ${type}`}>{type ? type : '???'}</span>
      <i onClick={remove} className="fas fa-times"></i>
    </div>
  </div>
)
