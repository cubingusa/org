import { useState } from "react";

import { Person, Competition } from "@wca/helpers";
import { DateTime } from "luxon";

import { ApplicantData } from "../types/applicant_data";
import { Trait, TraitComputer } from "./api";
import { SerializedTrait } from "./serialized";
import {
  ComputerParams,
  ComputerType,
  PersonalAttributeParams,
  PersonalAttributeType,
} from "./params";
import { StringTrait, NumberTrait, BooleanTrait } from "./traits";

const personalAttributes = [
  { type: PersonalAttributeType.Name, name: "Name" },
  { type: PersonalAttributeType.WcaId, name: "WCA ID" },
  { type: PersonalAttributeType.WcaUserId, name: "WCA User ID" },
  { type: PersonalAttributeType.Age, name: "Age" },
  { type: PersonalAttributeType.DelegateStatus, name: "Is Delegate" },
  { type: PersonalAttributeType.ListedOrganizer, name: "Listed Organizer" },
  { type: PersonalAttributeType.ListedDelegate, name: "Listed Delegate" },
  { type: PersonalAttributeType.Registered, name: "Registered" },
];

function personalAttributeName(type: PersonalAttributeType) {
  return personalAttributes.find((p) => p.type === type).name;
}

function delegateStatusName(statusId: string) {
  switch (statusId) {
    case "senior_delegate":
      return "Senior Delegate";
    case "regional_delegate":
      return "Regional Delegate";
    case "delegate":
      return "Delegate";
    case "junior_delegate":
      return "Junior Delegate";
    case "trainee_delegate":
      return "Trainee Delegate";
  }
  return "";
}

export class PersonalAttributeComputer extends TraitComputer {
  constructor(
    private params: PersonalAttributeParams,
    private wcif: Competition,
  ) {
    super(params);
  }

  getPerson(applicant: ApplicantData): Person | undefined {
    return this.wcif.persons.find((p) => p.wcaUserId == applicant.user.id);
  }

  compute(applicant: ApplicantData): Trait {
    switch (this.params.attributeType) {
      case PersonalAttributeType.Name:
        return new StringTrait({ val: applicant.user.name });
      case PersonalAttributeType.WcaId:
        return new StringTrait({ val: applicant.user.wcaId || null });
      case PersonalAttributeType.WcaUserId:
        return new NumberTrait({ val: applicant.user.id });
      case PersonalAttributeType.Age:
        const dob = DateTime.fromISO(applicant.user.birthdate);
        const competitionStart = DateTime.fromISO(this.wcif.schedule.startDate);
        return new NumberTrait({
          val: Math.floor(competitionStart.diff(dob, "years").years),
        });
      case PersonalAttributeType.DelegateStatus:
        if (applicant.user.delegateStatus) {
          // TODO: switch to EnumTrait.
          return new StringTrait({
            val: delegateStatusName(applicant.user.delegateStatus),
          });
        } else {
          return new StringTrait({ val: null });
        }
      case PersonalAttributeType.ListedOrganizer:
        return new BooleanTrait({
          val: this.getPerson(applicant)?.roles?.includes("organizer"),
        });
      case PersonalAttributeType.ListedDelegate:
        return new BooleanTrait({
          val: this.getPerson(applicant)?.roles?.includes("delegate"),
        });
      case PersonalAttributeType.Registered:
        return new BooleanTrait({
          val: this.getPerson(applicant)?.registration?.status === "accepted",
        });
    }
  }

  id(): string {
    // TODO: Also include additional parameters if set.
    return `PAC-${this.params.attributeType}`;
  }

  header(): JSX.Element {
    return <>{personalAttributeName(this.params.attributeType)}</>;
  }

  static defaultParams(): PersonalAttributeParams {
    return {
      type: ComputerType.PersonalAttribute,
      attributeType: PersonalAttributeType.Name,
    };
  }

  isValid(): boolean {
    return true;
  }

  formElement(
    params: ComputerParams,
    onTraitChange: (params: ComputerParams) => void,
  ): JSX.Element {
    return (
      <PersonalAttributeSelector
        params={params as PersonalAttributeParams}
        onTraitChange={onTraitChange}
      />
    );
  }
}

interface PersonalAttributeSelectorParams {
  params: PersonalAttributeParams;
  onTraitChange: (params: ComputerParams) => void;
}
function PersonalAttributeSelector({
  params,
  onTraitChange,
}: PersonalAttributeSelectorParams) {
  const [attributeType, setAttributeType] = useState(params.attributeType);

  const updateAttributeType = function (type: PersonalAttributeType) {
    setAttributeType(type);
    params.attributeType = type;
    onTraitChange(params);
  };

  return (
    <select
      className="form-select"
      value={attributeType}
      onChange={(e) =>
        updateAttributeType(e.target.value as PersonalAttributeType)
      }
    >
      {personalAttributes.map((attr) => (
        <option value={attr.type} key={attr.type}>
          {attr.name}
        </option>
      ))}
    </select>
  );
}
