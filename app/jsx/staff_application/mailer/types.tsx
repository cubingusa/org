export interface MailTemplate {
  id: string;
  title: string;
  subjectLine: string;
  design: any;
  html: string;
}

export interface MailerData {
  templates: MailTemplate[];
}
