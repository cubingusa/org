import { ApplicantData } from "../../types/applicant_data";

export interface TableFilter {}

export function filterPasses(
  filter: TableFilter,
  applicant: ApplicantData,
): boolean {
  return true;
}
