import { DateTime } from "luxon";
import { JSX } from "react";
import {
  Competition,
  Person,
  EventId,
  RankingType,
  PersonalBest,
} from "@wca/helpers";
import { ApplicantData } from "../../types/applicant_data";
import { ApplicationSettings } from "../../types/competition_data";
import { Question, QuestionType } from "../../types/form";
import {
  PersonalAttribute,
  ColumnType,
  ColumnParams,
  FormMetadata,
} from "./api.proto";
import classNames from "classnames";

const CHECK = <span className="material-symbols-outlined">check</span>;
const X = <span className="material-symbols-outlined">close</span>;

export abstract class TableColumn {
  constructor(public params: ColumnParams) {}
  encode(): Uint8Array {
    return ColumnParams.encode(this.params).finish();
  }
  abstract id(): string;
  abstract header(): JSX.Element;
  abstract render(applicant: ApplicantData): JSX.Element;
}

// TODO: Move this to a utils place or @wca/helpers.
function personalBest(
  person: Person,
  eventId: EventId,
  type: RankingType,
): PersonalBest | null {
  return person.personalBests.find(
    (pb) => pb.eventId == eventId && pb.type == type,
  );
}

class PersonalAttributeColumn extends TableColumn {
  constructor(
    params: ColumnParams,
    private wcif: Competition,
  ) {
    super(params);
  }

  id(): string {
    let suffix = "";
    if (
      this.params.attribute == PersonalAttribute.REGISTERED_FOR_EVENT ||
      this.params.attribute == PersonalAttribute.PSYCH_SHEET_POSITION_FOR_EVENT
    ) {
      suffix = `-${this.params.eventId}`;
    }
    return `PA-${this.params.attribute.toString()}${suffix}`;
  }

  header(): JSX.Element {
    switch (this.params.attribute) {
      case PersonalAttribute.AGE:
        return <>Age</>;
      case PersonalAttribute.DELEGATE_STATUS:
        return <>Delegate</>;
      case PersonalAttribute.LISTED_ORGANIZER:
        return <>Listed Organezer</>;
      case PersonalAttribute.LISTED_DELEGATE:
        return <>Listed Delegate</>;
      case PersonalAttribute.REGISTERED:
        return <>Reg</>;
      case PersonalAttribute.REGISTERED_FOR_EVENT:
        return (
          <span
            className={classNames(
              "cubing-icon",
              `event-${this.params.eventId}`,
            )}
          ></span>
        );
      case PersonalAttribute.PSYCH_SHEET_POSITION_FOR_EVENT:
        return (
          <>
            <span
              className={classNames(
                "cubing-icon",
                `event-${this.params.eventId}`,
              )}
            ></span>{" "}
            Pos
          </>
        );
    }
  }

  getPerson(applicant: ApplicantData): Person | null {
    return this.wcif.persons.find((p) => p.wcaUserId == applicant.user.id);
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
      case PersonalAttribute.REGISTERED:
        return this.getPerson(applicant)?.registration?.status == "accepted"
          ? CHECK
          : X;
      case PersonalAttribute.LISTED_ORGANIZER:
        return this.getPerson(applicant)?.roles?.includes("organizer")
          ? CHECK
          : X;
      case PersonalAttribute.LISTED_DELEGATE:
        return this.getPerson(applicant)?.roles?.includes("delegate")
          ? CHECK
          : X;
      case PersonalAttribute.REGISTERED_FOR_EVENT:
        return this.getPerson(applicant)?.registration?.eventIds?.includes(
          this.params.eventId as EventId,
        )
          ? CHECK
          : X;
      case PersonalAttribute.PSYCH_SHEET_POSITION_FOR_EVENT:
        const person = this.getPerson(applicant);
        if (
          !person?.registration?.eventIds?.includes(
            this.params.eventId as EventId,
          )
        ) {
          return X;
        }
        const myPb = personalBest(
          person,
          this.params.eventId as EventId,
          this.params.eventId.includes("bf") ? "single" : "average",
        );
        const betterPeople = this.wcif.persons.filter((p) => {
          const reg = p.registration;
          if (
            reg?.status !== "accepted" ||
            !reg?.eventIds?.includes(this.params.eventId as EventId)
          ) {
            return false;
          }
          const pb = personalBest(
            p,
            this.params.eventId as EventId,
            this.params.eventId.includes("bf") ? "single" : "average",
          );
          return pb.worldRanking < myPb.worldRanking;
        });
        return <>{betterPeople.length + 1}</>;
    }
  }
}

class FormMetadataColumn extends TableColumn {
  constructor(
    params: ColumnParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  id(): string {
    return `FM-${this.params.formId}-${this.params.formMetadata}`;
  }

  header(): JSX.Element {
    const form = this.settings.forms.find((f) => f.id == this.params.formId);
    if (form) {
      switch (this.params.formMetadata) {
        case FormMetadata.SUBMITTED:
          return <>{`${form.name} Submitted`}</>;
        case FormMetadata.SUBMIT_TIME:
          return <>{`${form.name} Submit`}</>;
        case FormMetadata.UPDATE_TIME:
          return <>{`${form.name} Update`}</>;
      }
    }
    return <>??</>;
  }

  render(applicant: ApplicantData): JSX.Element {
    const submittedForm = applicant.forms.find(
      (f) => f.formId == this.params.formId,
    );
    if (!submittedForm) {
      return <>&ndash;</>;
    }
    switch (this.params.formMetadata) {
      case FormMetadata.SUBMITTED:
        return CHECK;
      case FormMetadata.SUBMIT_TIME:
        return (
          <>
            {DateTime.fromSeconds(submittedForm.submittedAtTs).toLocaleString(
              DateTime.DATETIME_MED,
            )}
          </>
        );
      case FormMetadata.UPDATE_TIME:
        return (
          <>
            {DateTime.fromSeconds(submittedForm.updatedAtTs).toLocaleString(
              DateTime.DATETIME_MED,
            )}
          </>
        );
    }
    return <>&ndash;</>;
  }
}

class FormAnswerColumn extends TableColumn {
  constructor(
    params: ColumnParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  id(): string {
    return `FA-${this.params.formId}-${this.params.questionId}`;
  }

  getQuestion(): Question | null {
    const form = this.settings.forms.find((f) => f.id == this.params.formId);
    const question = form?.questions.find(
      (q) => q.id == this.params.questionId,
    );
    return question || null;
    if (!question) {
      return null;
    }
    return question;
  }

  header(): JSX.Element {
    const question = this.getQuestion();
    if (!question) {
      return <>??</>;
    }
    return <>question.name</>;
  }

  render(applicant: ApplicantData): JSX.Element {
    const question = this.getQuestion();
    if (!question) {
      return <>'??'</>;
    }
    const submittedForm = applicant.forms.find(
      (f) => f.formId == this.params.formId,
    );
    const submittedQuestion = submittedForm?.details.questions.find(
      (q) => q.questionId == this.params.questionId,
    );
    if (submittedQuestion) {
      switch (question.questionType) {
        case QuestionType.Text:
          return <>{submittedQuestion.textAnswer}</>;
        case QuestionType.YesNo:
          return submittedQuestion.booleanAnswer ? CHECK : X;
      }
    }
    return <>&ndash</>;
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
      return new FormAnswerColumn(params, settings);
    case ColumnType.FORM_METADATA:
      return new FormMetadataColumn(params, settings);
  }
  return null;
}
