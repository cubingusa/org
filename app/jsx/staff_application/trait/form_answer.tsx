import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";
import { DateTime } from "luxon";
import { Competition } from "@wca/helpers";
import { ApplicantData } from "../types/applicant_data";
import {
  ApplicationSettings,
  CompetitionData,
} from "../types/competition_data";
import { Question } from "../question/types";
import { getApi } from "../question/questions";

import { Trait, TraitComputer } from "./api";
import { ComputerType, FormAnswerParams, ComputerParams } from "./params";
import { TraitType } from "./serialized";
import { TraitExtras } from "./extras";
import { NullTrait } from "../trait/types/null";

export class FormAnswerComputer extends TraitComputer {
  constructor(
    private params: FormAnswerParams,
    private settings: ApplicationSettings,
    private wcif: Competition,
  ) {
    super(params);
  }

  getQuestion(): Question | undefined {
    return this.settings.forms
      .find((f) => f.id == this.params.formId)
      ?.questions?.find((q) => q.id == this.params.questionId);
  }

  compute(applicant: ApplicantData): Trait {
    const question = this.getQuestion();
    if (question === undefined) {
      return new NullTrait({});
    }
    const myQuestion = applicant.forms
      .find((f) => f.formId == this.params.formId)
      ?.details?.questions?.find((q) => q.questionId == this.params.questionId);
    const api = getApi(question.questionType, this.wcif);
    return api.toTrait(question, myQuestion);
  }

  id(): string {
    return `FAC-${this.params.formId}-${this.params.questionId}`;
  }

  header(): JSX.Element {
    const question = this.getQuestion();
    return <>{question.name}</>;
  }

  static defaultParams(settings: ApplicationSettings): FormAnswerParams {
    const formId = settings.forms.length > 0 ? settings.forms[0].id : -1;
    const questionId =
      formId >= 0 && settings.forms[0].questions.length > 0
        ? settings.forms[0].questions[0].id
        : -1;

    return {
      type: ComputerType.FormAnswer,
      formId,
      questionId,
    };
  }

  isValid(): boolean {
    const question = this.getQuestion();
    const api = getApi(question.questionType, this.wcif);
    return (
      question !== undefined &&
      api !== null &&
      api.getTraitType() !== TraitType.NullTrait
    );
  }

  formElement(
    params: ComputerParams,
    onTraitChange: (params: ComputerParams) => void,
  ): JSX.Element {
    return (
      <FormAnswerSelector
        params={params as FormAnswerParams}
        onTraitChange={onTraitChange}
      />
    );
  }

  extraDataForDeserialization(): TraitExtras {
    const question = this.getQuestion();
    const api = getApi(question.questionType, this.wcif);
    return api?.getTraitExtraData(question);
  }

  getTraitType(): TraitType {
    const question = this.getQuestion();
    if (question === undefined) {
      return TraitType.NullTrait;
    }
    const api = getApi(question.questionType, this.wcif);
    return api.getTraitType();
  }
}

interface FormAnswerSelectorParams {
  params: FormAnswerParams;
  onTraitChange: (params: ComputerParams) => void;
}
function FormAnswerSelector({
  params,
  onTraitChange,
}: FormAnswerSelectorParams) {
  const [formId, setFormId] = useState(params.formId);
  const [questionId, setQuestionId] = useState(params.questionId);
  const { settings } = useRouteLoaderData("competition") as CompetitionData;

  const updateFormId = function (formId: number) {
    setFormId(formId);
    params.formId = formId;
    onTraitChange(params);
  };

  const updateQuestionId = function (questionId: number) {
    setQuestionId(questionId);
    params.questionId = questionId;
    onTraitChange(params);
  };

  if (settings.forms.length == 0) {
    return <>This competition does not have any forms.</>;
  }
  let formPart = (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <label htmlFor="form-selector" className="col-form-label">
          Form
        </label>
      </div>
      <div className="col-auto">
        <select
          className="form-select"
          value={formId}
          onChange={(e) => updateFormId(+e.target.value)}
        >
          {settings.forms.map((form) => (
            <option value={form.id} key={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  let questionPart;
  const form = settings.forms.find((f) => f.id == formId);
  if (form) {
    questionPart =
      form.questions.length > 0 ? (
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <label htmlFor="form-selector" className="col-form-label">
              Question
            </label>
          </div>
          <div className="col-auto">
            <select
              className="form-select"
              value={questionId}
              onChange={(e) => updateQuestionId(+e.target.value)}
            >
              {form.questions.map((question) => (
                <option value={question.id} key={question.id}>
                  {question.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <>This form does not have any questions.</>
      );
  }
  return (
    <>
      {formPart}
      {questionPart}
    </>
  );
}