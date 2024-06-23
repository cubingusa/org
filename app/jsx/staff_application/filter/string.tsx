import { Competition } from "@wca/helpers";

import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import {
  StringFilterParams,
  StringFilterType,
  stringFilterUsesReference,
  stringTypes,
} from "./types/string";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { StringTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

export class StringFilter extends Filter {
  constructor(
    private params: StringFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const stringTrait = trait as StringTrait;
    if (
      stringTrait.value() == null &&
      this.params.stringType !== StringFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.stringType) {
      case StringFilterType.Equals:
        return stringTrait.value() === this.params.reference;
      case StringFilterType.NotEquals:
        return stringTrait.value() !== this.params.reference;
      case StringFilterType.Contains:
        return stringTrait.value().includes(this.params.reference);
      case StringFilterType.NotContains:
        return !stringTrait.value().includes(this.params.reference);
      case StringFilterType.IsEmpty:
        return stringTrait.value() === "";
      case StringFilterType.NotEmpty:
        return stringTrait.value() !== "";
      case StringFilterType.IsNull:
        return stringTrait.value() === null;
      case StringFilterType.NotNull:
        return stringTrait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.stringType) {
      case StringFilterType.Equals:
        return (
          <>
            {subDescription} == {this.params.reference}
          </>
        );
      case StringFilterType.NotEquals:
        return (
          <>
            {subDescription} != {this.params.reference}
          </>
        );
      case StringFilterType.Contains:
        return (
          <>
            {subDescription} contains {this.params.reference}
          </>
        );
      case StringFilterType.NotContains:
        return (
          <>
            {subDescription} does not contain {this.params.reference}
          </>
        );
      case StringFilterType.IsEmpty:
        return <>{subDescription} is empty</>;
      case StringFilterType.NotEmpty:
        return <>{subDescription} is not empty</>;
      case StringFilterType.IsNull:
        return <>{subDescription} is not set</>;
      case StringFilterType.NotNull:
        return <>{subDescription} is set</>;
    }
  }

  id(): string {
    if (stringFilterUsesReference(this.params.stringType)) {
      return `SF-${this.params.stringType}-${this.params.reference}`;
    } else {
      return `SF-${this.params.stringType}`;
    }
  }

  static defaultParams(trait: ComputerParams): StringFilterParams {
    return {
      trait,
      type: FilterType.StringFilter,
      stringType: StringFilterType.Equals,
      reference: "",
    };
  }
}
