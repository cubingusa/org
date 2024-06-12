export interface SubmittedQuestion {
  questionId: number;
  booleanAnswer?: boolean;
  textAnswer?: string;
  numberAnswer?: number;
}

export interface SubmittedFormDetails {
  questions: SubmittedQuestion[];
}

export interface SubmittedForm {
  formId: number;
  submittedAtTs: number;
  updatedAtTs: number;
  details: SubmittedFormDetails;
}

export interface PersonalApplicationData {
  forms: SubmittedForm[];
}
