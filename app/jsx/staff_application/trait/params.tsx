enum ComputerType {
  PersonalAttribute = "personal_attribute",
  FormAnswer = "form_answer",
  FormMetadata = "form_metadata",
  Property = "property",
}

enum PersonalAttributeType {
  Name = "name",
  WcaId = "wca_id",
  WcaUserId = "wca_user_id",
  Age = "age",
  DelegateStatus = "delegate_status",
  ListedOrganizer = "listed_organizer",
  ListedDelegate = "listed_delegate",
  Registered = "registered",
}

interface PersonalAttributeParams {
  type: ComputerType.PersonalAttribute;
  attributeType: PersonalAttributeType;
}

interface FormAnswerParams {
  type: ComputerType.FormAnswer;
  formId: number;
  questionId: number;
}

enum FormMetadataType {
  Submitted = "submitted",
  SubmitTime = "submit_time",
  UpdateTime = "update_time",
}

interface FormMetadataParams {
  type: ComputerType.FormMetadata;
  metadataType: FormMetadataType;
  formId: number;
}

interface PropertyParams {
  type: ComputerType.Property;
  propertyId: number;
}

type ComputerParams =
  | PersonalAttributeParams
  | FormAnswerParams
  | FormMetadataParams
  | PropertyParams;
