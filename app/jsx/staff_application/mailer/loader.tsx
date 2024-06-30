import { MailerData } from "./types";

export async function MailTemplateLoader({ params }: any): Promise<MailerData> {
  const settings = await fetch(
    `/staff_api/${params.competitionId}/mailer_settings`,
  );
  const hooks = await fetch(`/staff_api/${params.competitionId}/hook`);
  return {
    mailerSettings: await settings.json(),
    hooks: await hooks.json(),
  };
}
