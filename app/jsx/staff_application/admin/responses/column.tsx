import { DateTime } from "luxon";
import { JSX } from "react";
import { Competition } from "@wca/helpers";
import { ApplicantData } from "../../types/applicant_data";
import { ApplicationSettings } from "../../types/competition_data";
import { PersonalAttribute, ColumnType, ColumnParams } from "./api.proto";

export abstract class TableColumn {
  constructor(public params: ColumnParams) {}
  encode(): Uint8Array {
    return ColumnParams.encode(this.params).finish();
  }
  abstract id(): string;
  abstract name(): string;
  abstract render(applicant: ApplicantData): JSX.Element;
}

class PersonalAttributeColumn extends TableColumn {
  constructor(
    params: ColumnParams,
    private wcif: Competition,
  ) {
    super(params);
  }

  id(): string {
    return `PA-${this.params.attribute.toString()}`;
  }

  name(): string {
    switch (this.params.attribute) {
      case PersonalAttribute.AGE:
        return "Age";
      case PersonalAttribute.DELEGATE_STATUS:
        return "Delegate Status";
    }
  }

  render(applicant: ApplicantData): JSX.Element {
    switch (this.params.attribute) {
      case PersonalAttribute.AGE:
        const dob = DateTime.fromISO(applicant.user.birthdate);
        const competitionStart = DateTime.fromISO(this.wcif.schedule.startDate);
        return <>{Math.floor(competitionStart.diff(dob, "years").years)}</>;
      case PersonalAttribute.DELEGATE_STATUS:
        switch (applicant.user.delegateStatus) {
          case "senior_delegate":
            return <>Senior Delegate</>;
          case "regional_delegate":
            return <>Regional Delegate</>;
          case "delegate":
            return <>Delegate</>;
          case "junior_delegate":
            return <>Junior Delegate</>;
          case "trainee_delegate":
            return <>Trainee Delegate</>;
        }
        return null;
    }
  }
}

class FormAnswerColumn extends TableColumn {
  id(): string {
    return `FA-${this.params.formId}-${this.params.questionId}`;
  }

  name(): string {
    // TODO: Pass in form data.
    return `${this.params.formId}-${this.params.questionId}`;
  }

  render(): JSX.Element {
    return null;
  }
}

export function decodeColumn(
  params: ColumnParams,
  settings: ApplicationSettings,
  wcif: Competition,
): TableColumn | null {
  switch (params.columnType) {
    case ColumnType.PERSONAL_ATTRIBUTE:
      return new PersonalAttributeColumn(params, wcif);
    case ColumnType.FORM_ANSWER:
      return new FormAnswerColumn(params);
  }
  return null;
}
