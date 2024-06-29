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

import { FilterParams } from "../filter/types/params";
import { FilterType } from "../filter/types/base";
import {
  BooleanFilterParams,
  BooleanFilterType,
  defaultBooleanParams,
} from "../filter/types/boolean";
import {
  StringFilterParams,
  StringFilterType,
  defaultStringParams,
} from "../filter/types/string";
import { defaultNullParams } from "../filter/types/null";
import { BooleanFilterSelector } from "../filter/selector/boolean";
import { StringFilterSelector } from "../filter/selector/string";

import { Trait, TraitComputer } from "./api";
import { ComputerType, FormAnswerParams, ComputerParams } from "./params";
import { StringTrait, BooleanTrait, NullTrait, DateTimeTrait } from "./traits";
import { TraitType } from "./serialized";
import { TraitExtras } from "./extras";

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
    switch (api?.getTraitType()) {
      case TraitType.NullTrait:
        return new NullTrait({});
      case TraitType.StringTrait:
        return new StringTrait({
          val: myQuestion === undefined ? null : myQuestion.textAnswer,
        });
      case TraitType.BooleanTrait:
        return new BooleanTrait({
          val: myQuestion === undefined ? null : myQuestion.booleanAnswer,
        });
      case TraitType.DateTimeTrait:
        return new DateTimeTrait({
          val:
            myQuestion === undefined
              ? null
              : DateTime.fromSeconds(myQuestion.numberAnswer),
          extras: api.getTraitExtraData(),
        });
    }
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

  defaultFilterParams(): FilterParams {
    const question = this.getQuestion();
    if (!question) {
      return defaultNullParams(this.params);
    }
    const api = getApi(question.questionType, this.wcif);
    switch (api?.getTraitType()) {
      case TraitType.NullTrait:
        return defaultNullParams(this.params);
      case TraitType.StringTrait:
        return defaultStringParams(this.params);
      case TraitType.BooleanTrait:
        return defaultBooleanParams(this.params);
    }
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

  filterSelector(
    params: FilterParams | null,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element {
    return (
      <FormAnswerFilterSelector
        params={params}
        computerParams={this.params}
        onFilterChange={onFilterChange}
      />
    );
  }

  extraDataForDeserialization(): TraitExtras {
    const question = this.getQuestion();
    const api = getApi(question.questionType, this.wcif);
    return api?.getTraitExtraData();
  }
}

interface FormAnswerFilterSelectorParams {
  params: FilterParams | null;
  computerParams: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
function FormAnswerFilterSelector({
  params,
  computerParams,
  onFilterChange,
}: FormAnswerFilterSelectorParams) {
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const formAnswerParams = computerParams as FormAnswerParams;

  const question = settings.forms
    .find((f) => f.id == formAnswerParams.formId)
    ?.questions?.find((q) => q.id == formAnswerParams.questionId);
  if (question === undefined) {
    return <></>;
  }
  const api = getApi(question.questionType, wcif);
  switch (api?.getTraitType()) {
    case TraitType.StringTrait:
      return (
        <StringFilterSelector
          params={params as StringFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
    case TraitType.BooleanTrait:
      return (
        <BooleanFilterSelector
          params={params as BooleanFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
  }
  return <></>;
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
