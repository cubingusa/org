import { Competition } from "@wca/helpers";
import { ApplicantData } from "../types/applicant_data";
import { SerializedTrait, TraitType } from "./serialized";
import { ComputerParams } from "./params";
import { FilterParams } from "../filter/types/params";
import { TraitExtras } from "./extras";
import { Question } from "../question/types";
import { SubmittedQuestion } from "../types/personal_application_data";

export abstract class Trait {
  abstract serialize(): SerializedTrait;
  abstract render(): JSX.Element;
  abstract value(): any;
}

export abstract class TraitComputer {
  constructor(private baseParams: ComputerParams) {}
  abstract compute(applicant: ApplicantData): Trait;
  abstract id(): string;
  abstract header(): JSX.Element;
  abstract formElement(
    params: ComputerParams,
    onTraitChange: (params: ComputerParams) => void,
  ): JSX.Element;
  abstract isValid(): boolean;
  abstract getTraitType(): TraitType;
  extraDataForDeserialization(): TraitExtras {
    return null;
  }
  getParams(): ComputerParams {
    return this.baseParams;
  }
}

export abstract class TraitTypeApi {
  constructor(protected wcif: Competition) {}
  abstract type(): TraitType;
  abstract deserialize(
    serialized: SerializedTrait,
    computer: TraitComputer,
  ): Trait;
  abstract defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams;
  abstract filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element;
}
