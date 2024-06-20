import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useState } from "react";
import { EventId, getEventName } from "@wca/helpers";
import {
  PersonalAttribute,
  ColumnType,
  ColumnParams,
  FormMetadata,
} from "./api.proto";
import { CompetitionData } from "../../types/competition_data";

interface EditPropertiesModalParams {
  id: string;
  personIds: Number[];
}

export function EditPropertiesModal({
  id,
  personIds,
}: EditPropertiesModalParams) {
  const { settings } = useRouteLoaderData("competition") as CompetitionData;

  const doSubmit = function () {};

  const disabledSubmit = false;

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Edit Applicants</h1>
          </div>
          <div className="modal-body">Coming soon!</div>
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
              onClick={doSubmit}
              disabled={disabledSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
