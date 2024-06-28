import { FilterParams } from "../filter/types/params";
import { Question } from "../question/types";

export interface Form {
  // Unique within a competition.
  id: number;

  name: string;
  description: string;
  isOpen: boolean;
  deadlineSeconds: number;
  nextQuestionId: number;

  questions: Question[];
  filters: FilterParams[];
}
