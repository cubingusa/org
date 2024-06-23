import { FilterType, FilterParamsBase } from "./base";
import { ComputerParams } from "../../trait/params";

export enum BooleanFilterType {
  IsTrue = "true",
  IsFalse = "false",
  IsNull = "null",
  NotNull = "not_null",
}

export const booleanTypes = [
  { id: BooleanFilterType.IsTrue, name: "True" },
  { id: BooleanFilterType.IsFalse, name: "False" },
  { id: BooleanFilterType.IsNull, name: "Is not set" },
  { id: BooleanFilterType.NotNull, name: "Is set" },
];

export interface BooleanFilterParams extends FilterParamsBase {
  type: FilterType.BooleanFilter;
  booleanType: BooleanFilterType;
}

export function defaultBooleanParams(
  trait: ComputerParams,
): BooleanFilterParams {
  return {
    trait,
    type: FilterType.BooleanFilter,
    booleanType: BooleanFilterType.IsTrue,
  };
}
