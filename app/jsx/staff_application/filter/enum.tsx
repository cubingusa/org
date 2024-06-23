import { useState } from "react";

import { Competition } from "@wca/helpers";

import { EnumFilterParams } from "./types/enum";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { EnumTrait } from "../trait/traits";
import { ApplicationSettings } from "../types/competition_data";

class EnumFilterBase<T> extends Filter {
  constructor(
    private params: EnumFilterParams<T>,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params as FilterParams, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const enumTrait = trait as EnumTrait<T>;
    return this.params.allowedValues.includes(enumTrait.value());
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    return (
      <>
        {subDescription} is one of [
        {this.params.allValuesForDebugging
          .filter((v) => {
            return this.params.allowedValues.includes(v.key);
          })
          .map((v) => v.value)
          .join(",")}
        ]
      </>
    );
  }

  id(): string {
    return `EF-${this.idBase()}-${this.params.allowedValues.join(",")}`;
  }
}

export class StringEnumFilter extends EnumFilterBase<string> {}
export class NumberEnumFilter extends EnumFilterBase<number> {}
