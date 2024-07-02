import { useState } from "react";

import { Person, Competition } from "@wca/helpers";
import { DateTime } from "luxon";

import { ApplicantData } from "../types/applicant_data";
import { Trait, TraitComputer } from "./api";
import { TraitExtras } from "./extras";
import { TraitType } from "./serialized";
import {
  ComputerParams,
  ComputerType,
  PersonalAttributeParams,
  PersonalAttributeType,
} from "./params";
import {
  StringTrait,
  NumberTrait,
  BooleanTrait,
  StringEnumTrait,
  EventListTrait,
} from "./traits";

const personalAttributes = [
  {
    type: PersonalAttributeType.Name,
    name: "Name",
    trait: TraitType.StringTrait,
  },
  {
    type: PersonalAttributeType.WcaId,
    name: "WCA ID",
    trait: TraitType.StringTrait,
  },
  {
    type: PersonalAttributeType.WcaUserId,
    name: "WCA User ID",
    trait: TraitType.NumberTrait,
  },
  {
    type: PersonalAttributeType.Age,
    name: "Age",
    trait: TraitType.NumberTrait,
  },
  {
    type: PersonalAttributeType.DelegateStatus,
    name: "Delegate Status",
    trait: TraitType.StringEnumTrait,
  },
  {
    type: PersonalAttributeType.ListedOrganizer,
    name: "Listed Organizer",
    trait: TraitType.BooleanTrait,
  },
  {
    type: PersonalAttributeType.ListedDelegate,
    name: "Listed Delegate",
    trait: TraitType.BooleanTrait,
  },
  {
    type: PersonalAttributeType.Registered,
    name: "Registered",
    trait: TraitType.BooleanTrait,
  },
  {
    type: PersonalAttributeType.RegisteredEvents,
    name: "Registered Events",
    trait: TraitType.EventListTrait,
  },
];

function personalAttributeName(type: PersonalAttributeType): string {
  return personalAttributes.find((p) => p.type === type)?.name || "";
}

function personalAttributeTraitType(type: PersonalAttributeType): TraitType {
  return (
    personalAttributes.find((p) => p.type === type)?.trait ||
    TraitType.NullTrait
  );
}

const delegateStatuses = [
  { key: "senior_delegate", value: "Senior Delegate" },
  { key: "regional_delegate", value: "Regional Delegate" },
  { key: "delegate", value: "Delegate" },
  { key: "junior_delegate", value: "Junior Delegate" },
  { key: "trainee_delegate", value: "Trainee Delegate" },
];
const delegateStatusMap = new Map<string, string>();
delegateStatuses.forEach(({ key, value }) => delegateStatusMap.set(key, value));

function delegateStatusName(statusId: string) {
  return delegateStatuses.find((s) => s.key == statusId)?.value || "";
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
          return new StringEnumTrait({
            val: applicant.user.delegateStatus,
            extras: {
              allValues: delegateStatusMap,
            },
          });
        } else {
          return new StringEnumTrait({
            val: null,
            extras: {
              allValues: delegateStatusMap,
            },
          });
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
      case PersonalAttributeType.RegisteredEvents:
        return new EventListTrait({
          val:
            this.getPerson(applicant)?.registration?.status === "accepted"
              ? this.getPerson(applicant).registration.eventIds
              : [],
        });
    }
  }

  extraDataForDeserialization(): TraitExtras {
    if (this.params.attributeType == PersonalAttributeType.DelegateStatus) {
      return { allValues: delegateStatusMap };
    }
    return null;
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

  getTraitType(): TraitType {
    return personalAttributeTraitType(this.params.attributeType);
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
