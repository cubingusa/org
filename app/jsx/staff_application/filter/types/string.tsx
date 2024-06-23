import { ComputerParams } from "../../trait/params";

import { FilterType, FilterParamsBase } from "./base";

export enum StringFilterType {
  Equals = "=",
  NotEquals = "!",
  IsEmpty = "empty",
  NotEmpty = "not_empty",
  Contains = "contains",
  NotContains = "not_contains",
  IsNull = "null",
  NotNull = "not_null",
}

export function stringFilterUsesReference(type: StringFilterType) {
  return [
    StringFilterType.Equals,
    StringFilterType.NotEquals,
    StringFilterType.Contains,
    StringFilterType.NotContains,
  ].includes(type);
}

export const stringTypes = [
  { id: StringFilterType.Equals, name: "Equals" },
  { id: StringFilterType.NotEquals, name: "Does not equal" },
  { id: StringFilterType.Contains, name: "Contains" },
  { id: StringFilterType.NotContains, name: "Does not contain" },
  { id: StringFilterType.IsEmpty, name: "Is empty" },
  { id: StringFilterType.NotEmpty, name: "Is not empty" },
  { id: StringFilterType.IsNull, name: "Is not set" },
  { id: StringFilterType.NotNull, name: "Is set" },
];

export interface StringFilterParams extends FilterParamsBase {
  type: FilterType.StringFilter;
  stringType: StringFilterType;
  reference: string;
}

export function defaultStringParams(trait: ComputerParams): StringFilterParams {
  return {
    trait,
    type: FilterType.StringFilter,
    stringType: StringFilterType.Equals,
    reference: "",
  };
}
