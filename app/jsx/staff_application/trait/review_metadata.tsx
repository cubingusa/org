import { DateTime } from "luxon";
import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { ApplicantData } from "../types/applicant_data";
import {
  ApplicationSettings,
  CompetitionData,
} from "../types/competition_data";
import { ReviewForm, SubmittedReview, ReviewsData } from "../reviews/types";

import { Trait, TraitComputer } from "./api";
import { TraitType } from "./serialized";
import {
  ComputerParams,
  ComputerType,
  ReviewMetadataParams,
  ReviewMetadataType,
} from "./params";
import { BooleanTrait } from "./types/boolean";
import { StringTrait } from "./types/string";

const metadataTypes = [
  {
    type: ReviewMetadataType.Submitted,
    name: "Submitted",
    traitType: TraitType.BooleanTrait,
  },
  {
    type: ReviewMetadataType.Reviewers,
    name: "Reviewers",
    traitType: TraitType.StringTrait, // TODO: switch to StringListTrait
  },
];
function reviewMetadataName(type: ReviewMetadataType): string {
  return metadataTypes.find((t) => t.type === type)?.name || "";
}
function traitType(type: ReviewMetadataType): TraitType {
  return (
    metadataTypes.find((t) => t.type === type)?.traitType || TraitType.NullTrait
  );
}

export class ReviewMetadataComputer extends TraitComputer {
  constructor(
    private params: ReviewMetadataParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  getReviewForm(): ReviewForm | undefined {
    return this.settings.reviewForms.find(
      (f) => f.id == this.params.reviewFormId,
    );
  }

  getSubmittedReview(applicant: ApplicantData): SubmittedReview | undefined {
    return applicant.reviews.find(
      (f) => f.reviewFormId == this.params.reviewFormId,
    );
  }

  compute(applicant: ApplicantData): Trait {
    const myReview = this.getSubmittedReview(applicant);
    switch (this.params.metadataType) {
      case ReviewMetadataType.Submitted:
        return new BooleanTrait({ val: myReview !== undefined });
      case ReviewMetadataType.Reviewers:
        return new StringTrait({
          val: myReview.reviewers.map((r) => r.name).join(", "),
        });
    }
  }

  id(): string {
    return `RMC-${this.params.reviewFormId}-${this.params.metadataType}`;
  }

  header(): JSX.Element {
    const reviewForm = this.getReviewForm();
    if (reviewForm === undefined) {
      return <>??</>;
    }
    return (
      <>
        {reviewForm.name} {reviewMetadataName(this.params.metadataType)}
      </>
    );
  }

  static defaultParams(settings: ApplicationSettings): ReviewMetadataParams {
    return {
      type: ComputerType.ReviewMetadata,
      reviewFormId:
        settings.reviewForms.length > 0 ? settings.reviewForms[0].id : -1,
      metadataType: ReviewMetadataType.Submitted,
    };
  }

  getTraitType(): TraitType {
    return traitType(this.params.metadataType);
  }

  isValid(): boolean {
    return this.getReviewForm() !== undefined;
  }

  formElement(
    params: ComputerParams,
    onTraitChange: (params: ComputerParams) => void,
  ): JSX.Element {
    return (
      <ReviewMetadataSelector
        params={params as ReviewMetadataParams}
        onTraitChange={onTraitChange}
      />
    );
  }
}

interface ReviewMetadataSelectorParams {
  params: ReviewMetadataParams;
  onTraitChange: (params: ComputerParams) => void;
}
function ReviewMetadataSelector({
  params,
  onTraitChange,
}: ReviewMetadataSelectorParams) {
  const [reviewFormId, setReviewFormId] = useState(params.reviewFormId);
  const { settings } = useRouteLoaderData("competition") as CompetitionData;
  const [metadataType, setMetadataType] = useState(params.metadataType);

  const updateFormId = function (formId: number) {
    setReviewFormId(formId);
    params.reviewFormId = formId;
    onTraitChange(params);
  };

  const updateMetadataType = function (metadataType: ReviewMetadataType) {
    setMetadataType(metadataType);
    params.metadataType = metadataType;
    onTraitChange(params);
  };

  return settings.reviewForms.length > 0 ? (
    <>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="form-selector" className="col-form-label">
            Form
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={reviewFormId}
            onChange={(e) => updateFormId(+e.target.value)}
          >
            {settings.reviewForms.map((form) => (
              <option value={form.id} key={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="form-selector" className="col-form-label">
            Metadata
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={metadataType}
            onChange={(e) =>
              updateMetadataType(e.target.value as ReviewMetadataType)
            }
          >
            {metadataTypes.map((attr) => (
              <option value={attr.type} key={attr.type}>
                {attr.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  ) : (
    <>This competition does not have any review forms.</>
  );
}
