import { CompetitionData } from "./types/competition_data";

export async function CompetitionDataLoader({
  params,
}: any): Promise<CompetitionData> {
  const wcif = await fetch(`/staff_api/${params.competitionId}/wcif`);
  const user = await fetch(`/staff_api/${params.competitionId}/me`);
  const settings = await fetch(`/staff_api/${params.competitionId}/settings`);
  const views = await fetch(`/staff_api/${params.competitionId}/view`);
  const forms = await fetch(`/staff_api/${params.competitionId}/my_forms`);
  const myReviews = await fetch(
    `/staff_api/${params.competitionId}/review/mine`,
  );
  return {
    wcif: await wcif.json(),
    user: user.status == 200 ? await user.json() : null,
    settings: await settings.json(),
    views: await views.json(),
    forms: await forms.json(),
    myReviews: await myReviews.json(),
  };
}
