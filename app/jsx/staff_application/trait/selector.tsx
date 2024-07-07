import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { TraitComputer } from "./api";
import { CompetitionData } from "../types/competition_data";
import {
  ComputerParams,
  ComputerType,
  FormAnswerParams,
  FormMetadataParams,
  PersonalAttributeParams,
  PropertyParams,
} from "./params";
import { createComputer } from "./create_computer";
import { FormAnswerComputer } from "./form_answer";
import { FormMetadataComputer } from "./form_metadata";
import { PersonalAttributeComputer } from "./personal_attribute";
import { PropertyComputer } from "./property";
import { ReviewMetadataComputer } from "./review_metadata";

interface TraitSelectorParams {
  params: ComputerParams;
  onChange: (newParams: ComputerParams, newComputer: TraitComputer) => void;
  setValid: (isValid: boolean) => void;
  idBase: string;
}
export function TraitSelector({
  params,
  onChange,
  setValid,
  idBase,
}: TraitSelectorParams) {
  const [activeParams, setActiveParams] = useState(params);
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [activeComputer, setActiveComputer] = useState(
    createComputer(params, settings, wcif),
  );

  const children = [
    {
      type: ComputerType.PersonalAttribute,
      name: "Personal Attribute",
      defaultParams: PersonalAttributeComputer.defaultParams(),
    },
    {
      type: ComputerType.FormAnswer,
      name: "Form Answer",
      defaultParams: FormAnswerComputer.defaultParams(settings),
    },
    {
      type: ComputerType.FormMetadata,
      name: "Form Metadata",
      defaultParams: FormMetadataComputer.defaultParams(settings),
    },
    {
      type: ComputerType.Property,
      name: "Property",
      defaultParams: PropertyComputer.defaultParams(settings),
    },
    {
      type: ComputerType.ReviewMetadata,
      name: "Review Metadata",
      defaultParams: ReviewMetadataComputer.defaultParams(settings),
    },
  ];

  const activeChild = children.find((c) => c.type === params.type);

  const onTraitTypeChange = function (
    newType: ComputerType,
    defaultParams: ComputerParams,
  ) {
    setActiveParams(defaultParams);
    const computer = createComputer(defaultParams, settings, wcif);
    setActiveComputer(computer);
    if (computer.isValid()) {
      onChange(defaultParams, computer);
      setValid(true);
    } else {
      setValid(false);
    }
  };

  const onTraitChange = function (params: ComputerParams) {
    setActiveParams(params);
    const computer = createComputer(params, settings, wcif);
    setActiveComputer(computer);
    if (computer.isValid()) {
      onChange(params, computer);
      setValid(true);
    } else {
      setValid(false);
    }
  };

  return (
    <>
      {children.map(({ type, name, defaultParams }) => (
        <div className="form-check" key={type}>
          <input
            className="form-check-input"
            name="column-type"
            type="radio"
            id={`${idBase}-radio-${type}`}
            value={type}
            defaultChecked={activeParams.type == type}
            onChange={(evt) => onTraitTypeChange(type, defaultParams)}
          />
          <label
            className="form-check-label"
            htmlFor={`${idBase}-radio-${type}`}
          >
            {name}
          </label>
        </div>
      ))}
      {activeComputer.formElement(params, onTraitChange)}
    </>
  );
}
