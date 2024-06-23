import { ComputerParams } from "../trait/params";

export enum FilterType {
  NullFilter = "null",
  NumberFilter = "number",
  StringFilter = "string",
  BooleanFilter = "boolean",
  DateTimeFilter = "date_time",
}

interface FilterParamsBase {
  trait: ComputerParams;
  type: FilterType;
}

export interface NullFilterParams extends FilterParamsBase {
  type: FilterType.NullFilter;
}

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

export interface StringFilterParams extends FilterParamsBase {
  type: FilterType.StringFilter;
  stringType: StringFilterType;
  reference: string;
}

export enum BooleanFilterType {
  IsTrue = "true",
  IsFalse = "false",
  IsNull = "null",
  NotNull = "not_null",
}

export interface BooleanFilterParams extends FilterParamsBase {
  type: FilterType.BooleanFilter;
  booleanType: BooleanFilterType;
}

export enum DateTimeFilterType {
  IsBefore = "before",
  IsAfter = "after",
  IsNull = "null",
  NotNull = "not_null",
}

export interface DateTimeFilterParams extends FilterParamsBase {
  type: FilterType.DateTimeFilter;
  referenceSeconds: number;
}

export type FilterParams =
  | NullFilterParams
  | NumberFilterParams
  | StringFilterParams
  | BooleanFilterParams
  | DateTimeFilterParams;
