import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";
import { ApplicantData } from "../types/applicant_data";
import {
  ApplicationSettings,
  CompetitionData,
} from "../types/competition_data";
import { Question, QuestionType } from "../types/form";
import { FilterParams, FilterType, StringFilterType } from "../filter/params";
import { Trait, TraitComputer } from "./api";
import { ComputerType, FormAnswerParams, ComputerParams } from "./params";
import { StringTrait, BooleanTrait, NullTrait } from "./traits";

export class FormAnswerComputer extends TraitComputer {
  constructor(
    private params: FormAnswerParams,
    private settings: ApplicationSettings,
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
    switch (question.questionType) {
      case QuestionType.Null:
        return new NullTrait({});
      case QuestionType.Text:
        return new StringTrait({
          val: myQuestion === undefined ? null : myQuestion.textAnswer,
        });
      case QuestionType.YesNo:
        return new BooleanTrait({
          val: myQuestion === undefined ? null : myQuestion.booleanAnswer,
        });
      case QuestionType.MultipleChoice:
        // TODO: switch to EnumTrait.
        return new StringTrait({
          val: question.options.has(myQuestion?.numberAnswer)
            ? question.options.get(myQuestion.numberAnswer)
            : null,
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
      return {
        type: FilterType.NullFilter,
        trait: this.params,
      };
    }
    switch (question.questionType) {
      case QuestionType.Null:
        return {
          type: FilterType.NullFilter,
          trait: this.params,
        };
      case QuestionType.Text:
        return {
          type: FilterType.StringFilter,
          trait: this.params,
          stringType: StringFilterType.Equals,
          reference: "",
        };
      case QuestionType.YesNo:
      case QuestionType.MultipleChoice:
    }
  }

  isValid(): boolean {
    const question = this.getQuestion();
    return (
      question !== undefined && question.questionType !== QuestionType.Null
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
    const question = this.getQuestion();
    if (question === undefined) {
      return <></>;
    }
    switch (question.questionType) {
      case QuestionType.Text:
      case QuestionType.YesNo:
      case QuestionType.MultipleChoice:
    }
    return <></>;
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
