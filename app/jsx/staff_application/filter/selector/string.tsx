import { useState } from "react";

import { ComputerParams } from "../../trait/params";
import {
  StringFilterParams,
  StringFilterType,
  stringFilterUsesReference,
  stringTypes,
  defaultStringParams,
} from "../types/string";
import { FilterParams } from "../types/params";

interface StringFilterSelectorParams {
  params: StringFilterParams | null;
  trait: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
export function StringFilterSelector({
  params,
  trait,
  onFilterChange,
}: StringFilterSelectorParams) {
  const activeParams = params || defaultStringParams(trait);
  const [stringType, setStringType] = useState(activeParams.stringType);
  const [reference, setReference] = useState(activeParams.reference);

  const updateStringType = function (newType: StringFilterType) {
    setStringType(newType);
    activeParams.stringType = newType;
    onFilterChange(activeParams);
  };

  const updateReference = function (reference: string) {
    setReference(reference);
    activeParams.reference = reference;
    onFilterChange(activeParams);
  };

  return (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <select
          className="form-select"
          value={stringType}
          onChange={(e) => updateStringType(e.target.value as StringFilterType)}
        >
          {stringTypes.map((stringType) => (
            <option value={stringType.id} key={stringType.id}>
              {stringType.name}
            </option>
          ))}
        </select>
      </div>
      {stringFilterUsesReference(stringType) ? (
        <div className="col-auto">
          <input
            className="form-control"
            type="string"
            value={reference}
            onChange={(e) => updateReference(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
