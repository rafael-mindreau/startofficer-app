import React, { useRef, useEffect, useCallback, useState } from 'react';
import useLocalStorage from 'hooks/useLocalStorage';
import useClickOutside from 'hooks/useClickOutside';
import './Pilot.scss';

export default ({
  assign,
  unAssign,
  aircraft: {
    tailNumber,
  },
  pilot: {
    id,
    name = 'Not Assigned',
  } = {},
}) => {
  const [isPilotMenuOpen, setPilotMenuState] = useState(false);
  const [pilots] = useLocalStorage('pilots', []);
  const ref = useRef();
  useClickOutside(ref, () => setPilotMenuState(false));

  const clickPilot = useCallback((id, tailNumber) => {
    setPilotMenuState(false);
    assign(id, tailNumber);
  }, [setPilotMenuState, assign]);

  const clickMenuItem = useCallback((e) => {
    setPilotMenuState(false);
    e.stopPropagation();
  }, [setPilotMenuState]);

  return (
    <div onClick={() => setPilotMenuState(true)} className="pilot-container assignable">
      <h2>{name ? name : ''}</h2>
      {
        isPilotMenuOpen ? (
          <div onClick={(e) => clickMenuItem(e)} ref={ref} className="pilot-selection-menu">
            {
              pilots.filter(({ active }) => active).map(({ id, name }) => (
                <p key={id} onClick={() => clickPilot(id, tailNumber)}>{name}</p>
              ))
            }
            <p className="danger" onClick={() => unAssign(tailNumber)}>Remove</p>
          </div>
        ) : ''
      }
    </div>
  );
}
