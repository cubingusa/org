import { Question, QuestionType } from "./types";
import { SubmittedQuestion } from "../types/personal_application_data";
import { Trait } from "../trait/api";
import { TraitType } from "../trait/serialized";

export interface QuestionDisplayProps {
  question: Question;
  myQuestion: SubmittedQuestion;
  onAnswerChange: (myQuestion: SubmittedQuestion) => void;
}

export interface QuestionEditorProps {
  question: Question;
}

export abstract class QuestionApi {
  abstract questionTypeName(): string;
  abstract editor(props: QuestionEditorProps): JSX.Element;
  abstract form(props: QuestionDisplayProps): JSX.Element;
  abstract getTraitType(): TraitType;
  getTraitExtraData(): any {
    return null;
  }
  abstract type(): QuestionType;
}
