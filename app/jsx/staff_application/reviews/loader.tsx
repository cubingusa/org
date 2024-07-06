import { ReviewsData } from "./types";

export async function ReviewsDataLoader({ params }: any): Promise<ReviewsData> {
  const settings = await fetch(
    `/staff_api/${params.competitionId}/review/settings`,
  );
  const applicants = await fetch(
    `/staff_api/${params.competitionId}/all_users`,
  );
  return Object.assign(await settings.json(), {
    applicants: await applicants.json(),
  });
}
