import { DateTime } from "luxon";

import { ComputerParams } from "../../trait/params";

import { FilterType, FilterParamsBase } from "./base";

export enum DateTimeFilterType {
  IsBefore = "before",
  IsAfter = "after",
  IsNull = "null",
  NotNull = "not_null",
}

export enum DateTimeFilterTimeZone {
  UserLocal = "local",
  Competition = "competition",
}

export interface DateTimeFilterParams extends FilterParamsBase {
  type: FilterType.DateTimeFilter;
  dateTimeType: DateTimeFilterType;
  referenceSeconds: number;
  timeZone: DateTimeFilterTimeZone;
}

export function defaultDateTimeParams(
  trait: ComputerParams,
): DateTimeFilterParams {
  return {
    trait,
    type: FilterType.DateTimeFilter,
    dateTimeType: DateTimeFilterType.IsBefore,
    referenceSeconds: DateTime.now().toSeconds(),
    timeZone: DateTimeFilterTimeZone.UserLocal,
  };
}

export function dateTimeFilterUsesReference(type: DateTimeFilterType) {
  return [DateTimeFilterType.IsBefore, DateTimeFilterType.IsAfter].includes(
    type,
  );
}

export const dateTimeTypes = [
  { id: DateTimeFilterType.IsBefore, name: "Before" },
  { id: DateTimeFilterType.IsAfter, name: "After" },
  { id: DateTimeFilterType.IsNull, name: "Empty" },
  { id: DateTimeFilterType.NotNull, name: "Not empty" },
];
