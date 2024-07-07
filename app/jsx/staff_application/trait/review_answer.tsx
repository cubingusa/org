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
import { ComputerType, ReviewAnswerParams, ComputerParams } from "./params";
import { TraitType } from "./serialized";
import { TraitExtras } from "./extras";
import { NullTrait } from "../trait/types/null";

export class ReviewAnswerComputer extends TraitComputer {
  constructor(
    private params: ReviewAnswerParams,
    private settings: ApplicationSettings,
    private wcif: Competition,
  ) {
    super(params);
  }

  getQuestion(): Question | undefined {
    return this.settings.reviewForms
      .find((f) => f.id == this.params.reviewFormId)
      ?.questions?.find((q) => q.id == this.params.questionId);
  }

  compute(applicant: ApplicantData): Trait {
    const question = this.getQuestion();
    if (question === undefined) {
      return new NullTrait({});
    }
    const myQuestion = applicant.reviews
      .find((f) => f.reviewFormId == this.params.reviewFormId)
      ?.questions?.find((q) => q.questionId == this.params.questionId);
    const api = getApi(question.questionType, this.wcif);
    return api.toTrait(question, myQuestion);
  }

  id(): string {
    return `RAC-${this.params.reviewFormId}-${this.params.questionId}`;
  }

  header(): JSX.Element {
    const question = this.getQuestion();
    return <>{question.name}</>;
  }

  static defaultParams(settings: ApplicationSettings): ReviewAnswerParams {
    const reviewFormId =
      settings.reviewForms.length > 0 ? settings.reviewForms[0].id : -1;
    const questionId =
      reviewFormId >= 0 && settings.reviewForms[0].questions.length > 0
        ? settings.reviewForms[0].questions[0].id
        : -1;

    return {
      type: ComputerType.ReviewAnswer,
      reviewFormId,
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
      <ReviewAnswerSelector
        params={params as ReviewAnswerParams}
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

interface ReviewAnswerSelectorParams {
  params: ReviewAnswerParams;
  onTraitChange: (params: ComputerParams) => void;
}
function ReviewAnswerSelector({
  params,
  onTraitChange,
}: ReviewAnswerSelectorParams) {
  const [reviewFormId, setReviewFormId] = useState(params.reviewFormId);
  const [questionId, setQuestionId] = useState(params.questionId);
  const { settings } = useRouteLoaderData("competition") as CompetitionData;

  const updateReviewFormId = function (reviewFormId: number) {
    setReviewFormId(reviewFormId);
    params.reviewFormId = reviewFormId;
    onTraitChange(params);
  };

  const updateQuestionId = function (questionId: number) {
    setQuestionId(questionId);
    params.questionId = questionId;
    onTraitChange(params);
  };

  if (settings.reviewForms.length == 0) {
    return <>This competition does not have any reviews.</>;
  }
  let formPart = (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <label htmlFor="form-selector" className="col-form-label">
          Review Form
        </label>
      </div>
      <div className="col-auto">
        <select
          className="form-select"
          value={reviewFormId}
          onChange={(e) => updateReviewFormId(+e.target.value)}
        >
          {settings.reviewForms.map((form) => (
            <option value={form.id} key={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  let questionPart;
  const reviewForm = settings.reviewForms.find((f) => f.id == reviewFormId);
  if (reviewForm) {
    questionPart =
      reviewForm.questions.length > 0 ? (
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
              {reviewForm.questions.map((question) => (
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
