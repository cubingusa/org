import { ApplicantData } from "../types/applicant_data";
import { SerializedTrait } from "./serialized";
import { ComputerParams } from "./params";

export abstract class Trait {
  abstract serialize(): SerializedTrait;
  abstract render(): JSX.Element;
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
}
