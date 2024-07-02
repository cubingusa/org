import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";

import { TraitComputer } from "../trait/api";
import { CompetitionData } from "../types/competition_data";
import { PersonalAttributeComputer } from "../trait/personal_attribute";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { defaultStringParams } from "./types/string";
import { FilterSelector } from "./selector/selector";

interface FilterModalParams {
  id: string;
  addFilter: (params: FilterParams) => void;
}

export function FilterModal({ id, addFilter }: FilterModalParams) {
  const [params, setParams] = useState(
    defaultStringParams(
      PersonalAttributeComputer.defaultParams(),
    ) as FilterParams,
  );
  const [isValid, setIsValid] = useState(true);

  const onTraitChange = function (params: FilterParams) {
    setParams(params);
  };

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Add Filter</h1>
          </div>
          <div className="modal-body">
            <FilterSelector
              params={params}
              onChange={onTraitChange}
              setValid={setIsValid}
              idBase={id}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              data-bs-dismiss="modal"
              onClick={(e) => addFilter(params)}
              disabled={!isValid}
            >
              <span className="material-symbols-outlined">add</span> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
