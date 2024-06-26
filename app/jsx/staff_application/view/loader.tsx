import { SavedView } from "./types";

export async function ViewLoader({ params }: any): Promise<SavedView | null> {
  const view = await fetch(
    `/staff_api/${params.competitionId}/view/${params.viewId}`,
  );
  return view.status === 200 ? await view.json() : null;
}
