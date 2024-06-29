export interface MailTemplate {
  id: string;
  title: string;
  design: any;
  html: string;
}

export interface MailerData {
  templates: MailTemplate[];
}
