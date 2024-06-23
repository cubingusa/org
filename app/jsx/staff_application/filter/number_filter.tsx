import { Competition } from "@wca/helpers";

import { NumberFilterParams, NumberFilterType } from "./params";
import { Filter } from "./filter";
import { NumberTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

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
      case NumberFilterType.OneOf:
        return this.params.referenceList.includes(trait.value());
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
}
