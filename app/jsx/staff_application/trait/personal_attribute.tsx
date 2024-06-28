import { useState } from "react";

import { Person, Competition } from "@wca/helpers";
import { DateTime } from "luxon";

import { FilterParams } from "../filter/types/params";
import { FilterType } from "../filter/types/base";
import {
  BooleanFilterParams,
  BooleanFilterType,
} from "../filter/types/boolean";
import { StringEnumFilterParams } from "../filter/types/enum";
import { StringFilterParams, StringFilterType } from "../filter/types/string";
import { NumberFilterParams, NumberFilterType } from "../filter/types/number";
import { BooleanFilterSelector } from "../filter/selector/boolean";
import { StringEnumFilterSelector } from "../filter/selector/enum";
import { NumberFilterSelector } from "../filter/selector/number";
import { StringFilterSelector } from "../filter/selector/string";

import { ApplicantData } from "../types/applicant_data";
import { Trait, TraitComputer } from "./api";
import { TraitExtras } from "./extras";
import { SerializedTrait } from "./serialized";
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
} from "./traits";

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
    name: "Delegate Status",
    filter: FilterType.StringEnumFilter,
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
      case FilterType.StringEnumFilter:
        if (this.params.attributeType == PersonalAttributeType.DelegateStatus) {
          return {
            trait: this.params,
            type: FilterType.StringEnumFilter,
            allowedValues: [],
            allValuesForDebugging: delegateStatuses,
          };
        }
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
      return (
        <BooleanFilterSelector
          params={params as BooleanFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
    case FilterType.StringEnumFilter:
      if (
        (computerParams as PersonalAttributeParams).attributeType ==
        PersonalAttributeType.DelegateStatus
      ) {
        return (
          <StringEnumFilterSelector
            params={params as StringEnumFilterParams}
            trait={computerParams}
            onFilterChange={onFilterChange}
            values={delegateStatusMap}
          />
        );
      }
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
