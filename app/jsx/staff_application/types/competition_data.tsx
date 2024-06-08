import { Competition } from "@wca/wca-helpers";
import { User } from "./user";

export interface CompetitionData {
  wcif: Competition;
  user: User | null;
}
