import { ComputerParams } from "../../trait/params";

export enum FilterType {
  NullFilter = "null",
  NumberFilter = "number",
  StringFilter = "string",
  BooleanFilter = "boolean",
  DateTimeFilter = "date_time",
}

export interface FilterParamsBase {
  trait: ComputerParams;
  type: FilterType;
}
