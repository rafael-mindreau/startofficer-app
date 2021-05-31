import React from 'react';
import './Pilot.scss';

export default ({
  remove,
  toggleType,
  hideControls,
  pilot: {
    id,
    name,
    type,
    starts,
  } = {},
}) => (
  <div className="pilot-container">
    <h2>{name ? name : ''}</h2>
    {
      hideControls ? '' : (
        <div className="controls">
          <span className="starts-badge">{starts}</span>
          <span onClick={() => toggleType(id)} className={`type-button ${type}`}>{type ? type : '???'}</span>
          <i onClick={remove} className="fas fa-times"></i>
        </div>
      )
    }
  </div>
)
