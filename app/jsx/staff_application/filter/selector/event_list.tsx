import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { ComputerParams } from "../../trait/params";
import {
  EventListFilterParams,
  EventListFilterType,
  eventListTypes,
  defaultEventListParams,
} from "../types/event_list";
import { FilterParams } from "../types/params";
import { CompetitionData } from "../../types/competition_data";

interface EventListFilterSelectorParams {
  params: EventListFilterParams | null;
  trait: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
  idBase: string;
}
export function EventListFilterSelector({
  params,
  trait,
  onFilterChange,
  idBase,
}: EventListFilterSelectorParams) {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const activeParams = params || defaultEventListParams(trait, wcif);
  const [eventListType, setEventListType] = useState(
    activeParams.eventListType,
  );
  const [referenceEvent, setReferenceEvent] = useState(
    activeParams.referenceEvent,
  );

  const updateEventListType = function (newType: EventListFilterType) {
    setEventListType(newType);
    activeParams.eventListType = newType;
    onFilterChange(activeParams);
  };

  const updateReferenceEvent = function (newEvent: string) {
    setReferenceEvent(newEvent);
    activeParams.referenceEvent = newEvent;
    onFilterChange(activeParams);
  };

  return (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <select
          className="form-select"
          value={eventListType}
          onChange={(e) =>
            updateEventListType(e.target.value as EventListFilterType)
          }
        >
          {eventListTypes.map((eventListType) => (
            <option value={eventListType.id} key={eventListType.id}>
              {eventListType.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        {wcif.events.map((evt) => (
          <span
            key={evt.id}
            className={"cubing-icon event-" + evt.id}
            style={{
              fontSize: "32px",
              padding: "4px",
              cursor: "pointer",
              color:
                referenceEvent == evt.id.toString() ? "black" : "lightgray",
            }}
            onClick={(e) => updateReferenceEvent(evt.id)}
          ></span>
        ))}
      </div>
    </div>
  );
}
