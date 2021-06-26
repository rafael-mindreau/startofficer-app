import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Aircraft from 'components/aircraft/Aircraft';
import AircraftWithPilot from 'components/aircraft/AircraftWithPilot';
import AssignedPilot from 'components/pilots/AssignedPilot';
import useLocalStorage from 'hooks/useLocalStorage';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { LOGBOOK_TIME_FORMAT } from 'constants/constants';
import { DEFAULT_PREFERENCES } from 'constants/default-preferences';
import './StartLine.scss';

dayjs.extend(duration);
dayjs.extend(customParseFormat);

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
  const [preferences] = useLocalStorage('pilot-preferences', []);
  const [assignments, setAssignments] = useLocalStorage('assigned-pilots', {});
  const [flyingGliders, setFlyingGliders] = useLocalStorage('flying', {});
  const [logBook, setLogbook] = useLocalStorage('flights', []);
  const [showFlyingAircraft, setShowFlyingAircraft] = useState(false);

  // TODO this is also used in Pilot.js - should separate this to utils, but I'm lazy right now so yah....
  const getFlightsForPilot = useCallback((pilotId) => {
    return logBook.filter(({ exclude, pilotInCommand: { id } }) => !exclude && id === pilotId).length;
  }, [logBook]);

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
    const durationOfFlight = dayjs.duration(dayjs(landingTime, LOGBOOK_TIME_FORMAT).diff(dayjs(takeOffTime, LOGBOOK_TIME_FORMAT))).format('HH:mm');
    const updatedLogBook = [
      ...logBook,
      {
        id: uuid(),
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

  const landButtonPressed = useCallback(() => {
    if (!showFlyingAircraft && Object.keys(flyingGliders).length) {
      setShowFlyingAircraft(true);
    } else {
      setShowFlyingAircraft(false);
    }
  }, [flyingGliders, showFlyingAircraft]);

  const autoSchedulePressed = useCallback(() => {
    // Get a list of all unassigned aircraft
    const assignedTailNumbers = Object.keys(assignments);
    const unassginedGliders = Object.values(selectedAircraft).filter(glider => assignedTailNumbers.indexOf(glider.tailNumber) === -1);

    const activePilots = pilots.filter((pilot) => {
      // Check if pilot isn't already assigned and if they are active
      const pilotHasAssignment = Object.values(assignments).some(a => a.id === pilot.id);

      return !pilotHasAssignment && pilot.active;
    }).sort((a, b) => {
      if (getFlightsForPilot(a.id) === getFlightsForPilot(b.id)) {
        return a.order - b.order;
      }

      return getFlightsForPilot(a.id) - getFlightsForPilot(b.id);
    });

    let assignmentsToPush = [];

    // For every unassigned glider, find the first best pilot that can fly it
    unassginedGliders.sort((a, b) => a.order - b.order).forEach((unassginedGlider, index) => {
      // Make sure to sort pilots based on their starts, the lowest starts will go first
      activePilots.filter((pilot) => {
        return assignmentsToPush.map(({ pilotId }) => pilotId).indexOf(pilot.id) === -1;
      }).some(pilot => {
        // Get pilot preferences first
        let preference = preferences[pilot.id];

        if (!preference || (preference && !Object.keys(preference).length)) {
          // If this pilot has no specific preferences, their type takes presidence
          const { type } = pilot;

          if (!type) {
            // If pilot has neither preference nor type, they cannot be taken into account for scheduling
            // Make sure all pilots have a type assigned, otherwise they will require manual assigning
            return false;
          }

          preference = DEFAULT_PREFERENCES[type];
        } else {
          preference = Object.keys(preference);
        }

        // See if we can schedule this pilot for this aircraft
        if (preference.indexOf(unassginedGlider.tailNumber) !== -1) {
          assignmentsToPush = [
            ...assignmentsToPush,
            {
              pilotId: pilot.id,
              tailNumber: unassginedGlider.tailNumber,
            },
          ];

          // Return true to stop looping through candidates, we just found one
          return true;
        }

        return false;
      });
    });

    const updatedAssignments = {...assignments};

    assignmentsToPush.forEach(({
      pilotId: idOfPilotToAssign,
      tailNumber,
    }) => {
      updatedAssignments[tailNumber] = pilots.find(({ id }) => idOfPilotToAssign === id );
    });

    setAssignments(updatedAssignments);
  }, [assignments, getFlightsForPilot, pilots, preferences, selectedAircraft, setAssignments]);

  const resetButtonPressed = useCallback(() => {
    const flyingTailNumbers = Object.keys(flyingGliders);
    const updatedAssignments = Object.fromEntries(Object.entries(assignments).filter(([tailNumber, pilot]) => flyingTailNumbers.indexOf(tailNumber) !== -1));

    setAssignments({...updatedAssignments});
  }, [assignments, flyingGliders, setAssignments]);

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
                <AircraftWithPilot onClick={() => land(glider)} key={glider.tailNumber} pilot={assignments[glider.tailNumber]} aircraft={glider} />
              ))
            }
          </div>
        ) : ''
      }

      <div className="startline-controls">
        <div className="left">
          <button onClick={launch} className="button launch-button green">
            <i className="fas fa-plane-departure"></i>
          </button>
          <button onClick={() => landButtonPressed()} className="button land-button red">
            <i className="fas fa-plane-arrival"></i>
          </button>
          <button onClick={() => autoSchedulePressed()} className="button land-button blue">
            <i className="fas fa-magic"></i>
          </button>
        </div>

        <div className="right">
          <button onClick={() => resetButtonPressed()} className="button">
            <i className="fas fa-redo"></i>
          </button>
        </div>
      </div>
    </>
  )
}
