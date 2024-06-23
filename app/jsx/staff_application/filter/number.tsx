import { useState } from "react";

import { Competition } from "@wca/helpers";

import {
  FilterParams,
  FilterType,
  NumberFilterParams,
  NumberFilterType,
} from "./params";
import { Filter } from "./filter";
import { ComputerParams } from "../trait/params";
import { NumberTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

function usesReference(type: NumberFilterType) {
  return [
    NumberFilterType.Equals,
    NumberFilterType.NotEquals,
    NumberFilterType.GreaterThan,
    NumberFilterType.LessThan,
    NumberFilterType.GreaterThanOrEqual,
    NumberFilterType.LessThanOrEqual,
  ].includes(type);
}

const numberTypes = [
  { id: NumberFilterType.Equals, name: "Equals" },
  { id: NumberFilterType.NotEquals, name: "Does not equal" },
  { id: NumberFilterType.GreaterThan, name: "Greater than" },
  { id: NumberFilterType.LessThan, name: "Less than" },
  { id: NumberFilterType.GreaterThanOrEqual, name: "Greater than or equal" },
  { id: NumberFilterType.LessThanOrEqual, name: "Less than or equal" },
  { id: NumberFilterType.Even, name: "Even" },
  { id: NumberFilterType.Odd, name: "Odd" },
  { id: NumberFilterType.IsNull, name: "Is null" },
  { id: NumberFilterType.NotNull, name: "Is not null" },
];

export class NumberFilter extends Filter<NumberTrait> {
  constructor(
    private params: NumberFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: NumberTrait): boolean {
    if (
      trait.value() === null &&
      this.params.numberType !== NumberFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.numberType) {
      case NumberFilterType.Equals:
        return trait.value() === this.params.reference;
      case NumberFilterType.NotEquals:
        return trait.value() !== this.params.reference;
      case NumberFilterType.GreaterThan:
        return trait.value() > this.params.reference;
      case NumberFilterType.LessThan:
        return trait.value() < this.params.reference;
      case NumberFilterType.GreaterThanOrEqual:
        return trait.value() >= this.params.reference;
      case NumberFilterType.LessThanOrEqual:
        return trait.value() <= this.params.reference;
      case NumberFilterType.Even:
        return trait.value() % 2 == 0;
      case NumberFilterType.Odd:
        return trait.value() % 2 == 1;
      case NumberFilterType.IsNull:
        return trait.value() === null;
      case NumberFilterType.NotNull:
        return trait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.numberType) {
      case NumberFilterType.Equals:
        return (
          <>
            {subDescription} == {this.params.reference}
          </>
        );
      case NumberFilterType.NotEquals:
        return (
          <>
            {subDescription} != {this.params.reference}
          </>
        );
      case NumberFilterType.GreaterThan:
        return (
          <>
            {subDescription} &gt; {this.params.reference}
          </>
        );
      case NumberFilterType.LessThan:
        return (
          <>
            {subDescription} &lt; {this.params.reference}
          </>
        );
      case NumberFilterType.GreaterThanOrEqual:
        return (
          <>
            {subDescription} &gt;= {this.params.reference}
          </>
        );
      case NumberFilterType.LessThanOrEqual:
        return (
          <>
            {subDescription} &lt;= {this.params.reference}
          </>
        );
      case NumberFilterType.Even:
        return <>{subDescription} even</>;
      case NumberFilterType.Odd:
        return <>{subDescription} is odd</>;
      case NumberFilterType.IsNull:
        return <>{subDescription} is null</>;
      case NumberFilterType.NotNull:
        return <>{subDescription} is not null</>;
    }
  }

  id(): string {
    if (usesReference(this.params.numberType)) {
      return `NF-${this.params.numberType}-${this.params.reference}`;
    } else {
      return `NF-${this.params.numberType}`;
    }
  }

  static defaultParams(trait: ComputerParams): NumberFilterParams {
    return {
      trait,
      type: FilterType.NumberFilter,
      numberType: NumberFilterType.Equals,
      reference: 0,
    };
  }
}

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
  const activeParams = params || NumberFilter.defaultParams(trait);
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
      <div className="col-auto">
        <input
          className="form-control"
          type="number"
          value={reference}
          onChange={(e) => updateReference(+e.target.value)}
        />
      </div>
    </div>
  );
}
