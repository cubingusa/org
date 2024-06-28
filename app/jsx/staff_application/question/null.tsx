import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { QuestionType } from "./types";

export class NullQuestionApi implements QuestionApi {
  type(): QuestionType {
    return QuestionType.Null;
  }

  questionTypeName(): string {
    return "";
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return null;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return <></>;
  }
}
