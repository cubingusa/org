import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { Person, Competition } from "@wca/helpers";

import { ApplicantData } from "../types/applicant_data";
import {
  ApplicationSettings,
  CompetitionData,
} from "../types/competition_data";
import { Property } from "../types/property";
import { Trait, TraitComputer } from "./api";
import { TraitType } from "./serialized";
import { ComputerType, PropertyParams, ComputerParams } from "./params";
import { NumberEnumTrait } from "./traits";
import { TraitExtras } from "./extras";

export class PropertyComputer extends TraitComputer {
  constructor(
    private params: PropertyParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  getProperty(): Property | undefined {
    return this.settings.properties.find(
      (p) => p.id === this.params.propertyId,
    );
  }

  compute(applicant: ApplicantData): Trait {
    const property = this.getProperty();
    const propertyMap = new Map<number, string>();
    if (property === undefined) {
      return new NumberEnumTrait({
        val: null,
        extras: { allValues: propertyMap },
      });
    }
    property.values.forEach((val) => propertyMap.set(val.id, val.value));
    const userProperty = applicant.user.properties.find(
      (p) => p.key === this.params.propertyId,
    );
    if (userProperty === undefined) {
      return new NumberEnumTrait({
        val: null,
        extras: { allValues: propertyMap },
      });
    }
    return new NumberEnumTrait({
      val: userProperty.value,
      extras: {
        allValues: propertyMap,
      },
    });
  }

  id(): string {
    return `PC-${this.params.propertyId}`;
  }

  extraDataForDeserialization(): TraitExtras {
    const propertyMap = new Map<number, string>();
    this.getProperty().values.forEach((val) =>
      propertyMap.set(val.id, val.value),
    );
    return { allValues: propertyMap };
  }

  header(): JSX.Element {
    const property = this.getProperty();
    return property === undefined ? <>??</> : <>{property.name}</>;
  }

  static defaultParams(settings: ApplicationSettings): PropertyParams {
    return {
      type: ComputerType.Property,
      propertyId:
        settings.properties.length > 0 ? settings.properties[0].id : -1,
    };
  }

  getTraitType(): TraitType {
    return TraitType.NumberEnumTrait;
  }

  isValid(): boolean {
    return this.getProperty() !== undefined;
  }

  formElement(
    params: ComputerParams,
    onTraitChange: (params: ComputerParams) => void,
  ): JSX.Element {
    return (
      <PropertySelector
        params={params as PropertyParams}
        onTraitChange={onTraitChange}
      />
    );
  }
}

interface PropertySelectorParams {
  params: PropertyParams;
  onTraitChange: (params: ComputerParams) => void;
}
function PropertySelector({ params, onTraitChange }: PropertySelectorParams) {
  const [propertyId, setPropertyId] = useState(params.propertyId);
  const { settings } = useRouteLoaderData("competition") as CompetitionData;

  const updatePropertyId = function (propertyId: number) {
    setPropertyId(propertyId);
    params.propertyId = propertyId;
    onTraitChange(params);
  };

  if (settings.properties.length == 0) {
    return <>This competition does not have any properties.</>;
  }
  return (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <label htmlFor="property-selector" className="col-property-label">
          Property
        </label>
      </div>
      <div className="col-auto">
        <select
          className="form-select"
          value={propertyId}
          onChange={(e) => updatePropertyId(+e.target.value)}
        >
          {settings.properties.map((property) => (
            <option value={property.id} key={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
