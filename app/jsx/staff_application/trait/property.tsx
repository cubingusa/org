import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { Person, Competition } from "@wca/helpers";

import { FilterParams } from "../filter/types/params";
import { FilterType } from "../filter/types/base";
import {
  NumberEnumFilterParams,
  defaultNumberEnumParams,
} from "../filter/types/enum";
import { NumberEnumFilterSelector } from "../filter/selector/enum";

import { ApplicantData } from "../types/applicant_data";
import {
  ApplicationSettings,
  CompetitionData,
} from "../types/competition_data";
import { Property } from "../types/property";
import { Trait, TraitComputer } from "./api";
import { SerializedTrait } from "./serialized";
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

  defaultFilterParams(): FilterParams {
    return defaultNumberEnumParams(
      this.params,
      this.getProperty()?.values.map((v) => {
        return {
          key: v.id,
          value: v.value,
        };
      }) || [],
    );
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

  filterSelector(
    params: FilterParams | null,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element {
    return (
      <PropertyFilterSelector
        params={params}
        computerParams={this.params}
        onFilterChange={onFilterChange}
      />
    );
  }
}

interface PropertyFilterSelectorParams {
  params: FilterParams | null;
  computerParams: ComputerParams;
  onFilterChange: (params: FilterParams) => void;
}
function PropertyFilterSelector({
  params,
  computerParams,
  onFilterChange,
}: PropertyFilterSelectorParams) {
  const { settings } = useRouteLoaderData("competition") as CompetitionData;
  const map = new Map<number, string>();
  const propertyParams = computerParams as PropertyParams;
  const property = settings.properties.find(
    (p) => p.id == propertyParams.propertyId,
  );
  property.values.forEach((v) => map.set(v.id, v.value));

  return (
    <NumberEnumFilterSelector
      params={params as NumberEnumFilterParams}
      trait={computerParams}
      values={map}
      onFilterChange={onFilterChange}
    />
  );
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
