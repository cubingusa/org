import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";

import { TraitComputer } from "../../trait/api";
import { CompetitionData } from "../../types/competition_data";
import { PersonalAttributeComputer } from "../../trait/personal_attribute";
import { ComputerParams } from "../../trait/params";
import { TraitSelector } from "../../trait/selector";

interface ColumnModalParams {
  id: string;
  addColumn: (traitParams: ComputerParams) => void;
}

export function ColumnModal({ id, addColumn }: ColumnModalParams) {
  const [params, setParams] = useState(
    PersonalAttributeComputer.defaultParams() as ComputerParams,
  );
  const [isValid, setIsValid] = useState(true);

  const onTraitChange = function (
    params: ComputerParams,
    computer: TraitComputer,
  ) {
    setParams(params);
  };

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Add Column</h1>
          </div>
          <div className="modal-body">
            <TraitSelector
              params={params}
              onChange={onTraitChange}
              setValid={setIsValid}
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
              onClick={(e) => addColumn(params)}
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
