export interface MailTemplate {
  id: string;
  title: string;
  subjectLine: string;
  design: any;
  html: string;
}

interface MailerSettings {
  senderAddress: string;
  senderName: string;
}

export interface MailerData {
  templates: MailTemplate[];
  settings: MailerSettings;
}
