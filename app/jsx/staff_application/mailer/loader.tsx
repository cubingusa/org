import { MailerData } from "./types";

export async function MailTemplateLoader({ params }: any): Promise<MailerData> {
  const responses = await fetch(`/staff_api/${params.competitionId}/template`);
  return {
    templates: responses.status == 200 ? await responses.json() : [],
  };
}
