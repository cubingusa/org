import { Competition } from "@wca/helpers";
import { QuestionApi } from "./api";
import { QuestionType } from "./types";
import { MultipleChoiceQuestionApi } from "./multiple_choice";
import { NullQuestionApi } from "./null";
import { TextQuestionApi } from "./text";
import { YesNoQuestionApi } from "./yes_no";
import { DateTimeQuestionApi } from "./datetime";
import { EventsQuestionApi } from "./events";
import { AcknowledgementQuestionApi } from "./acknowledgement";

export function allQuestionApis(wcif: Competition): QuestionApi[] {
  return [
    new NullQuestionApi(wcif),
    new TextQuestionApi(wcif),
    new AcknowledgementQuestionApi(wcif),
    new YesNoQuestionApi(wcif),
    new DateTimeQuestionApi(wcif),
    new MultipleChoiceQuestionApi(wcif),
    new EventsQuestionApi(wcif),
  ];
}

export function getApi(
  type: QuestionType,
  wcif: Competition,
): QuestionApi | null {
  return allQuestionApis(wcif).find((api) => api.type() == type);
}
