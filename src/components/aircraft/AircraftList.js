import React, { useCallback, useMemo } from 'react';
import Aircraft from 'components/aircraft/Aircraft';
import useLocalStorage from 'hooks/useLocalStorage';
import './AircraftList.scss';

const CLUB_GLIDERS = [
  {
    tailNumber: '808',
    tailNumberColor: '#12428a',
  },
  {
    tailNumber: 'ZD',
    tailNumberColor: '#d42e2e',
  },
  {
    tailNumber: 'LUC',
    tailNumberColor: '#ff7f09',
  },
  {
    tailNumber: 'FD',
    tailNumberColor: '#b42323',
  },
  {
    tailNumber: 'WD',
    tailNumberColor: '#787878',
  },
  {
    tailNumber: 'WB1',
    tailNumberColor: '#787878',
  },
];

export default () => {
  const [selectedAircraft, setSelectedAircraft] = useLocalStorage('selected-gliders', {});

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

    if (updatedSelectedAircraft[tailNumber]) {
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
  }, [selectedAircraft, setSelectedAircraft, gliders]);

  return (
    <div className="container aircraft-list-container">
      <div className="aircraft-list">
        {
          gliders.map((glider) => (
            <Aircraft onClick={toggleAircraft} key={glider.tailNumber} aircraft={glider} />
          ))
        }
      </div>
    </div>
  )
};
