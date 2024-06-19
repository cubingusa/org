import { FilterParams } from "./api.proto";
import { ApplicantData } from "../../types/applicant_data";

export interface TableFilter {
  params: FilterParams;
}

export function filterPasses(
  filter: TableFilter,
  applicant: ApplicantData,
): boolean {
  return true;
}

export function decodeFilter(params: FilterParams): TableFilter | null {
  return { params };
}
