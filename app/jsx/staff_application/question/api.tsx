import { Competition } from "@wca/helpers";
import { Question, QuestionType, QuestionBase } from "./types";
import { SubmittedQuestion } from "../types/personal_application_data";
import { Trait } from "../trait/api";
import { TraitType } from "../trait/serialized";
import { TraitExtras } from "../trait/extras";

export interface QuestionDisplayProps {
  question: Question;
  myQuestion: SubmittedQuestion;
  onAnswerChange: (myQuestion: SubmittedQuestion) => void;
}

export interface QuestionEditorProps {
  question: Question;
}

export abstract class QuestionApi {
  constructor(protected wcif: Competition) {}
  abstract questionTypeName(): string;
  abstract editor(props: QuestionEditorProps): JSX.Element;
  abstract form(props: QuestionDisplayProps): JSX.Element;
  abstract getTraitType(): TraitType;
  getTraitExtraData(): TraitExtras {
    return {};
  }
  abstract type(): QuestionType;
  abstract defaultParams(base: QuestionBase): Question;
}
