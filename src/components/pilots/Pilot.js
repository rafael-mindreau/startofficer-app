import React, { useCallback } from 'react';
import useLocalStorage from 'hooks/useLocalStorage';
import './Pilot.scss';

export default ({
  remove,
  toggleType,
  hideControls,
  pilot: {
    id,
    name,
    type,
  } = {},
  onClick = () => {},
}) => {
  const [logBook] = useLocalStorage('flights', []);

  const getFlightsForPilot = useCallback((pilotId) => {
    return logBook.filter(({ exclude, pilotInCommand: { id } }) => !exclude && id === pilotId).length;
  }, [logBook]);

  return (
    <div onClick={onClick} className="pilot-container">
      <h2>{name ? name : ''}</h2>
      {
        hideControls ? '' : (
          <div className="controls">
            <span className="starts-badge">{getFlightsForPilot(id)}</span>
            <span onClick={() => toggleType(id)} className={`type-button ${type}`}>{type ? type : '???'}</span>
            <i onClick={remove} className="fas fa-times"></i>
          </div>
        )
      }
    </div>
  );
}
