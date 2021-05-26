import React from 'react';
import Aircraft from 'components/aircraft/Aircraft';
import './StartLine.scss';

const CLUB_GLIDERS = [
  {
    tailNumber: '808',
    tailNumberColor: '#12428a',
  },
  {
    tailNumber: 'ZD',
    tailNumberColor: '#d42e2e',
  }
];

export default () => {
  return (
    <div className="startline-container">
      {
        CLUB_GLIDERS.map((glider) => (
          <Aircraft aircraft={glider} />
        ))
      }
    </div>
  )
}
