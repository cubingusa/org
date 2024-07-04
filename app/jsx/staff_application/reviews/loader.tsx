import { ReviewsData } from "./types";

export async function ReviewsDataLoader({ params }: any): Promise<ReviewsData> {
  const settings = await fetch(
    `/staff_api/${params.competitionId}/review/settings`,
  );
  return (await settings.json()) as ReviewsData;
}
