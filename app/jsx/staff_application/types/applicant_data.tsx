import { User } from "./user";
import { SubmittedForm } from "./personal_application_data";
import { SubmittedReview } from "../reviews/types";

export interface ApplicantData {
  user: User;
  forms: SubmittedForm[];
  reviews: SubmittedReview[];
}
