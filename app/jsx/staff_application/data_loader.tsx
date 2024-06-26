import { CompetitionData } from "./types/competition_data";

export async function CompetitionDataLoader({
  params,
}: any): Promise<CompetitionData> {
  const wcif = await fetch(`/staff_api/${params.competitionId}/wcif`);
  const user = await fetch(`/staff_api/${params.competitionId}/me`);
  const settings = await fetch(`/staff_api/${params.competitionId}/settings`);
  const views = await fetch(`/staff_api/${params.competitionId}/view`);
  const user_out = user.status == 200 ? await user.json() : null;
  const forms = await fetch(`/staff_api/${params.competitionId}/my_forms`);
  return {
    wcif: await wcif.json(),
    user: user_out,
    settings: await settings.json(),
    views: await views.json(),
    forms: await forms.json(),
  };
}
