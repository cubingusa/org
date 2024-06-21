import { Competition } from "@wca/helpers";
import { User } from "./user";
import { Form } from "./form";
import { Property } from "./property";

export interface ApplicationSettings {
  isVisible: boolean;
  description: string;
  forms: Form[];
  nextFormId: number;
  properties: Property[];
  nextPropertyId: number;
}

export interface CompetitionData {
  wcif: Competition;
  user: User | null;
  settings: ApplicationSettings;
}
