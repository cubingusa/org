export enum QuestionType {
  Null = "null",
  Text = "text",
  YesNo = "yes_no",
  MultipleChoice = "multiple_choice",
  Acknowledgement = "acknowledgement",
  DateTime = "date_time",
  Events = "events",
  Number = "number",
}

export interface EventsQuestion extends QuestionBase {
  questionType: QuestionType.Events;
  maxEvents: number;
}

export interface DateTimeQuestion extends QuestionBase {
  questionType: QuestionType.DateTime;
  userLocalTime: boolean;
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export interface AcknowledgementQuestion extends QuestionBase {
  questionType: QuestionType.Acknowledgement;
}

interface Option {
  id: number;
  value: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  questionType: QuestionType.MultipleChoice;
  options: Option[];
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

export interface NumberQuestion extends QuestionBase {
  questionType: QuestionType.Number;
  minValue: number;
  maxValue: number;
}

export interface QuestionBase {
  // Unique within a form.
  id: number;

  name: string;
  required: boolean;
}

export type Question =
  | YesNoQuestion
  | TextQuestion
  | NullQuestion
  | NumberQuestion
  | MultipleChoiceQuestion
  | AcknowledgementQuestion
  | DateTimeQuestion
  | EventsQuestion;
