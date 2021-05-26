import React, { useCallback } from 'react';
import Pilot from 'components/pilots/Pilot';
import PilotPlaceholder from 'components/pilots/PilotPlaceholder';
import useLocalStorage from 'hooks/useLocalStorage';
import { v4 as uuid } from 'uuid';
import './PilotList.scss';

const TYPES = [
  'dbo',
  'solo',
  'vvo',
  'spl',
];

export default () => {
  const [pilots, setPilots] = useLocalStorage('pilots', []);

  const addPilot = useCallback((name) => {
    // Add to list
    setPilots([
      ...pilots,
      {
        id: uuid(),
        name,
      }
    ]);
  }, [pilots, setPilots]);

  const deletePilot = useCallback((id) => {
    const indexOfPilot = pilots.findIndex(pilotFromCollection => pilotFromCollection.id === id);

    setPilots([
      ...pilots.slice(0, indexOfPilot),
      ...pilots.slice(indexOfPilot + 1),
    ]);
  }, [pilots, setPilots]);

  const incrementType = (pilot) => {
    const currentIndex = TYPES.findIndex(type => type === pilot.type);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= TYPES.length) {
      nextIndex = 0;
    }

    return {
      ...pilot,
      type: TYPES[nextIndex],
    };
  }

  const toggleType = useCallback((id) => {
    const indexOfPilot = pilots.findIndex(pilotFromCollection => pilotFromCollection.id === id);
    const pilot = incrementType(pilots[indexOfPilot]);
    setPilots([
      ...pilots.slice(0, indexOfPilot),
      pilot,
      ...pilots.slice(indexOfPilot + 1),
    ]);
  }, [pilots, setPilots]);

  return (
    <div className="container pilot-list-container">
      <div className="pilot-list">
        {
          pilots.map((pilot) => (
            <Pilot key={pilot.id} toggleType={toggleType} remove={() => deletePilot(pilot.id)} pilot={pilot} />
          ))
        }
      </div>
      <PilotPlaceholder addPilot={addPilot} />
    </div>
  )
};
