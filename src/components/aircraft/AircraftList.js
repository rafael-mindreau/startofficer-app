import React, { useCallback, useMemo } from 'react';
import Aircraft from 'components/aircraft/Aircraft';
import useLocalStorage from 'hooks/useLocalStorage';
import { CLUB_GLIDERS } from 'constants/gliders';
import './AircraftList.scss';

export default ({
  onClick,
  selectedPreferences,
  isPreferences,
}) => {
  const [selectedAircraft, setSelectedAircraft] = useLocalStorage('selected-gliders', {});
  const [flyingGliders] = useLocalStorage('flying', {});

  const isFlying = useCallback((tailNumber) => {
    return flyingGliders[tailNumber] !== undefined;
  }, [flyingGliders]);

  const gliders = useMemo(() => {
    return CLUB_GLIDERS.map((glider) => {
      const selected = selectedAircraft[glider.tailNumber] !== undefined;

      return {
        ...glider,
        selected,
      };
    })
  }, [selectedAircraft]);

  const toggleAircraft = useCallback((tailNumber) => {
    // Get the amount of selected aircraft currently available
    // We use this to set the order in the list for the starting line
    const amountOfSelectedAircraft = Object.entries(selectedAircraft).length;

    let updatedSelectedAircraft = {
      ...selectedAircraft,
    }

    if (updatedSelectedAircraft[tailNumber] && !isFlying(tailNumber)) {
      // Delete from map if already exists
      delete updatedSelectedAircraft[tailNumber];

      // Recalculate indices
      updatedSelectedAircraft = Object.fromEntries(Object.entries(updatedSelectedAircraft).map(([tailNumber, glider], index) => ([
        tailNumber,
        {
          ...glider,
          order: index,
        }
      ])));
    } else {
      // Add to mapping when it doesn't exist yet
      updatedSelectedAircraft[tailNumber] = gliders.find(glider => glider.tailNumber === tailNumber);
      // This makes it so that the order is generated onto the aircraft when it's added into rotation
      updatedSelectedAircraft[tailNumber].order = amountOfSelectedAircraft;
    }

    setSelectedAircraft(updatedSelectedAircraft);
  }, [selectedAircraft, isFlying, setSelectedAircraft, gliders]);

  return (
    <div className="container aircraft-list-container">
      {
        isPreferences ? (
          <div className="aircraft-list preferences-for-pilot">
            {
              gliders.map((glider) => (
                <Aircraft onClick={() => onClick(glider)} key={glider.tailNumber} aircraft={glider} selected={selectedPreferences && selectedPreferences[glider.tailNumber]} selectable />
              ))
            }
          </div>
        ) : (
          <div className="aircraft-list">
            {
              gliders.map((glider) => (
                <Aircraft onClick={toggleAircraft} key={glider.tailNumber} aircraft={glider} selected={glider.selected} selectable />
              ))
            }
          </div>
        )
      }
    </div>
  )
};
