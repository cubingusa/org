import { useState } from "react";

import { ComputerParams } from "../../trait/params";
import {
  defaultNumberEnumParams,
  defaultStringEnumParams,
  NumberEnumFilterParams,
  StringEnumFilterParams,
} from "../types/enum";
import { FilterParams } from "../types/params";

interface FilterSelectorParams<T, U> {
  params: T | null;
  trait: ComputerParams;
  values: Map<U, string>;
  onFilterChange: (params: FilterParams) => void;
}

export function StringEnumFilterSelector({
  params,
  trait,
  values,
  onFilterChange,
}: FilterSelectorParams<StringEnumFilterParams, string>) {
  const allValues = Array.from(values).map(([key, value]) => {
    return { key, value };
  });
  const activeParams = params || defaultStringEnumParams(trait, allValues);
  const [allowed, setAllowed] = useState(activeParams.allowedValues);

  const updateAllowed = function (value: string, isAllowed: boolean) {
    let newAllowed;
    if (isAllowed) {
      newAllowed = [...allowed, value];
    } else {
      newAllowed = allowed.filter((v) => v !== value);
    }
    setAllowed(newAllowed);
    activeParams.allowedValues = newAllowed;
    onFilterChange(activeParams);
  };

  return (
    <>
      {Array.from(values).map(([id, value]) => (
        <div className="form-check" key={id}>
          <input
            className="form-check-input"
            type="checkbox"
            defaultChecked={allowed.includes(id)}
            onChange={(e) => updateAllowed(id, e.target.checked)}
            id={`enum-check-${id}`}
          />
          <label className="form-check-label" htmlFor={`enum-check-${id}`}>
            {value}
          </label>
        </div>
      ))}
    </>
  );
}

export function NumberEnumFilterSelector({
  params,
  trait,
  values,
  onFilterChange,
}: FilterSelectorParams<NumberEnumFilterParams, number>) {
  const allValues = Array.from(values).map(([key, value]) => {
    return { key, value };
  });
  const activeParams = params || defaultNumberEnumParams(trait, allValues);
  const [allowed, setAllowed] = useState(activeParams.allowedValues);

  const updateAllowed = function (value: number, isAllowed: boolean) {
    let newAllowed;
    if (isAllowed) {
      newAllowed = [...allowed, value];
    } else {
      newAllowed = allowed.filter((v) => v !== value);
    }
    setAllowed(newAllowed);
    activeParams.allowedValues = newAllowed;
    onFilterChange(activeParams);
  };

  return (
    <>
      {Array.from(values).map(([id, value]) => (
        <div className="form-check" key={id}>
          <input
            className="form-check-input"
            type="checkbox"
            defaultChecked={allowed.includes(id)}
            onChange={(e) => updateAllowed(id, e.target.checked)}
            id={`enum-check-${id}`}
          />
          <label className="form-check-label" htmlFor={`enum-check-${id}`}>
            {value}
          </label>
        </div>
      ))}
    </>
  );
}
