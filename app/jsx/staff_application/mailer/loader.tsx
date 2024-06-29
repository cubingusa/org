import { MailerData } from "./types";

export async function MailTemplateLoader({ params }: any): Promise<MailerData> {
  const responses = await fetch(`/staff_api/${params.competitionId}/template`);
  const settings = await fetch(
    `/staff_api/${params.competitionId}/mailer_settings`,
  );
  return {
    templates: responses.status == 200 ? await responses.json() : [],
    settings: await settings.json(),
  };
}
