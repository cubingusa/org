import { Competition } from "@wca/helpers";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { Filter } from "./filter";
import { ApplicationSettings } from "../types/competition_data";

import { NumberFilter } from "./number";
import { StringFilter } from "./string";

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
  }
}
