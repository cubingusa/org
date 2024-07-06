import { FilterParams } from "../filter/types/params";
import { Question } from "../question/types";
import { SubmittedQuestion } from "../types/personal_application_data";
import { User } from "../types/user";
import { ApplicantData } from "../types/applicant_data";

export interface SubmittedReview {
  user: User;
  reviewFormId: number;
  reviewers: User[];
  submittedBy: number | undefined;
  submittedAtSeconds: number | undefined;
  deadlineSeconds: number | undefined;

  questions: SubmittedQuestion[];
}

export interface DefaultAssignment {
  filters: FilterParams[];
  personIds: number[];
}

export interface ReviewForm {
  id: number;
  name: string;
  description: string;
  eligibleReviewerFilters: FilterParams[];

  questions: Question[];
  nextQuestionId: number;

  defaults: DefaultAssignment[];
}

export interface ReviewsData {
  applicants: ApplicantData[];
}

export interface ReviewAssignment {
  user: User;
  reviewForm: ReviewForm;
  reviewers: User[];
}
