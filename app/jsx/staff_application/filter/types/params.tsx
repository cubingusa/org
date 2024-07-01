import { NumberFilterParams } from "./number";
import { NullFilterParams } from "./null";
import { StringFilterParams } from "./string";
import { BooleanFilterParams } from "./boolean";
import { DateTimeFilterParams } from "./date_time";
import { EventListFilterParams } from "./event_list";
import { NumberEnumFilterParams, StringEnumFilterParams } from "./enum";

export type FilterParams =
  | NullFilterParams
  | NumberFilterParams
  | StringFilterParams
  | BooleanFilterParams
  | DateTimeFilterParams
  | NumberEnumFilterParams
  | StringEnumFilterParams
  | EventListFilterParams;
