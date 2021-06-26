import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import './Settings.scss';

export default () => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState(false);

  const confirmReset = useCallback(() => {
    setShowWarning(true);
    setWarningText('I\'m almost 100% sure you don\'t want to do this... Are you sure? This will wipe all remembered data from this device!');
  }, [setShowWarning, setWarningText]);

  return (
    <div className="container settings-container">
      <NavLink to="/preferences">
        <button className="settings-button blue">Pilot Preferences</button>
      </NavLink>
      <NavLink to="/logbook">
        <button className="settings-button green">Flight Logbook</button>
      </NavLink>
      <button onClick={() => confirmReset()} className="settings-button red">Clear All Data <span aria-label="warning" role="img">⚠️</span></button>

      {
        showWarning ? (
          <div className="confirm-dialog">
            <h2>Are you sure?</h2>
            <p>{warningText}</p>

            <div className="controls">
              <button onClick={() => {}} className="settings-button green">Yes</button>
              <button onClick={() => setShowWarning(false)} className="settings-button red">No</button>
            </div>
          </div>
        ) : ''
      }
    </div>
  );
}
