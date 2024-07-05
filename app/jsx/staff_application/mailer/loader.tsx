import { MailTemplate, MailerData } from "./types";

export async function MailTemplateLoader({
  params,
}: any): Promise<MailTemplate | null> {
  const template = await fetch(
    `/staff_api/${params.competitionId}/template/${params.templateId}`,
  );
  return template.status == 200 ? await template.json() : null;
}

export async function MailSettingsLoader({ params }: any): Promise<MailerData> {
  const settings = await fetch(
    `/staff_api/${params.competitionId}/mailer_settings`,
  );
  const hooks = await fetch(`/staff_api/${params.competitionId}/hook`);
  const templates = await fetch(
    `/staff_api/${params.competitionId}/template_metadata`,
  );
  return {
    mailerSettings: await settings.json(),
    hooks: await hooks.json(),
    templates: await templates.json(),
  };
}
