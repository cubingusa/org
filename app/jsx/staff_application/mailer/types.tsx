export interface MailTemplate {
  id: string;
  title: string;
}

export interface MailerData {
  templates: MailTemplate[];
}
