import React, { useCallback } from 'react';
import useLocalStorage from 'hooks/useLocalStorage';
import './Pilot.scss';

export default ({
  remove,
  toggleType,
  hideControls,
  hasPreferences,
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
      <div className="flex">
        <h2>{name ? name : ''}</h2>
        {
          hasPreferences ? (
            <span className="led red" />
          ) : ''
        }
      </div>
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
