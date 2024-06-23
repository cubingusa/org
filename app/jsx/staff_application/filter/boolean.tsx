import { useState } from "react";

import { Competition } from "@wca/helpers";

import {
  FilterParams,
  FilterType,
  BooleanFilterParams,
  BooleanFilterType,
} from "./params";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { BooleanTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

const booleanTypes = [
  { id: BooleanFilterType.IsTrue, name: "True" },
  { id: BooleanFilterType.IsFalse, name: "False" },
  { id: BooleanFilterType.IsNull, name: "Is not set" },
  { id: BooleanFilterType.NotNull, name: "Is set" },
];

export class BooleanFilter extends Filter {
  constructor(
    private params: BooleanFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const booleanTrait = trait as BooleanTrait;
    if (
      booleanTrait.value() == null &&
      this.params.booleanType !== BooleanFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.booleanType) {
      case BooleanFilterType.IsTrue:
        return booleanTrait.value();
      case BooleanFilterType.IsFalse:
        return !booleanTrait.value();
      case BooleanFilterType.IsNull:
        return booleanTrait.value() === null;
      case BooleanFilterType.NotNull:
        return booleanTrait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.booleanType) {
      case BooleanFilterType.IsTrue:
        return <>{subDescription} is true</>;
      case BooleanFilterType.IsFalse:
        return <>{subDescription} is false</>;
      case BooleanFilterType.IsNull:
        return <>{subDescription} is not set</>;
      case BooleanFilterType.NotNull:
        return <>{subDescription} is set</>;
    }
  }

  id(): string {
    return `BF-${this.params.booleanType}`;
  }

  static defaultParams(trait: ComputerParams): BooleanFilterParams {
    return {
      trait,
      type: FilterType.BooleanFilter,
      booleanType: BooleanFilterType.IsTrue,
    };
  }
}

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
  const activeParams = params || BooleanFilter.defaultParams(trait);
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
