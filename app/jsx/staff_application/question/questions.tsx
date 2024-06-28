import { QuestionApi } from "./api";
import { QuestionType } from "./types";
import { TextQuestionApi } from "./text";
import { YesNoQuestionApi } from "./yes_no";
import { AcknowledgementQuestionApi } from "./acknowledgement";

function allQuestionApis(): QuestionApi[] {
  return [
    new TextQuestionApi(),
    new AcknowledgementQuestionApi(),
    new YesNoQuestionApi(),
  ];
}

export function getApi(type: QuestionType): QuestionApi | null {
  return allQuestionApis().find((api) => api.type() == type);
}
