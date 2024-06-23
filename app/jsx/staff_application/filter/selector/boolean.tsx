import { useState } from "react";

import { ComputerParams } from "../../trait/params";
import {
  BooleanFilterParams,
  BooleanFilterType,
  booleanTypes,
  defaultBooleanParams,
} from "../types/boolean";
import { FilterParams } from "../types/params";

interface BooleanFilterSelectorParams {
  params: BooleanFilterParams | null;
  trait: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
export function BooleanFilterSelector({
  params,
  trait,
  onFilterChange,
}: BooleanFilterSelectorParams) {
  const activeParams = params || defaultBooleanParams(trait);
  const [booleanType, setBooleanType] = useState(activeParams.booleanType);

  const updateBooleanType = function (newType: BooleanFilterType) {
    setBooleanType(newType);
    activeParams.booleanType = newType;
    onFilterChange(activeParams);
  };

  return (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <select
          className="form-select"
          value={booleanType}
          onChange={(e) =>
            updateBooleanType(e.target.value as BooleanFilterType)
          }
        >
          {booleanTypes.map((booleanType) => (
            <option value={booleanType.id} key={booleanType.id}>
              {booleanType.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
