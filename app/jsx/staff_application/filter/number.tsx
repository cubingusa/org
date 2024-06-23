import { useState } from "react";

import { Competition } from "@wca/helpers";

import {
  NumberFilterParams,
  NumberFilterType,
  numberFilterUsesReference,
} from "./types/number";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { NumberTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

export class NumberFilter extends Filter {
  constructor(
    private params: NumberFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const numberTrait = trait as NumberTrait;
    if (
      numberTrait.value() === null &&
      this.params.numberType !== NumberFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.numberType) {
      case NumberFilterType.Equals:
        return numberTrait.value() === this.params.reference;
      case NumberFilterType.NotEquals:
        return numberTrait.value() !== this.params.reference;
      case NumberFilterType.GreaterThan:
        return numberTrait.value() > this.params.reference;
      case NumberFilterType.LessThan:
        return numberTrait.value() < this.params.reference;
      case NumberFilterType.GreaterThanOrEqual:
        return numberTrait.value() >= this.params.reference;
      case NumberFilterType.LessThanOrEqual:
        return numberTrait.value() <= this.params.reference;
      case NumberFilterType.Even:
        return numberTrait.value() % 2 == 0;
      case NumberFilterType.Odd:
        return numberTrait.value() % 2 == 1;
      case NumberFilterType.IsNull:
        return numberTrait.value() === null;
      case NumberFilterType.NotNull:
        return numberTrait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.numberType) {
      case NumberFilterType.Equals:
        return (
          <>
            {subDescription} == {this.params.reference}
          </>
        );
      case NumberFilterType.NotEquals:
        return (
          <>
            {subDescription} != {this.params.reference}
          </>
        );
      case NumberFilterType.GreaterThan:
        return (
          <>
            {subDescription} &gt; {this.params.reference}
          </>
        );
      case NumberFilterType.LessThan:
        return (
          <>
            {subDescription} &lt; {this.params.reference}
          </>
        );
      case NumberFilterType.GreaterThanOrEqual:
        return (
          <>
            {subDescription} &gt;= {this.params.reference}
          </>
        );
      case NumberFilterType.LessThanOrEqual:
        return (
          <>
            {subDescription} &lt;= {this.params.reference}
          </>
        );
      case NumberFilterType.Even:
        return <>{subDescription} even</>;
      case NumberFilterType.Odd:
        return <>{subDescription} is odd</>;
      case NumberFilterType.IsNull:
        return <>{subDescription} is null</>;
      case NumberFilterType.NotNull:
        return <>{subDescription} is not null</>;
    }
  }

  id(): string {
    if (numberFilterUsesReference(this.params.numberType)) {
      return `NF-${this.idBase()}-${this.params.numberType}-${this.params.reference}`;
    } else {
      return `NF-${this.idBase()}-${this.params.numberType}`;
    }
  }
}
