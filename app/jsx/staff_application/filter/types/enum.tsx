import { FilterType, FilterParamsBase } from "./base";
import { ComputerParams } from "../../trait/params";

export interface EnumFilterValue<T> {
  key: T;
  value: string;
}

export interface EnumFilterParams<T> extends FilterParamsBase {
  allowedValues: T[];
  allValuesForDebugging: EnumFilterValue<T>[];
}

export interface NumberEnumFilterParams extends EnumFilterParams<number> {
  type: FilterType.NumberEnumFilter;
}
export function defaultNumberEnumParams(
  trait: ComputerParams,
  allValuesForDebugging: EnumFilterValue<number>[],
): NumberEnumFilterParams {
  return {
    trait,
    type: FilterType.NumberEnumFilter,
    allowedValues: [],
    allValuesForDebugging,
  };
}

export interface StringEnumFilterParams extends EnumFilterParams<string> {
  type: FilterType.StringEnumFilter;
}
export function defaultStringEnumParams(
  trait: ComputerParams,
  allValuesForDebugging: EnumFilterValue<string>[],
): StringEnumFilterParams {
  return {
    trait,
    type: FilterType.StringEnumFilter,
    allowedValues: [],
    allValuesForDebugging,
  };
}
