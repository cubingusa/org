import { Competition } from "@wca/helpers";

import { NumberFilterParams, NumberFilterType } from "./params";
import { Filter } from "./filter";
import { NumberTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

function usesReference(type: NumberFilterType) {
  return [
    NumberFilterType.Equals,
    NumberFilterType.NotEquals,
    NumberFilterType.GreaterThan,
    NumberFilterType.LessThan,
    NumberFilterType.GreaterThanOrEqual,
    NumberFilterType.LessThanOrEqual,
  ].includes(type);
}

export class NumberFilter extends Filter<NumberTrait> {
  constructor(
    private params: NumberFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: NumberTrait): boolean {
    switch (this.params.numberType) {
      case NumberFilterType.Equals:
        return trait.value() === this.params.reference;
      case NumberFilterType.NotEquals:
        return trait.value() !== this.params.reference;
      case NumberFilterType.GreaterThan:
        return trait.value() > this.params.reference;
      case NumberFilterType.LessThan:
        return trait.value() < this.params.reference;
      case NumberFilterType.GreaterThanOrEqual:
        return trait.value() >= this.params.reference;
      case NumberFilterType.LessThanOrEqual:
        return trait.value() <= this.params.reference;
      case NumberFilterType.Even:
        return trait.value() % 2 == 0;
      case NumberFilterType.Odd:
        return trait.value() % 2 == 1;
      case NumberFilterType.IsNull:
        return trait.value() === null;
      case NumberFilterType.NotNull:
        return trait.value() !== null;
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
    if (usesReference(this.params.numberType)) {
      return `NF-${this.params.numberType}-${this.params.reference}`;
    } else {
      return `NF-${this.params.numberType}`;
    }
  }
}
