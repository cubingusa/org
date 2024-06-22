import { DateTime } from "luxon";

import { ApplicantData } from "../types/applicant_data";
import { ApplicationSettings } from "../types/competition_data";
import { Form } from "../types/form";
import { SubmittedForm } from "../types/personal_application_data";

import { Trait, TraitComputer } from "./api";
import { SerializedTrait } from "./serialized";
import { ComputerType, FormMetadataParams, FormMetadataType } from "./params";
import { DateTimeTrait, BooleanTrait, NullTrait } from "./traits";

function formMetadataName(type: FormMetadataType) {
  switch (type) {
    case FormMetadataType.Submitted:
      return "Submitted";
    case FormMetadataType.SubmitTime:
      return "Submit Time";
    case FormMetadataType.UpdateTime:
      return "Update Time";
  }
}

export class FormMetadataComputer extends TraitComputer {
  constructor(
    private params: FormMetadataParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  getForm(): Form | null {
    return this.settings.forms.find((f) => f.id == this.params.formId);
  }

  getSubmittedForm(applicant: ApplicantData): SubmittedForm | null {
    return applicant.forms.find((f) => f.formId == this.params.formId);
  }

  compute(applicant: ApplicantData): Trait {
    const myForm = this.getSubmittedForm(applicant);
    switch (this.params.metadataType) {
      case FormMetadataType.Submitted:
        return new BooleanTrait({ val: myForm !== null });
      case FormMetadataType.SubmitTime:
        if (myForm === null) {
          return new NullTrait({});
        } else {
          return new DateTimeTrait({
            val: DateTime.fromSeconds(myForm.submittedAtTs),
          });
        }
      case FormMetadataType.UpdateTime:
        if (myForm === null) {
          return new NullTrait({});
        } else {
          return new DateTimeTrait({
            val: DateTime.fromSeconds(myForm.updatedAtTs),
          });
        }
    }
  }

  id(): string {
    return `FMC-${this.params.formId}-${this.params.metadataType}`;
  }

  header(): JSX.Element {
    const form = this.getForm();
    if (form === null) {
      return <>??</>;
    }
    return (
      <>
        {form.name} {formMetadataName(this.params.metadataType)}
      </>
    );
  }

  static defaultParams(settings: ApplicationSettings): FormMetadataParams {
    return {
      type: ComputerType.FormMetadata,
      formId: settings.forms.length > 0 ? settings.forms[0].id : -1,
      metadataType: FormMetadataType.Submitted,
    };
  }
}
