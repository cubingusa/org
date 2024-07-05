import { MailHook, MailMetadata } from "./types";
import { ApplicationSettings } from "../types/competition_data";

export function hookToText(
  hook: MailHook,
  settings: ApplicationSettings,
  templates: MailMetadata[],
): string {
  let triggerPart = "When <broken condition>";
  switch (hook.type) {
    case "PropertyAssigned":
      const property = settings.properties.find((p) => p.id == hook.propertyId);
      const value = property?.values?.find((v) => v.id == hook.propertyValue);
      if (value !== undefined) {
        triggerPart = `When the applicant's ${property.name} is set to ${value.value}`;
      }
      break;
    case "FormSubmitted":
      const form = settings.forms.find((f) => f.id == hook.formId);
      if (form !== undefined) {
        triggerPart = `When the applicant submits ${form.name}`;
      }
      break;
  }
  let actionPart;
  if (hook.recipient == "User") {
    actionPart = "email the applicant";
  } else {
    actionPart = `email ${hook.recipient}`;
  }
  let templatePart;
  const template = templates.find((t) => t.id == hook.templateId);
  return `${triggerPart}, ${actionPart}`;
}
