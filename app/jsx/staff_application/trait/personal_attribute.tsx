import { useState } from "react";

import { Person, Competition } from "@wca/helpers";
import { DateTime } from "luxon";

import { FilterParams } from "../filter/types/params";
import { FilterType } from "../filter/types/base";
import {
  BooleanFilterParams,
  BooleanFilterType,
} from "../filter/types/boolean";
import { StringFilterParams, StringFilterType } from "../filter/types/string";
import { NumberFilterParams, NumberFilterType } from "../filter/types/number";
import { BooleanFilterSelector } from "../filter/selector/boolean";
import { NumberFilterSelector } from "../filter/selector/number";
import { StringFilterSelector } from "../filter/selector/string";

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
  {
    type: PersonalAttributeType.Name,
    name: "Name",
    filter: FilterType.StringFilter,
  },
  {
    type: PersonalAttributeType.WcaId,
    name: "WCA ID",
    filter: FilterType.StringFilter,
  },
  {
    type: PersonalAttributeType.WcaUserId,
    name: "WCA User ID",
    filter: FilterType.NumberFilter,
  },
  {
    type: PersonalAttributeType.Age,
    name: "Age",
    filter: FilterType.NumberFilter,
  },
  {
    type: PersonalAttributeType.DelegateStatus,
    name: "Is Delegate",
    filter: FilterType.BooleanFilter,
  },
  {
    type: PersonalAttributeType.ListedOrganizer,
    name: "Listed Organizer",
    filter: FilterType.BooleanFilter,
  },
  {
    type: PersonalAttributeType.ListedDelegate,
    name: "Listed Delegate",
    filter: FilterType.BooleanFilter,
  },
  {
    type: PersonalAttributeType.Registered,
    name: "Registered",
    filter: FilterType.BooleanFilter,
  },
];

function personalAttributeName(type: PersonalAttributeType): string {
  return personalAttributes.find((p) => p.type === type).name;
}

function personalAttributeFilterType(type: PersonalAttributeType): FilterType {
  return personalAttributes.find((p) => p.type === type).filter;
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

  defaultFilterParams(): FilterParams {
    switch (personalAttributeFilterType(this.params.attributeType)) {
      case FilterType.StringFilter:
        return {
          trait: this.params,
          type: FilterType.StringFilter,
          stringType: StringFilterType.Equals,
          reference: "",
        };
      case FilterType.NumberFilter:
        return {
          trait: this.params,
          type: FilterType.NumberFilter,
          numberType: NumberFilterType.Equals,
          reference: 0,
        };
      case FilterType.BooleanFilter:
        return {
          trait: this.params,
          type: FilterType.BooleanFilter,
          booleanType: BooleanFilterType.IsTrue,
        };
    }
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

  filterSelector(
    params: FilterParams | null,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element {
    return (
      <PersonalAttributeFilterSelector
        params={params}
        computerParams={this.params}
        onFilterChange={onFilterChange}
      />
    );
  }
}

interface PersonalAttributeFilterSelectorParams {
  params: FilterParams | null;
  computerParams: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
function PersonalAttributeFilterSelector({
  params,
  computerParams,
  onFilterChange,
}: PersonalAttributeFilterSelectorParams) {
  const attributeType = (computerParams as PersonalAttributeParams)
    .attributeType;
  const filterType = personalAttributeFilterType(attributeType);
  switch (filterType) {
    case FilterType.NumberFilter:
      return (
        <NumberFilterSelector
          params={params as NumberFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
    case FilterType.StringFilter:
      return (
        <StringFilterSelector
          params={params as StringFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
    case FilterType.BooleanFilter:
      <BooleanFilterSelector
        params={params as BooleanFilterParams}
        trait={computerParams}
        onFilterChange={onFilterChange}
      />;
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
