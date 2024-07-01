import { Competition } from "@wca/helpers";
import { ComputerParams } from "../../trait/params";

import { FilterType, FilterParamsBase } from "./base";

export enum EventListFilterType {
  Includes = "includes",
  DoesNotInclude = "not_incudes",
}

export const eventListTypes = [
  { id: EventListFilterType.Includes, name: "Includes" },
  { id: EventListFilterType.DoesNotInclude, name: "Does not include" },
];

export interface EventListFilterParams extends FilterParamsBase {
  type: FilterType.EventListFilter;
  eventListType: EventListFilterType;
  referenceEvent: string;
}

export function defaultEventListParams(
  trait: ComputerParams,
  wcif: Competition,
): EventListFilterParams {
  return {
    trait,
    type: FilterType.EventListFilter,
    eventListType: EventListFilterType.Includes,
    referenceEvent: wcif.events[0].id,
  };
}
