import { NumberFilterParams } from "./number";
import { NullFilterParams } from "./null";
import { StringFilterParams } from "./string";
import { BooleanFilterParams } from "./boolean";
import { DateTimeFilterParams } from "./date_time";

export type FilterParams =
  | NullFilterParams
  | NumberFilterParams
  | StringFilterParams
  | BooleanFilterParams
  | DateTimeFilterParams;
