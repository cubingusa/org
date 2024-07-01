export interface SubmittedQuestion {
  questionId: number;
  booleanAnswer?: boolean;
  textAnswer?: string;
  numberAnswer?: number;
  textListAnswer?: string[];
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
