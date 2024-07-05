import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useState } from "react";
import { EventId, getEventName } from "@wca/helpers";
import { CompetitionData } from "../types/competition_data";

interface EditPropertiesModalParams {
  id: string;
  personIds: number[];
}

export function EditPropertiesModal({
  id,
  personIds,
}: EditPropertiesModalParams) {
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [propertyId, setPropertyId] = useState(
    settings.properties.length == 0 ? 0 : settings.properties[0].id,
  );
  const property = settings.properties.find((p) => p.id == propertyId);
  const [valueId, setValueId] = useState(-1);

  const disabledSubmit =
    settings.properties.length == 0 || property == undefined;

  const propertySection =
    settings.properties.length > 0 ? (
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="property-selector" className="property=label">
            Property
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            id="property-label"
            value={propertyId}
            onChange={(e) => setPropertyId(+e.target.value)}
          >
            {settings.properties.map((p) => (
              <option value={p.id} key={"property-" + p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    ) : (
      <>You haven't created any properties for this competition.</>
    );

  const valuesSection =
    property == undefined ? (
      <>Hmm, something's gone wrong.</>
    ) : (
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="property-selector" className="property=label">
            Value
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            id="property-label"
            value={valueId}
            onChange={(e) => setValueId(+e.target.value)}
          >
            <option value={-1}>Delete property</option>
            {property.values.map(({ id, value }) => (
              <option value={id} key={"val-" + id}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    );

  const doSubmit = async function () {
    await fetch(`/staff_api/${wcif.id}/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personIds,
        propertyId,
        valueId,
      }),
    });
    window.location.reload();
  };

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Edit Applicants</h1>
          </div>
          <div className="modal-body">
            {propertySection}
            {valuesSection}
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
