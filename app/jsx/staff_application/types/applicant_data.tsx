import { User } from "./user";
import { SubmittedForm } from "./personal_application_data";

export interface ApplicantData {
  user: User;
  forms: SubmittedForm[];
}
