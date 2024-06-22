import { ApplicantData } from "../types/applicant_data";
import { SerializedTrait } from "../types/serialized_trait";
import { ComputerParams } from "./params";

export abstract class Trait {
  abstract serialize(): SerializedTrait;
  abstract render(): JSX.Element;
}

export abstract class TraitComputer {
  constructor(private params: ComputerParams) {}
  abstract compute(applicant: ApplicantData): Trait;
  abstract deserialize(serialized: SerializedTrait): Trait;
  abstract id(): string;
  abstract header(): JSX.Element;
}
