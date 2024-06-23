import { ComputerParams } from "../trait/params";

export enum FilterType {
  NullFilter = "null",
  NumberFilter = "number",
  StringFilter = "string",
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
}

export interface StringFilterParams extends FilterParamsBase {
  type: FilterType.StringFilter;
  stringType: StringFilterType;
  reference: string;
}

export type FilterParams =
  | NullFilterParams
  | NumberFilterParams
  | StringFilterParams;
