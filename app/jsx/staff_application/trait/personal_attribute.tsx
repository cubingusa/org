import { Person, Competition } from "@wca/helpers";
import { DateTime } from "luxon";

import { ApplicantData } from "../types/applicant_data";
import { Trait, TraitComputer } from "./api";
import { SerializedTrait } from "./serialized";
import { PersonalAttributeParams, PersonalAttributeType } from "./params";
import { StringTrait, NumberTrait, BooleanTrait, NullTrait } from "./traits";

function personalAttributeName(type: PersonalAttributeType) {
  switch (type) {
    case PersonalAttributeType.Name:
      return "Name";
    case PersonalAttributeType.WcaId:
      return "WCA ID";
    case PersonalAttributeType.WcaUserId:
      return "WCA User ID";
    case PersonalAttributeType.Age:
      return "Age";
    case PersonalAttributeType.DelegateStatus:
      return "Is Delegate";
    case PersonalAttributeType.ListedOrganizer:
      return "Listed Organizer";
    case PersonalAttributeType.ListedDelegate:
      return "Listed Delegate";
    case PersonalAttributeType.Registered:
      return "Registered";
  }
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

class PersonalAttributeComputer extends TraitComputer {
  constructor(
    private params: PersonalAttributeParams,
    private wcif: Competition,
  ) {
    super(params);
  }

  getPerson(applicant: ApplicantData): Person | null {
    return this.wcif.persons.find((p) => p.wcaUserId == applicant.user.id);
  }

  compute(applicant: ApplicantData): Trait {
    switch (this.params.attributeType) {
      case PersonalAttributeType.Name:
        return new StringTrait({ val: applicant.user.name });
      case PersonalAttributeType.WcaId:
        if (applicant.user.wcaId) {
          return new StringTrait({ val: applicant.user.wcaId });
        } else {
          return new NullTrait({});
        }
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
          return new NullTrait({});
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
    return <>${personalAttributeName(this.params.attributeType)}</>;
  }
}
