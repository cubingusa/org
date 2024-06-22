import { Person, Competition } from "@wca/helpers";

import { ApplicantData } from "../types/applicant_data";
import { ApplicationSettings } from "../types/competition_data";
import { Property } from "../types/property";
import { Trait, TraitComputer } from "./api";
import { SerializedTrait } from "./serialized";
import { PropertyParams } from "./params";
import { StringTrait, NullTrait } from "./traits";

class PropertyComputer extends TraitComputer {
  constructor(
    private params: PropertyParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  getProperty(): Property | null {
    return this.settings.properties.find(
      (p) => p.id === this.params.propertyId,
    );
  }

  compute(applicant: ApplicantData): Trait {
    const property = this.getProperty();
    if (property === null) {
      return new NullTrait({});
    }
    const userProperty = applicant.user.properties.find(
      (p) => p.key === this.params.propertyId,
    );
    if (userProperty === null) {
      return new NullTrait({});
    }
    const propertyValue = property.values.find(
      (v) => v.id === userProperty.value,
    );
    if (propertyValue === null) {
      return new NullTrait({});
    }
    // TODO: switch to EnumTrait.
    return new StringTrait({ val: propertyValue.value });
  }

  id(): string {
    return `PC-${this.params.propertyId}`;
  }

  header(): JSX.Element {
    const property = this.getProperty();
    return property === null ? <>??</> : <>{property.name}</>;
  }
}
