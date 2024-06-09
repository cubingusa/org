import { Competition } from "@wca/wca-helpers";
import { User } from "./user";
import { Form } from "./form";

export interface ApplicationSettings {
  isVisible: boolean;
  description: string;
  forms: Form[];
  nextFormId: number;
}

export interface CompetitionData {
  wcif: Competition;
  user: User | null;
  settings: ApplicationSettings;
}
