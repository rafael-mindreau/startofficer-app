import React, { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  const [selectedAircraft, setSelectedAircraft] = useLocalStorage('selected-gliders', {});
  const [flights, setFlights] = useLocalStorage('flights', []);
  const [preferences, setPreferences] = useLocalStorage('pilot-preferences', {});
  const [assignedPilots, setAssignedPilots] = useLocalStorage('assigned-pilots', []);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState(false);

  const addPilot = useCallback((name) => {
    // First check if already exists
    const candidatePilotIndex = pilots.findIndex(pilot => pilot.name.toLowerCase() === name.toLowerCase());
    let pilot = {};

    // If we find them, then we just simply re-enable them, and their history is thus preserved
    if (candidatePilotIndex !== -1) {
      const candidatePilot = pilots[candidatePilotIndex];
      pilot = {
        ...candidatePilot,
        priority: pilots.filter(pilot => pilot.active).length,
        active: true,
      };

      setPilots([
        ...pilots.slice(0, candidatePilotIndex),
        {
          ...pilot,
        },
        ...pilots.slice(candidatePilotIndex + 1),
      ]);
    } else {
      // When nothing is found, we create a new pilot.
      pilot = {
        id: uuid(),
        priority: pilots.filter(pilot => pilot.active).length,
        name,
        active: true,
      };
      setPilots([
        ...pilots,
        {
          ...pilot,
        },
      ]);
    }

    if (!preferences[pilot.id]) {
      // Create default preferences for pilot
      const updatedPreferences = {
        ...preferences,
      };

      updatedPreferences[pilot.id] = {};

      setPreferences(updatedPreferences);
    }
  }, [pilots, preferences, setPilots, setPreferences]);

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

  const resetButtonPressed = useCallback(() => {
    const updatedPilots = pilots.map((pilot) => ({
      ...pilot,
      active: false,
    }));

    setSelectedAircraft({});
    setFlights([]);

    setPilots([
      ...updatedPilots
    ]);

    setShowWarning(false);
  }, [pilots, setFlights, setPilots, setSelectedAircraft]);

  const confirmReset = useCallback(() => {
    setShowWarning(true);
    setWarningText('This will reset all pilots, flights, and aircraft! You sure about that?');
  }, [setShowWarning, setWarningText]);

  return (
    <div className="container pilot-list-container">
      <div className="pilot-list">
        {
          pilots.filter(({ active }) => active).sort((a, b) => a.priority - b.priority).map((pilot) => (
            <Pilot hasPreferences={preferences[pilot.id]} key={pilot.id} toggleType={toggleType} remove={() => deletePilot(pilot.id)} pilot={pilot} />
          ))
        }
      </div>
      <PilotPlaceholder addPilot={addPilot} />
      <button onClick={confirmReset} className="reset-button red">Reset Day <span aria-label="warning" role="img">⚠️</span></button>
      <NavLink to="/settings">
        <button className="settings-button blue">Settings</button>
      </NavLink>

      {
        showWarning ? (
          <div className="confirm-dialog">
            <h2>Are you sure?</h2>
            <p>{warningText}</p>

            <div className="controls">
              <button onClick={() => resetButtonPressed()} className="settings-button green">Yes</button>
              <button onClick={() => setShowWarning(false)} className="settings-button red">No</button>
            </div>
          </div>
        ) : ''
      }
    </div>
  )
};
