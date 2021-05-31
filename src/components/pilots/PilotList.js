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
  const [assignedPilots, setAssignedPilots] = useLocalStorage('assigned-pilots', []);

  const addPilot = useCallback((name) => {
    // First check if already exists
    const candidatePilotIndex = pilots.findIndex(pilot => pilot.name.toLowerCase() === name.toLowerCase());

    // If we find them, then we just simply re-enable them, and their history is thus preserved
    if (candidatePilotIndex !== -1) {
      const candidatePilot = pilots[candidatePilotIndex];
      setPilots([
        ...pilots.slice(0, candidatePilotIndex),
        {
          ...candidatePilot,
          active: true,
        },
        ...pilots.slice(candidatePilotIndex + 1),
      ]);
    } else {
      // When nothing is found, we create a new pilot.
      setPilots([
        ...pilots,
        {
          id: uuid(),
          name,
          active: true,
        },
      ]);
    }
  }, [pilots, setPilots]);

  const deletePilot = useCallback((id) => {
    // Unassign if assigned to any "kist"
    const updatedAssignedPilots = Object.fromEntries(Object.entries({...assignedPilots}).filter(([tailNumber, pilot]) => pilot.id !== id));
    setAssignedPilots({
      ...updatedAssignedPilots,
    });

    // Set pilot inactive, but never really forget him/her
    const indexOfPilot = pilots.findIndex(pilotFromCollection => pilotFromCollection.id === id);
    const updatedPilot = pilots[indexOfPilot]

    setPilots([
      ...pilots.slice(0, indexOfPilot),
      {
        ...updatedPilot,
        active: false,
      },
      ...pilots.slice(indexOfPilot + 1),
    ]);
  }, [pilots, setPilots, assignedPilots, setAssignedPilots]);

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
          pilots.filter(({ active }) => active).map((pilot) => (
            <Pilot key={pilot.id} toggleType={toggleType} remove={() => deletePilot(pilot.id)} pilot={pilot} />
          ))
        }
      </div>
      <PilotPlaceholder addPilot={addPilot} />
    </div>
  )
};
