import { ComputerParams } from "../trait/params";

export enum FilterType {
  NumberFilter = "number",
}

interface FilterParamsBase {
  trait: ComputerParams;
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

export type FilterParams = NumberFilterParams;
