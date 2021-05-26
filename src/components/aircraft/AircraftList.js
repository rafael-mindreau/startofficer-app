import React, { useCallback, useMemo } from 'react';
import Aircraft from 'components/aircraft/Aircraft';
import useLocalStorage from 'hooks/useLocalStorage';
import { v4 as uuid } from 'uuid';
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
    const updatedSelectedAircraft = {
      ...selectedAircraft,
    }

    if (updatedSelectedAircraft[tailNumber]) {
      delete updatedSelectedAircraft[tailNumber];
    } else {
      updatedSelectedAircraft[tailNumber] = gliders.find(glider => glider.tailNumber === tailNumber);
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
