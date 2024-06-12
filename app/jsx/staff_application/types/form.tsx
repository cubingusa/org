import { DateTime } from "luxon";

export interface MultipleChoiceQuestion extends QuestionBase {
  questionType: "multiple_choice";
  options: Map<number, string>;
  nextOptionId: number;
  multipleAllewd: boolean;
}

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
}

export type Question =
  | YesNoQuestion
  | TextQuestion
  | NullQuestion
  | MultipleChoiceQuestion;

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
