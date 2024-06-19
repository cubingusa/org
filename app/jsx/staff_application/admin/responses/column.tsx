import { DateTime } from "luxon";
import { JSX } from "react";
import { Competition } from "@wca/helpers";
import { ApplicantData } from "../../types/applicant_data";
import { ApplicationSettings } from "../../types/competition_data";
import { Question, QuestionType } from "../../types/form";
import {
  PersonalAttribute,
  ColumnType,
  ColumnParams,
  FormMetadata,
} from "./api.proto";

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

  name(): string {
    const form = this.settings.forms.find((f) => f.id == this.params.formId);
    if (form) {
      switch (this.params.formMetadata) {
        case FormMetadata.SUBMITTED:
          return `${form.name} Submitted`;
        case FormMetadata.SUBMIT_TIME:
          return `${form.name} Submit Time`;
        case FormMetadata.UPDATE_TIME:
          return `${form.name} Update Time`;
      }
    }
    return "??";
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
        return <span className="material-symbols-outlined">check</span>;
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

  name(): string {
    const question = this.getQuestion();
    if (!question) {
      return "??";
    }
    return question.name;
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
          return submittedQuestion.booleanAnswer ? (
            <span className="material-symbols-outlined">check</span>
          ) : (
            <span className="material-symbols-outlined">close</span>
          );
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
