import React, { useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Aircraft from 'components/aircraft/Aircraft';
import AssignedPilot from 'components/pilots/AssignedPilot';
import useLocalStorage from 'hooks/useLocalStorage';
import './StartLine.scss';

const getDraggableStyle = (isDragging, providedStyle) => {
  const { transform } = providedStyle;
  let result = {};
  if (transform) {
    result = {
      transform: `translate(0, ${transform.substring(
        transform.indexOf(',') + 1,
        transform.indexOf(')')
      )})`,
    };
  }
  return {
    userSelect: 'none',
    ...providedStyle,
    ...result,
  };
};

export default () => {
  const [selectedAircraft, setSelectedAircraft] = useLocalStorage('selected-gliders', {});
  const [pilots] = useLocalStorage('pilots', []);
  const [assignments, setAssignments] = useLocalStorage('assigned-pilots', {});

  const onDragEnd = useCallback(({
    source,
    destination
  }) => {
    if (!destination) {
      console.log('%cNO DEST', 'background-color: #e33928; padding: 5px; border-radius: 3px; font-weight: bold; color: white');
      return;
    }

    const updatedSelectedAircraft = {...selectedAircraft};

    console.log('%cSOURCE', 'background-color: #23aff4; padding: 5px; border-radius: 3px; font-weight: bold; color: white', Object.values(updatedSelectedAircraft).find(({ order }) => order === source.index));
    console.log('%cDESTINATION', 'background-color: #339977; padding: 5px; border-radius: 3px; font-weight: bold; color: white', Object.values(updatedSelectedAircraft).find(({ order }) => order === destination.index));

    Object.values(updatedSelectedAircraft).find(({ order }) => order === destination.index).order = source.index;
    Object.values(updatedSelectedAircraft).find(({ order }) => order === source.index).order = destination.index;

    console.log('%cRESULT SET', 'background-color: #e09579; padding: 5px; border-radius: 3px; font-weight: bold; color: white', updatedSelectedAircraft);

    setSelectedAircraft({...updatedSelectedAircraft});
  }, [selectedAircraft, setSelectedAircraft]);

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

  return (
    <div className="container no-padding startline-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div className="list-container" {...provided.droppableProps} ref={provided.innerRef}>
              {
                Object.values(selectedAircraft).sort((a, b) => a.order - b.order).map((glider, index) => (
                  <Draggable
                    key={glider.tailNumber}
                    draggableId={glider.tailNumber}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className="starting-line-position"
                        ref={provided.innerRef}
                        style={getDraggableStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style,
                        )}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="grass">
                          <Aircraft aircraft={glider} />
                        </div>
                        <div className="container pilot">
                          <AssignedPilot unAssign={unAssignPilot} assign={assignPilot} aircraft={glider} pilot={assignments[glider.tailNumber]} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              }
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
