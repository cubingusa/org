import { ApplicantData } from "../types/applicant_data";

export async function ApplicantLoader({
  params,
}: any): Promise<ApplicantData[]> {
  const forms = await fetch(`/staff_api/${params.competitionId}/all_users`);
  return await forms.json();
}
