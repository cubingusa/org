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
  const paramsClone = JSON.parse(JSON.stringify(params));
  switch (paramsClone.type) {
    case ComputerType.FormAnswer:
      return new FormAnswerComputer(paramsClone, settings);
    case ComputerType.FormMetadata:
      return new FormMetadataComputer(paramsClone, settings);
    case ComputerType.PersonalAttribute:
      return new PersonalAttributeComputer(paramsClone, wcif);
    case ComputerType.Property:
      return new PropertyComputer(paramsClone, settings);
  }
}