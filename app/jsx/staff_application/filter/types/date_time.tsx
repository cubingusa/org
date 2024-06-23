import { ComputerParams } from "../../trait/params";

import { FilterType, FilterParamsBase } from "./base";

export enum DateTimeFilterType {
  IsBefore = "before",
  IsAfter = "after",
  IsNull = "null",
  NotNull = "not_null",
}

export interface DateTimeFilterParams extends FilterParamsBase {
  type: FilterType.DateTimeFilter;
  dateTimeType: DateTimeFilterType;
  referenceSeconds: number;
}

export function defaultDateTimeParams(
  trait: ComputerParams,
): DateTimeFilterParams {
  return {
    trait,
    type: FilterType.DateTimeFilter,
    dateTimeType: DateTimeFilterType.IsBefore,
    referenceSeconds: 0,
  };
}
