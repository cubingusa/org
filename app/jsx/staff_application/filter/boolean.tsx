import { useState } from "react";

import { Competition } from "@wca/helpers";

import { BooleanFilterParams, BooleanFilterType } from "./types/boolean";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { BooleanTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

export class BooleanFilter extends Filter {
  constructor(
    private params: BooleanFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const booleanTrait = trait as BooleanTrait;
    if (
      booleanTrait.value() == null &&
      this.params.booleanType !== BooleanFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.booleanType) {
      case BooleanFilterType.IsTrue:
        return booleanTrait.value();
      case BooleanFilterType.IsFalse:
        return !booleanTrait.value();
      case BooleanFilterType.IsNull:
        return booleanTrait.value() === null;
      case BooleanFilterType.NotNull:
        return booleanTrait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.booleanType) {
      case BooleanFilterType.IsTrue:
        return <>{subDescription} is true</>;
      case BooleanFilterType.IsFalse:
        return <>{subDescription} is false</>;
      case BooleanFilterType.IsNull:
        return <>{subDescription} is not set</>;
      case BooleanFilterType.NotNull:
        return <>{subDescription} is set</>;
    }
  }

  id(): string {
    return `BF-${this.idBase()}-${this.params.booleanType}`;
  }
}
