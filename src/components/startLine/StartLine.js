import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Aircraft from 'components/aircraft/Aircraft';
import AssignedPilot from 'components/pilots/AssignedPilot';
import useLocalStorage from 'hooks/useLocalStorage';
import dayjs from 'dayjs';
import './StartLine.scss';

const LOGBOOK_TIME_FORMAT = 'DD-MM-YYYY HH:mm';

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

/**
 * Literally swap two elements in a list
 * @param  {Array}  list  The array on which to perform the changes
 * @param  {Number} from  Index of the point A
 * @param  {Number} to    Index of point B
 * @return {Array}        Exactly the same as the given array except for that from and to are now swapped
 */
const reorder = (list, from, to) => {
  const result = Array.from(list);
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);

  return result;
};

export default () => {
  const [selectedAircraft, setSelectedAircraft] = useLocalStorage('selected-gliders', {});
  const [pilots] = useLocalStorage('pilots', []);
  const [assignments, setAssignments] = useLocalStorage('assigned-pilots', {});
  const [flyingGliders, setFlyingGliders] = useLocalStorage('flying', {});
  const [logBook, setLogbook] = useLocalStorage('flights', []);
  const [showFlyingAircraft, setShowFlyingAircraft] = useState(false);

  const swapPositions = useCallback((from, to) => {
    // Swap the source and destination aircraft
    const updatedSelectedAircraft = {...selectedAircraft};
    const items = reorder(Object.values(updatedSelectedAircraft).sort((a, b) => a.order - b.order), from, to);

    // Update the selected gliders' order in the list
    setSelectedAircraft({
      ...Object.fromEntries(items.map((item, index) => ({
        ...item,
        order: index,
      })).map(item => ([item.tailNumber, item]))),
    });
  }, [selectedAircraft, setSelectedAircraft]);

  const land = useCallback((glider) => {
    // Close the landing menu
    setShowFlyingAircraft(false);

    // Make an entry for the logbook
    const { takeOffTime, pilotInCommand } = flyingGliders[glider.tailNumber];
    const landingTime = dayjs().format(LOGBOOK_TIME_FORMAT);
    const durationOfFlight = dayjs.unix(dayjs(landingTime).unix() - dayjs(takeOffTime).unix()).format('HH:mm');
    const updatedLogBook = [
      ...logBook,
      {
        glider,
        pilotInCommand,
        takeOffTime,
        landingTime,
        durationOfFlight,
      },
    ];

    setLogbook(updatedLogBook);

    // Remove the flying state from the list
    const updatedFlyingGliders = {...flyingGliders};
    delete updatedFlyingGliders[glider.tailNumber];

    setFlyingGliders(updatedFlyingGliders);

    // Unassign the landed glider
    const updatedAssignments = {...assignments};
    delete updatedAssignments[glider.tailNumber];

    setAssignments(updatedAssignments);
  }, [assignments, flyingGliders, logBook, setAssignments, setFlyingGliders, setLogbook]);

  const launch = useCallback(() => {
    // Launch button will launch the frontmost glider
    const frontAircraft = Object.values(selectedAircraft).find(glider => glider.order === 0);
    const pilotInCommand = assignments[frontAircraft.tailNumber];

    // You cannot launch an empty glider
    // You cannot launch a glider that is already flying, you silly :)
    if (!pilotInCommand || flyingGliders[frontAircraft.tailNumber]) {
      return;
    }

    // Swap this aircraft to end of list
    swapPositions(0, Object.keys(selectedAircraft).length - 1);

    const updatedFlyingGliders = { ...flyingGliders };
    updatedFlyingGliders[frontAircraft.tailNumber] = {
      pilotInCommand: assignments[frontAircraft.tailNumber],
      takeOffTime: dayjs().format(LOGBOOK_TIME_FORMAT),
    };

    setFlyingGliders({
      ...updatedFlyingGliders,
    });
  }, [selectedAircraft, assignments, swapPositions, flyingGliders, setFlyingGliders]);

  const onDragEnd = useCallback(({
    source,
    destination
  }) => {
    if (!destination) {
      return;
    }

    swapPositions(source.index, destination.index);
  }, [swapPositions]);

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
    <>
      <div className="container no-padding startline-container">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div className="list-container" {...provided.droppableProps} ref={provided.innerRef}>
                {
                  Object.values(selectedAircraft)
                    .sort((a, b) => a.order - b.order).map((glider, index) => (
                    <Draggable
                      key={glider.tailNumber}
                      draggableId={glider.tailNumber}
                      index={index}
                      isDragDisabled={flyingGliders[glider.tailNumber] !== undefined}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={`starting-line-position ${flyingGliders[glider.tailNumber] ? 'flying' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getDraggableStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style,
                          )}
                        >
                          <div className="grass">
                            <Aircraft aircraft={glider} />
                          </div>
                          <div className={`container pilot ${snapshot.isDragging ? 'is-dragging' : ''}`}>
                            <AssignedPilot isFlying={flyingGliders[glider.tailNumber]} unAssign={unAssignPilot} assign={assignPilot} aircraft={glider} pilot={assignments[glider.tailNumber]} />
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

      {
        showFlyingAircraft ? (
          <div className="flying-gliders">
            {
              Object.keys(flyingGliders).map(tailNumber => selectedAircraft[tailNumber]).map(glider => (
                <Aircraft onClick={() => land(glider)} key={glider.id} aircraft={glider} />
              ))
            }
          </div>
        ) : ''
      }

      <div className="startline-controls">
        <div className="left">
          <button onClick={launch} className="button launch-button">
            <i className="fas fa-plane-departure"></i>
          </button>
          <button onClick={() => setShowFlyingAircraft(!showFlyingAircraft)} className="button land-button">
            <i className="fas fa-plane-arrival"></i>
          </button>
        </div>

        <div className="right">
          <button className="button">
            <i className="fas fa-redo"></i>
          </button>
        </div>
      </div>
    </>
  )
}
