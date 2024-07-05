export type HookType = "FormSubmitted" | "PropertyAssigned";

interface MailHookBase {
  id: string;
  templateId: string;
  recipient: string;
}

export interface FormSubmittedMailHook extends MailHookBase {
  type: "FormSubmitted";
  formId: number;
}

export interface PropertyAssignedMailHook extends MailHookBase {
  type: "PropertyAssigned";
  propertyId: number;
  propertyValue: number;
}

export type MailHook = FormSubmittedMailHook | PropertyAssignedMailHook;

export interface MailTemplate {
  id: string;
  title: string;
  subjectLine: string;
  design: any;
  html: string;
}

export interface MailMetadata {
  id: string;
  title: string;
}

interface MailerSettings {
  senderAddress: string;
  senderName: string;
}

export interface MailerData {
  mailerSettings: MailerSettings;
  hooks: MailHook[];
  templates: MailMetadata[];
}
