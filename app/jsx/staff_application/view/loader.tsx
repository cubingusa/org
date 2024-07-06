import { SavedView, ViewData } from "./types";
import { ApplicantData } from "../types/applicant_data";

export async function AdminViewLoader({ params }: any): Promise<ViewData> {
  const applicants = await fetch(
    `/staff_api/${params.competitionId}/all_users`,
  );
  const templates = await fetch(
    `/staff_api/${params.competitionId}/template_metadata`,
  );

  return {
    applicants: await applicants.json(),
    templates: await templates.json(),
  };
}

export async function ViewLoader({ params }: any): Promise<SavedView | null> {
  const view = await fetch(
    `/staff_api/${params.competitionId}/view/${params.viewId}`,
  );
  return view.status === 200 ? await view.json() : null;
}
