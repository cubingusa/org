import { DateTime } from "luxon";

export interface YesNoQuestion {
  questionType: "yes_no";
}

export enum TextQuestionType {
  Long = 0,
  Short = 1,
}

export interface TextQuestion {
  questionType: "text";
  textQuestionType: TextQuestionType;
}

export interface Question {
  // Unique within a form.
  id: number;

  name: string;
  required: boolean;
  question: TextQuestion | YesNoQuestion;
}

export interface Form {
  // Unique within a competition.
  id: number;

  name: string;
  description: string;
  isOpen: boolean;
  deadline: DateTime | null;
}
