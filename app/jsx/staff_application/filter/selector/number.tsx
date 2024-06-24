import { useState } from "react";

import { ComputerParams } from "../../trait/params";
import {
  NumberFilterParams,
  NumberFilterType,
  numberFilterUsesReference,
  numberTypes,
  defaultNumberParams,
} from "../types/number";
import { FilterParams } from "../types/params";

interface NumberFilterSelectorParams {
  params: NumberFilterParams | null;
  trait: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
export function NumberFilterSelector({
  params,
  trait,
  onFilterChange,
}: NumberFilterSelectorParams) {
  const activeParams = params || defaultNumberParams(trait);
  const [numberType, setNumberType] = useState(activeParams.numberType);
  const [reference, setReference] = useState(activeParams.reference);

  const updateNumberType = function (newType: NumberFilterType) {
    setNumberType(newType);
    activeParams.numberType = newType;
    onFilterChange(activeParams);
  };

  const updateReference = function (reference: number) {
    setReference(reference);
    activeParams.reference = reference;
    onFilterChange(activeParams);
  };

  return (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <select
          className="form-select"
          value={numberType}
          onChange={(e) => updateNumberType(e.target.value as NumberFilterType)}
        >
          {numberTypes.map((numberType) => (
            <option value={numberType.id} key={numberType.id}>
              {numberType.name}
            </option>
          ))}
        </select>
      </div>
      {numberFilterUsesReference(numberType) ? (
        <div className="col-auto">
          <input
            className="form-control"
            type="number"
            value={reference}
            onChange={(e) => updateReference(+e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
