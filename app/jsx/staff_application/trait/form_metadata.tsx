import { DateTime } from "luxon";
import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { FilterParams } from "../filter/types/params";
import { FilterType } from "../filter/types/base";
import {
  BooleanFilterParams,
  defaultBooleanParams,
} from "../filter/types/boolean";
import { BooleanFilterSelector } from "../filter/selector/boolean";
import {
  DateTimeFilterParams,
  defaultDateTimeParams,
} from "../filter/types/date_time";
import { DateTimeFilterSelector } from "../filter/selector/date_time";
import { ApplicantData } from "../types/applicant_data";
import {
  ApplicationSettings,
  CompetitionData,
} from "../types/competition_data";
import { Form } from "../types/form";
import { SubmittedForm } from "../types/personal_application_data";

import { Trait, TraitComputer } from "./api";
import { SerializedTrait } from "./serialized";
import {
  ComputerType,
  FormMetadataParams,
  FormMetadataType,
  ComputerParams,
} from "./params";
import { DateTimeTrait, BooleanTrait } from "./traits";

const metadataTypes = [
  { type: FormMetadataType.Submitted, name: "Submitted" },
  { type: FormMetadataType.SubmitTime, name: "Submit Time" },
  { type: FormMetadataType.UpdateTime, name: "Update Time" },
];
function formMetadataName(type: FormMetadataType) {
  return metadataTypes.find((t) => t.type === type).name;
}

export class FormMetadataComputer extends TraitComputer {
  constructor(
    private params: FormMetadataParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  getForm(): Form | undefined {
    return this.settings.forms.find((f) => f.id == this.params.formId);
  }

  getSubmittedForm(applicant: ApplicantData): SubmittedForm | undefined {
    return applicant.forms.find((f) => f.formId == this.params.formId);
  }

  compute(applicant: ApplicantData): Trait {
    const myForm = this.getSubmittedForm(applicant);
    switch (this.params.metadataType) {
      case FormMetadataType.Submitted:
        return new BooleanTrait({ val: myForm !== undefined });
      case FormMetadataType.SubmitTime:
        return new DateTimeTrait({
          val:
            myForm === undefined
              ? null
              : DateTime.fromSeconds(myForm.submittedAtTs),
        });
      case FormMetadataType.UpdateTime:
        return new DateTimeTrait({
          val:
            myForm === undefined
              ? null
              : DateTime.fromSeconds(myForm.updatedAtTs),
        });
    }
  }

  id(): string {
    return `FMC-${this.params.formId}-${this.params.metadataType}`;
  }

  header(): JSX.Element {
    const form = this.getForm();
    if (form === undefined) {
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

  defaultFilterParams(): FilterParams {
    switch (this.params.metadataType) {
      case FormMetadataType.Submitted:
        return defaultBooleanParams(this.params);
      case FormMetadataType.SubmitTime:
      case FormMetadataType.UpdateTime:
        return defaultDateTimeParams(this.params);
    }
    return {
      type: FilterType.NullFilter,
      trait: this.params,
    };
  }

  isValid(): boolean {
    return this.getForm() !== undefined;
  }

  formElement(
    params: ComputerParams,
    onTraitChange: (params: ComputerParams) => void,
  ): JSX.Element {
    return (
      <FormMetadataSelector
        params={params as FormMetadataParams}
        onTraitChange={onTraitChange}
      />
    );
  }

  filterSelector(
    params: FilterParams | null,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element {
    return (
      <FormMetadataFilterSelector
        params={params}
        computerParams={this.params}
        onFilterChange={onFilterChange}
      />
    );
  }
}

interface FormMetadataFilterSelectorParams {
  params: FilterParams | null;
  computerParams: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
function FormMetadataFilterSelector({
  params,
  computerParams,
  onFilterChange,
}: FormMetadataFilterSelectorParams) {
  const metadataType = (computerParams as FormMetadataParams).metadataType;
  const filterType =
    metadataType == FormMetadataType.Submitted
      ? FilterType.BooleanFilter
      : FilterType.DateTimeFilter;
  switch (filterType) {
    case FilterType.BooleanFilter:
      return (
        <BooleanFilterSelector
          params={params as BooleanFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
    case FilterType.DateTimeFilter:
      return (
        <DateTimeFilterSelector
          params={params as DateTimeFilterParams}
          trait={computerParams}
          onFilterChange={onFilterChange}
        />
      );
  }
  return <></>;
}

interface FormMetadataSelectorParams {
  params: FormMetadataParams;
  onTraitChange: (params: ComputerParams) => void;
}
function FormMetadataSelector({
  params,
  onTraitChange,
}: FormMetadataSelectorParams) {
  const [formId, setFormId] = useState(params.formId);
  const { settings } = useRouteLoaderData("competition") as CompetitionData;
  const [metadataType, setMetadataType] = useState(params.metadataType);

  const updateFormId = function (formId: number) {
    setFormId(formId);
    params.formId = formId;
    onTraitChange(params);
  };

  const updateMetadataType = function (metadataType: FormMetadataType) {
    setMetadataType(metadataType);
    params.metadataType = metadataType;
    onTraitChange(params);
  };

  return settings.forms.length > 0 ? (
    <>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="form-selector" className="col-form-label">
            Form
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={formId}
            onChange={(e) => updateFormId(+e.target.value)}
          >
            {settings.forms.map((form) => (
              <option value={form.id} key={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="form-selector" className="col-form-label">
            Metadata
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={metadataType}
            onChange={(e) =>
              updateMetadataType(e.target.value as FormMetadataType)
            }
          >
            {metadataTypes.map((attr) => (
              <option value={attr.type} key={attr.type}>
                {attr.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  ) : (
    <>This competition does not have any forms.</>
  );
}
