export enum ComputerType {
  PersonalAttribute = "personal_attribute",
  FormAnswer = "form_answer",
  FormMetadata = "form_metadata",
  Property = "property",
}

export enum PersonalAttributeType {
  Name = "name",
  WcaId = "wca_id",
  WcaUserId = "wca_user_id",
  Age = "age",
  DelegateStatus = "delegate_status",
  ListedOrganizer = "listed_organizer",
  ListedDelegate = "listed_delegate",
  Registered = "registered",
}

export interface PersonalAttributeParams {
  type: ComputerType.PersonalAttribute;
  attributeType: PersonalAttributeType;
}

export interface FormAnswerParams {
  type: ComputerType.FormAnswer;
  formId: number;
  questionId: number;
}

export enum FormMetadataType {
  Submitted = "submitted",
  SubmitTime = "submit_time",
  UpdateTime = "update_time",
}

export interface FormMetadataParams {
  type: ComputerType.FormMetadata;
  metadataType: FormMetadataType;
  formId: number;
}

export interface PropertyParams {
  type: ComputerType.Property;
  propertyId: number;
}

export type ComputerParams =
  | PersonalAttributeParams
  | FormAnswerParams
  | FormMetadataParams
  | PropertyParams;
