import { ComputerParams } from "../../trait/params";

import { FilterType, FilterParamsBase } from "./base";

export interface NullFilterParams extends FilterParamsBase {
  type: FilterType.NullFilter;
}

export function defaultNullParams(trait: ComputerParams): NullFilterParams {
  return {
    trait,
    type: FilterType.NullFilter,
  };
}
