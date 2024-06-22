import { Competition } from "@wca/helpers";
import { ComputerParams, ComputerType } from "./params";
import { TraitComputer } from "./api";
import { ApplicationSettings } from "../types/competition_data";

import { FormAnswerComputer } from "./form_answer";
import { FormMetadataComputer } from "./form_metadata";
import { PersonalAttributeComputer } from "./personal_attribute";
import { PropertyComputer } from "./property";

export function createComputer(
  params: ComputerParams,
  settings: ApplicationSettings,
  wcif: Competition,
): TraitComputer {
  switch (params.type) {
    case ComputerType.FormAnswer:
      return new FormAnswerComputer(params, settings);
    case ComputerType.FormMetadata:
      return new FormMetadataComputer(params, settings);
    case ComputerType.PersonalAttribute:
      return new PersonalAttributeComputer(params, settings);
    case ComputerType.Property:
      return new PropertyComputer(params, settings);
  }
}
