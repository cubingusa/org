import { Competition } from "@wca/helpers";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { Filter } from "./filter";
import { ApplicationSettings } from "../types/competition_data";

import { BooleanFilter } from "./boolean";
import { NumberFilter } from "./number";
import { StringFilter } from "./string";
import { StringEnumFilter, NumberEnumFilter } from "./enum";
import { DateTimeFilter } from "./date_time";
import { EventListFilter } from "./event_list";

export function createFilter(
  params: FilterParams,
  settings: ApplicationSettings,
  wcif: Competition,
): Filter {
  const paramsClone = JSON.parse(JSON.stringify(params));
  switch (paramsClone.type) {
    case FilterType.NumberFilter:
      return new NumberFilter(paramsClone, settings, wcif);
    case FilterType.StringFilter:
      return new StringFilter(paramsClone, settings, wcif);
    case FilterType.BooleanFilter:
      return new BooleanFilter(paramsClone, settings, wcif);
    case FilterType.DateTimeFilter:
      return new DateTimeFilter(paramsClone, settings, wcif);
    case FilterType.StringEnumFilter:
      return new StringEnumFilter(paramsClone, settings, wcif);
    case FilterType.NumberEnumFilter:
      return new NumberEnumFilter(paramsClone, settings, wcif);
    case FilterType.EventListFilter:
      return new EventListFilter(paramsClone, settings, wcif);
  }
}
