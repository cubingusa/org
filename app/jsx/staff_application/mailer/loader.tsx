import { MailerData } from "./types";

export async function MailTemplateLoader({ params }: any): Promise<MailerData> {
  const settings = await fetch(
    `/staff_api/${params.competitionId}/mailer_settings`,
  );
  return {
    settings: await settings.json(),
  };
}
