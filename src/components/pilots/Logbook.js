import React, { useCallback } from 'react';
import LogbookEntry from 'components/aircraft/LogbookEntry';
import useLocalStorage from 'hooks/useLocalStorage';
import './Logbook.scss';

export default () => {
  const [flights, setFlights] = useLocalStorage('flights', []);

  const excludeFlight = useCallback((flight) => {
    // Set pilot inactive, but never really forget him/her
    const indexOfFlight = flights.findIndex(({ id }) => id === flight.id);
    const updatedFlight = flights[indexOfFlight];

    setFlights([
      ...flights.slice(0, indexOfFlight),
      {
        ...updatedFlight,
        exclude: !flight.exclude,
      },
      ...flights.slice(indexOfFlight + 1),
    ]);
  }, [flights, setFlights]);

  return (
    <div className="container logbook-container">
      {
        flights.map((flight) => (
          <LogbookEntry onClick={() => excludeFlight(flight)} flight={flight} />
        ))
      }
    </div>
  );
}
