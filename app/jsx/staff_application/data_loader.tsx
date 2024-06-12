import { CompetitionData } from "./types/competition_data";
import { PersonalApplicationData } from "./types/personal_application_data";

export async function CompetitionDataLoader(
  params: any,
): Promise<CompetitionData> {
  const wcif = await fetch(`/staff_api/${params.competitionId}/wcif`);
  const user = await fetch(`/staff_api/${params.competitionId}/me`);
  const settings = await fetch(`/staff_api/${params.competitionId}/settings`);
  const user_out = user.status == 200 ? await user.json() : null;
  return {
    wcif: await wcif.json(),
    user: user_out,
    settings: await settings.json(),
  };
}

export async function PersonalApplicationDataLoader(
  params: any,
): Promise<PersonalApplicationData> {
  const forms = await fetch(`/staff_api/${params.competitionId}/my_forms`);
  return {
    forms: await forms.json(),
  };
}
