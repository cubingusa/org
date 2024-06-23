import { ComputerParams } from "../../trait/params";
import { FilterType, FilterParamsBase } from "./base";

export enum NumberFilterType {
  Equals = "=",
  NotEquals = "!",
  GreaterThan = ">",
  LessThan = "<",
  GreaterThanOrEqual = ">=",
  LessThanOrEqual = "<=",
  Even = "even",
  Odd = "odd",
  IsNull = "null",
  NotNull = "not_null",
}

export interface NumberFilterParams extends FilterParamsBase {
  type: FilterType.NumberFilter;
  numberType: NumberFilterType;
  reference: number;
}

export function defaultNumberParams(trait: ComputerParams): NumberFilterParams {
  return {
    trait,
    type: FilterType.NumberFilter,
    numberType: NumberFilterType.Equals,
    reference: 0,
  };
}

export function numberFilterUsesReference(type: NumberFilterType) {
  return [
    NumberFilterType.Equals,
    NumberFilterType.NotEquals,
    NumberFilterType.GreaterThan,
    NumberFilterType.LessThan,
    NumberFilterType.GreaterThanOrEqual,
    NumberFilterType.LessThanOrEqual,
  ].includes(type);
}

export const numberTypes = [
  { id: NumberFilterType.Equals, name: "Equals" },
  { id: NumberFilterType.NotEquals, name: "Does not equal" },
  { id: NumberFilterType.GreaterThan, name: "Greater than" },
  { id: NumberFilterType.LessThan, name: "Less than" },
  { id: NumberFilterType.GreaterThanOrEqual, name: "Greater than or equal" },
  { id: NumberFilterType.LessThanOrEqual, name: "Less than or equal" },
  { id: NumberFilterType.Even, name: "Even" },
  { id: NumberFilterType.Odd, name: "Odd" },
  { id: NumberFilterType.IsNull, name: "Is empty" },
  { id: NumberFilterType.NotNull, name: "Is not empty" },
];
