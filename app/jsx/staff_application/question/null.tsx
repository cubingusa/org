import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { QuestionType, NullQuestion, QuestionBase } from "./types";
import { TraitType } from "../trait/serialized";

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
}
