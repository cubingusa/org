import { Competition } from "@wca/helpers";

import { FilterParams } from "./types/params";
import { Trait, TraitComputer } from "../trait/api";
import { createComputer } from "../trait/create_computer";
import { ApplicantData } from "../types/applicant_data";
import { ApplicationSettings } from "../types/competition_data";

export abstract class Filter {
  constructor(
    private baseParams: FilterParams,
    private baseSettings: ApplicationSettings,
    private baseWcif: Competition,
  ) {
    this.computer = createComputer(baseParams.trait, baseSettings, baseWcif);
  }

  apply(applicant: ApplicantData): boolean {
    const trait = this.computer.compute(applicant);
    return this.applyImpl(trait);
  }

  protected abstract applyImpl(val: Trait): boolean;

  abstract description(): JSX.Element;
  abstract id(): string;

  idBase(): string {
    return this.computer.id();
  }
  getParams(): FilterParams {
    return this.baseParams;
  }

  protected computer: TraitComputer;
}
