import React, { useCallback, useState } from 'react';
import Pilot from 'components/pilots/Pilot';
import AircraftList from 'components/aircraft/AircraftList';
import useLocalStorage from 'hooks/useLocalStorage';
import { CLUB_GLIDERS } from 'constants/gliders';
import './Preferences.scss';

export default () => {
  const [pilots] = useLocalStorage('pilots', []);
  const [preferences, setPreferences] = useLocalStorage('pilot-preferences', {});
  const [selectedPilot, setSelectedPilot] = useState(null);

  const showPreferences = useCallback((pilot) => {
    setSelectedPilot(pilot);
  }, [setSelectedPilot]);

  const togglePreferences = useCallback((selectedGlider) => {
    // Toggle specific aircraft into user preferences\
    const updatedPreferences = {
      ...preferences
    };

    // If there were no preferences for this pilot yet, generate them
    if (!updatedPreferences[selectedPilot.id]) {
      updatedPreferences[selectedPilot.id] = {};
    }

    if (updatedPreferences[selectedPilot.id][selectedGlider.tailNumber]) {
      // Delete from map if already exists
      delete updatedPreferences[selectedPilot.id][selectedGlider.tailNumber];
    } else {
      // Add to mapping when it doesn't exist yet
      updatedPreferences[selectedPilot.id][selectedGlider.tailNumber] = CLUB_GLIDERS.find(clubGlider => clubGlider.tailNumber === selectedGlider.tailNumber);
    }

    setPreferences({...updatedPreferences});
  }, [preferences, selectedPilot, setPreferences]);

  return (
    <div className="container preferences-container">
      {
        pilots.map((pilot) => (
          <Pilot key={pilot.id} onClick={() => showPreferences(pilot)} pilot={pilot} hasPreferences={Object.keys(preferences[pilot.id]).length} hideControls />
        ))
      }

      {
        selectedPilot ? (
          <div className="preferences">
            <h1>{selectedPilot.name}</h1>
            <AircraftList isPreferences selectedPreferences={preferences[selectedPilot.id] } onClick={togglePreferences} />
            <button onClick={() => setSelectedPilot(null)} className="button blue">Done</button>
          </div>
        ) : ''
      }
    </div>
  )
};
