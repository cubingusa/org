import { Competition } from "@wca/wca-helpers";
import { User } from "./user";

export interface ApplicationSettings {
  isVisible: boolean;
  description: string;
}

export interface CompetitionData {
  wcif: Competition;
  user: User | null;
  settings: ApplicationSettings;
}
