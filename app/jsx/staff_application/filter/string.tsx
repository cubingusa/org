import { useState } from "react";

import { Competition } from "@wca/helpers";

import {
  FilterParams,
  FilterType,
  StringFilterParams,
  StringFilterType,
} from "./params";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { StringTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

function usesReference(type: StringFilterType) {
  return [
    StringFilterType.Equals,
    StringFilterType.NotEquals,
    StringFilterType.Contains,
    StringFilterType.NotContains,
  ].includes(type);
}

const stringTypes = [
  { id: StringFilterType.Equals, name: "Equals" },
  { id: StringFilterType.NotEquals, name: "Does not equal" },
  { id: StringFilterType.Contains, name: "Contains" },
  { id: StringFilterType.NotContains, name: "Does not contain" },
  { id: StringFilterType.IsEmpty, name: "Is empty" },
  { id: StringFilterType.NotEmpty, name: "Is not empty" },
  { id: StringFilterType.IsNull, name: "Is not set" },
  { id: StringFilterType.NotNull, name: "Is set" },
];

export class StringFilter extends Filter {
  constructor(
    private params: StringFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const stringTrait = trait as StringTrait;
    if (
      stringTrait.value() == null &&
      this.params.stringType !== StringFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.stringType) {
      case StringFilterType.Equals:
        return stringTrait.value() === this.params.reference;
      case StringFilterType.NotEquals:
        return stringTrait.value() !== this.params.reference;
      case StringFilterType.Contains:
        return stringTrait.value().includes(this.params.reference);
      case StringFilterType.NotContains:
        return !stringTrait.value().includes(this.params.reference);
      case StringFilterType.IsEmpty:
        return stringTrait.value() === "";
      case StringFilterType.NotEmpty:
        return stringTrait.value() !== "";
      case StringFilterType.IsNull:
        return stringTrait.value() === null;
      case StringFilterType.NotNull:
        return stringTrait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.stringType) {
      case StringFilterType.Equals:
        return (
          <>
            {subDescription} == {this.params.reference}
          </>
        );
      case StringFilterType.NotEquals:
        return (
          <>
            {subDescription} != {this.params.reference}
          </>
        );
      case StringFilterType.Contains:
        return (
          <>
            {subDescription} contains {this.params.reference}
          </>
        );
      case StringFilterType.NotContains:
        return (
          <>
            {subDescription} does not contain {this.params.reference}
          </>
        );
      case StringFilterType.IsEmpty:
        return <>{subDescription} is empty</>;
      case StringFilterType.NotEmpty:
        return <>{subDescription} is not empty</>;
      case StringFilterType.IsNull:
        return <>{subDescription} is not set</>;
      case StringFilterType.NotNull:
        return <>{subDescription} is set</>;
    }
  }

  id(): string {
    if (usesReference(this.params.stringType)) {
      return `SF-${this.params.stringType}-${this.params.reference}`;
    } else {
      return `SF-${this.params.stringType}`;
    }
  }

  static defaultParams(trait: ComputerParams): StringFilterParams {
    return {
      trait,
      type: FilterType.StringFilter,
      stringType: StringFilterType.Equals,
      reference: "",
    };
  }
}

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
  const activeParams = params || StringFilter.defaultParams(trait);
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
      {usesReference(stringType) ? (
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
