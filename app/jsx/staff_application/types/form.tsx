import { FilterParams } from "../filter/types/params";

export enum QuestionType {
  Null = "null",
  Text = "text",
  YesNo = "yes_no",
  MultipleChoice = "multiple_choice",
  Acknowledgement = "acknowledgement",
}

export interface AcknowledgementQuestion extends QuestionBase {
  questionType: QuestionType.Acknowledgement;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  questionType: QuestionType.MultipleChoice;
  options: Map<number, string>;
  nextOptionId: number;
  multipleAllowed: boolean;
}

export interface YesNoQuestion extends QuestionBase {
  questionType: QuestionType.YesNo;
}

export enum TextQuestionType {
  Long = 0,
  Short = 1,
}

export interface TextQuestion extends QuestionBase {
  questionType: QuestionType.Text;
  textQuestionType: TextQuestionType;
}

export interface NullQuestion extends QuestionBase {
  questionType: QuestionType.Null;
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
  | MultipleChoiceQuestion
  | AcknowledgementQuestion;

export interface Form {
  // Unique within a competition.
  id: number;

  name: string;
  description: string;
  isOpen: boolean;
  deadlineSeconds: number;
  nextQuestionId: number;

  questions: Question[];
  filters: FilterParams[];
}
