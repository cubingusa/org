import { Competition } from "@wca/helpers";
import { FilterParams, FilterType } from "./params";
import { Filter } from "./filter";
import { ApplicationSettings } from "../types/competition_data";

import { NumberFilter } from "./number";

export function createFilter(
  params: FilterParams,
  settings: ApplicationSettings,
  wcif: Competition,
): Filter {
  const paramsClone = JSON.parse(JSON.stringify(params));
  switch (paramsClone.type) {
    case FilterType.NumberFilter:
      return new NumberFilter(paramsClone, settings, wcif);
  }
}
