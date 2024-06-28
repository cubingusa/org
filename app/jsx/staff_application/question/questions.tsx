import { QuestionApi } from "./api";
import { QuestionType } from "./types";
import { NullQuestionApi } from "./null";
import { TextQuestionApi } from "./text";
import { YesNoQuestionApi } from "./yes_no";
import { AcknowledgementQuestionApi } from "./acknowledgement";

export function allQuestionApis(): QuestionApi[] {
  return [
    new NullQuestionApi(),
    new TextQuestionApi(),
    new AcknowledgementQuestionApi(),
    new YesNoQuestionApi(),
  ];
}

export function getApi(type: QuestionType): QuestionApi | null {
  return allQuestionApis().find((api) => api.type() == type);
}
