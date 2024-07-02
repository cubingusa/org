import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { DateTime } from "luxon";

import { ComputerParams } from "../../trait/params";
import {
  DateTimeFilterParams,
  DateTimeFilterTimeZone,
  DateTimeFilterType,
  dateTimeFilterUsesReference,
  dateTimeTypes,
  defaultDateTimeParams,
} from "../types/date_time";
import { FilterParams } from "../types/params";
import { CompetitionData } from "../../types/competition_data";

interface DateTimeFilterSelectorParams {
  params: DateTimeFilterParams | null;
  trait: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
  idBase: string;
}
export function DateTimeFilterSelector({
  params,
  trait,
  onFilterChange,
  idBase,
}: DateTimeFilterSelectorParams) {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const activeParams = params || defaultDateTimeParams(trait);
  const [dateTimeType, setDateTimeType] = useState(activeParams.dateTimeType);
  const [referenceSeconds, setReferenceSeconds] = useState(
    activeParams.referenceSeconds,
  );
  const timeZone =
    activeParams.timeZone == DateTimeFilterTimeZone.Competition
      ? wcif.schedule.venues[0].timezone
      : DateTime.local().zoneName;

  const updateDateTimeType = function (newType: DateTimeFilterType) {
    setDateTimeType(newType);
    activeParams.dateTimeType = newType;
    onFilterChange(activeParams);
  };

  const updateReferenceTime = function (referenceString: string) {
    const newReferenceSeconds = DateTime.fromISO(referenceString, {
      zone: timeZone,
    }).toSeconds();
    activeParams.referenceSeconds = newReferenceSeconds;
    setReferenceSeconds(newReferenceSeconds);
    onFilterChange(activeParams);
  };

  return (
    <>
      <div className="row">
        <div className="col-auto">
          <select
            className="form-select"
            value={dateTimeType}
            onChange={(e) =>
              updateDateTimeType(e.target.value as DateTimeFilterType)
            }
          >
            {dateTimeTypes.map((dateTimeType) => (
              <option value={dateTimeType.id} key={dateTimeType.id}>
                {dateTimeType.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {dateTimeFilterUsesReference(dateTimeType) ? (
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <input
              className="form-control"
              type="datetime-local"
              value={DateTime.fromSeconds(referenceSeconds || 0).toFormat(
                "yyyy-MM-dd'T'HH:mm",
              )}
              onChange={(e) => updateReferenceTime(e.target.value)}
            />
          </div>
          <div className="col-auto">{timeZone}</div>
        </div>
      ) : null}
    </>
  );
}
