import { Competition } from "@wca/helpers";

import { FilterParams } from "./params";
import { Trait, TraitComputer } from "../trait/api";
import { createComputer } from "../trait/create_computer";
import { ApplicantData } from "../types/applicant_data";
import { ApplicationSettings } from "../types/competition_data";

export abstract class Filter<T extends Trait> {
  constructor(
    private baseParams: FilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    this.computer = createComputer(baseParams.trait, settings, wcif);
  }

  apply(applicant: ApplicantData): boolean {
    const trait = this.computer.compute(applicant) as T;
    return this.applyImpl(trait);
  }

  protected abstract applyImpl(val: T): boolean;

  abstract description(): JSX.Element;
  abstract id(): string;

  protected computer: TraitComputer;
}
