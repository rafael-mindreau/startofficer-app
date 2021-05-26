import React, { useState, useCallback } from 'react';
import './PilotPlaceholder.scss';

export default ({
  addPilot,
}) => {
  const [newPilotName, setNewPilotName] = useState('');

  const submit = useCallback((name) => {
    addPilot(name);
    setNewPilotName('');
  }, [addPilot])

  return (
    <div className="new-pilot-container">
      <input onChange={({ target: { value }}) => setNewPilotName(value)} type="text" placeholder="New Pilot" value={newPilotName} />
      <button className="green" onClick={() => submit(newPilotName)} disabled={newPilotName.length < 1}><i className="fas fa-plus"></i></button>
    </div>
  );
};
