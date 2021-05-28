import React, { useCallback, useMemo } from 'react';
import Aircraft from 'components/aircraft/Aircraft';
import AssignedPilot from 'components/pilots/AssignedPilot';
import useLocalStorage from 'hooks/useLocalStorage';
import './StartLine.scss';

export default () => {
  const [selectedAircraft] = useLocalStorage('selected-gliders', {});
  const [pilots] = useLocalStorage('pilots', []);
  const [assignments, setAssignments] = useLocalStorage('assigned-pilots', {});

  const assignPilot = useCallback((pilotId, tailNumber) => {
    const updatedAssignments = {...assignments};
    updatedAssignments[tailNumber] = pilots.find(pilot => pilot.id === pilotId);
    setAssignments(updatedAssignments);
  }, [assignments, setAssignments, pilots]);

  const unAssignPilot = useCallback((tailNumber) => {
    const updatedAssignments = {...assignments};
    delete updatedAssignments[tailNumber];
    setAssignments(updatedAssignments);
  }, [assignments, setAssignments]);

  const list = useMemo(() => {
    return Object.entries(selectedAircraft).map(([tailNumber, glider]) => (
      <div key={`${tailNumber}-${assignments[glider.tailNumber] ? assignments[glider.tailNumber] : 'unassigned'}`} className="starting-line-position">
        <div className="grass">
          <Aircraft aircraft={glider} />
        </div>
        <div className="container pilot">
          <AssignedPilot unAssign={unAssignPilot} assign={assignPilot} aircraft={glider} pilot={assignments[glider.tailNumber]} />
        </div>
      </div>
    ));
  }, [selectedAircraft, assignments, assignPilot, unAssignPilot]);

  return (
    <div className="container no-padding startline-container">
      {list}
    </div>
  )
}
