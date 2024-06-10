import { DateTime } from "luxon";

export interface YesNoQuestion extends QuestionBase {
  questionType: "yes_no";
}

export enum TextQuestionType {
  Long = 0,
  Short = 1,
}

export interface TextQuestion extends QuestionBase {
  questionType: "text";
  textQuestionType: TextQuestionType;
}

export interface NullQuestion extends QuestionBase {
  questionType: "null";
}

interface QuestionBase {
  // Unique within a form.
  id: number;

  name: string;
  required: boolean;
  questionType: "yes_no" | "text" | "null";
}

export type Question = YesNoQuestion | TextQuestion | NullQuestion;

export interface Form {
  // Unique within a competition.
  id: number;

  name: string;
  description: string;
  isOpen: boolean;
  deadline: DateTime | null;
  nextQuestionId: number;

  questions: Question[];
}
