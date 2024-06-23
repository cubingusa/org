import { ComputerParams } from "../trait/params";

export enum FilterType {
  NumberFilter = "number",
  StringFilter = "string",
}

interface FilterParamsBase {
  trait: ComputerParams;
  type: FilterType;
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

export type FilterParams = NumberFilterParams | StringFilterParams;
