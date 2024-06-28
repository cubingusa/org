import { Question, QuestionType } from "./types";
import { SubmittedQuestion } from "../types/personal_application_data";

export interface QuestionDisplayProps {
  question: Question;
  myQuestion: SubmittedQuestion;
  onAnswerChange: (myQuestion: SubmittedQuestion) => void;
}

export interface QuestionApi {
  editor(): JSX.Element;
  form(props: QuestionDisplayProps): JSX.Element;
  type(): QuestionType;
}
