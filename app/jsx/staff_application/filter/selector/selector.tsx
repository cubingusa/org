import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

import { ComputerParams } from "../../trait/params";
import { createComputer } from "../../trait/create_computer";
import { TraitSelector } from "../../trait/selector";
import { getTraitApi } from "../../trait/types/traits";
import { CompetitionData } from "../../types/competition_data";
import { FilterParams } from "../types/params";

interface FilterSelectorParams {
  params: FilterParams;
  onChange: (newParams: FilterParams) => void;
  setValid: (isValid: boolean) => void;
  idBase: string;
}
export function FilterSelector({
  params,
  onChange,
  setValid,
  idBase,
}: FilterSelectorParams) {
  const [activeParams, setActiveParams] = useState(params);
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const activeComputer = createComputer(activeParams.trait, settings, wcif);
  const traitApi = getTraitApi(activeComputer.getTraitType(), wcif);
  const [localValid, setLocalValid] = useState(activeComputer.isValid());

  const onUpdateValid = function (newValid: boolean) {
    setLocalValid(newValid);
    setValid(newValid);
  };

  const onFilterChange = function (params: FilterParams) {
    setActiveParams(params);
    onChange(params);
  };

  const onTraitChange = function (trait: ComputerParams) {
    const newComputer = createComputer(trait, settings, wcif);
    const traitApi = getTraitApi(newComputer.getTraitType(), wcif);
    const newParams = traitApi.defaultFilterParams(trait, newComputer);
    setActiveParams(newParams);
    onChange(newParams);
  };

  return (
    <>
      <TraitSelector
        params={params.trait}
        onChange={onTraitChange}
        setValid={onUpdateValid}
        idBase={idBase}
      />
      {localValid
        ? traitApi.filterSelector(
            activeParams,
            activeComputer,
            onFilterChange,
            idBase,
          )
        : null}
    </>
  );
}
