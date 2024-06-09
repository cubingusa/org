import { DateTime } from "luxon";

export interface Form {
  // Unique within a competition.
  id: number;

  name: string;
  description: string;
  isOpen: boolean;
  deadline: DateTime | null;
}
