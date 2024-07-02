import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { Question, QuestionType, NullQuestion, QuestionBase } from "./types";
import { NullTrait } from "../trait/traits";
import { TraitType } from "../trait/serialized";
import { SubmittedQuestion } from "../types/personal_application_data";

export class NullQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.Null;
  }

  questionTypeName(): string {
    return "";
  }

  getTraitType(): TraitType {
    return TraitType.NullTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return null;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return <></>;
  }

  defaultParams(base: QuestionBase): NullQuestion {
    return Object.assign(base as NullQuestion, {
      questionType: QuestionType.Null,
    });
  }

  toTrait(question: Question, myQuestion: SubmittedQuestion): NullTrait {
    return new NullTrait({});
  }
}
