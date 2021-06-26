import React from 'react';
import dayjs from 'dayjs';
import { LOGBOOK_TIME_FORMAT } from 'constants/constants';
import './Aircraft.scss';

export default ({
  flight: {
    glider: {
      tailNumber,
      tailNumberColor,
    },
    pilotInCommand: {
      name,
    },
    takeOffTime,
    durationOfFlight,
    exclude = false,
  },
  onClick = () => {},
}) => {
  const textStyle = {
    color: tailNumberColor,
  }

  return (
    <div onClick={() => onClick()} className={`aircraft-with-pilot-container logbook ${exclude ? 'exclude' : ''}`}>
      <div className="flex">
        <span style={textStyle} className="tail-number">
          <h1>{tailNumber}</h1>
        </span>
        <p>{name}</p>
      </div>
      <div className="flex timetable">
        <p>{dayjs(takeOffTime, LOGBOOK_TIME_FORMAT).format('HH:mm')}</p>
        <p>{durationOfFlight}</p>
      </div>
    </div>
  );
}
