import { ReviewsData } from "./types";

export async function ReviewsDataLoader({ params }: any): Promise<ReviewsData> {
  const applicants = await fetch(
    `/staff_api/${params.competitionId}/all_users`,
  );
  return {
    applicants: await applicants.json(),
  };
}
