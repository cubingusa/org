import { ComputerParams } from "../../trait/params";

export enum FilterType {
  NullFilter = "null",
  NumberFilter = "number",
  StringFilter = "string",
  BooleanFilter = "boolean",
  DateTimeFilter = "date_time",
  NumberEnumFilter = "number_enum",
  StringEnumFilter = "string_enum",
  EventListFilter = "event_list",
}

export interface FilterParamsBase {
  trait: ComputerParams;
  type: FilterType;
}
