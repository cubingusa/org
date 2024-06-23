import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { ComputerParams } from "../trait/params";
import { createComputer } from "../trait/create_computer";
import { TraitSelector } from "../trait/selector";
import { CompetitionData } from "../types/competition_data";
import { FilterParams } from "./params";

interface FilterSelectorParams {
  params: FilterParams;
  onChange: (newParams: FilterParams) => void;
  setValid: (isValid: boolean) => void;
}
export function FilterSelector({
  params,
  onChange,
  setValid,
}: FilterSelectorParams) {
  const [activeParams, setActiveParams] = useState(params);
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const activeComputer = createComputer(params.trait, settings, wcif);

  const onFilterChange = function (params: FilterParams) {
    setActiveParams(params);
    onChange(params);
  };

  const onTraitChange = function (trait: ComputerParams) {
    const newComputer = createComputer(trait, settings, wcif);
    const newParams = newComputer.defaultFilterParams();
    setActiveParams(newParams);
    onChange(newParams);
  };

  return (
    <>
      <TraitSelector
        params={params.trait}
        onChange={onTraitChange}
        setValid={setValid}
      />
      {activeComputer.filterSelector(activeParams, onFilterChange)}
    </>
  );
}
